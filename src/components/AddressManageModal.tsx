import React, { useState, useEffect } from 'react';
import { 
  getAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  type UserAddressResponseDto, 
  type UserAddressCreateRequestDto 
} from '../lib/addresses';

interface AddressManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: UserAddressResponseDto) => void;
  selectedAddressId?: number;
}

const AddressManageModal: React.FC<AddressManageModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  selectedAddressId,
}) => {
  const [addresses, setAddresses] = useState<UserAddressResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingAddress, setEditingAddress] = useState<UserAddressResponseDto | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState<UserAddressCreateRequestDto>({
    recipient: '',
    phone: '',
    zipcode: '',
    address: '',
    addressDetail: '',
    isDefault: false,
  });

  // 배송지 목록 조회
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data);
      
      // 배송지가 없으면 자동으로 등록 모드로 전환
      if (data.length === 0) {
        setMode('create');
      }
    } catch (error: any) {
      alert(error.message || '배송지 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAddresses();
      setMode('list');
      setEditingAddress(null);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      recipient: '',
      phone: '',
      zipcode: '',
      address: '',
      addressDetail: '',
      isDefault: false,
    });
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 전화번호 입력 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  // 우편번호 검색
  const handleSearchAddress = () => {
    // Daum 우편번호 서비스
    if (typeof window !== 'undefined' && window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: DaumPostcodeData) {
          // 선택한 주소 정보를 formData에 설정
          setFormData(prev => ({
            ...prev,
            zipcode: data.zonecode,
            address: data.address,
          }));
          // 상세주소 입력 필드로 포커스 이동
          setTimeout(() => {
            const detailInput = document.getElementById('addressDetail');
            detailInput?.focus();
          }, 100);
        },
      }).open();
    }
  };

  // 생성 버튼 클릭
  const handleCreateClick = () => {
    resetForm();
    setMode('create');
  };

  // 수정 버튼 클릭
  const handleEditClick = (address: UserAddressResponseDto) => {
    setEditingAddress(address);
    setFormData({
      recipient: address.recipient,
      phone: formatPhoneNumber(address.phone), // 포맷팅 적용
      zipcode: address.zipcode,
      address: address.address,
      addressDetail: address.addressDetail || '',
      isDefault: address.isDefault,
    });
    setMode('edit');
  };

  // 배송지 저장 (생성 또는 수정)
  const handleSave = async () => {
    // 유효성 검사
    if (!formData.recipient.trim()) {
      alert('수령인을 입력해주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('연락처를 입력해주세요.');
      return;
    }
    if (!formData.zipcode.trim()) {
      alert('우편번호를 입력해주세요.');
      return;
    }
    if (!formData.address.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      let savedAddress: UserAddressResponseDto | null = null;
      const isCreating = mode === 'create';
      
      if (isCreating) {
        savedAddress = await createAddress(formData);
      } else if (mode === 'edit' && editingAddress) {
        savedAddress = await updateAddress(editingAddress.id, formData);
      }
      
      await loadAddresses();
      setMode('list');
      resetForm();
      setEditingAddress(null);
      
      // 생성된 배송지를 자동으로 선택 (모달 닫기는 onSelectAddress에서 처리)
      if (savedAddress && isCreating) {
        onSelectAddress(savedAddress);
      }
    } catch (error: any) {
      alert(error.message || '배송지 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 배송지 삭제
  const handleDelete = async (addressId: number) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteAddress(addressId);
      await loadAddresses();
    } catch (error: any) {
      alert(error.message || '배송지 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 기본 배송지로 설정
  const handleSetDefault = async (addressId: number) => {
    try {
      setLoading(true);
      await setDefaultAddress(addressId);
      await loadAddresses();
    } catch (error: any) {
      alert(error.message || '기본 배송지 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 배송지 선택
  const handleSelect = (address: UserAddressResponseDto) => {
    onSelectAddress(address);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-brand-gray-900">
            {mode === 'list' ? '배송지 선택' : mode === 'create' ? '새 배송지 등록' : '배송지 수정'}
          </h2>
          <button
            onClick={onClose}
            className="text-brand-gray-400 hover:text-brand-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {mode === 'list' ? (
            // 배송지 목록
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-brand-gray-500">
                  등록된 배송지가 없습니다.
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-brand-pink bg-brand-pinkSoft'
                        : 'border-gray-300 hover:border-brand-pink'
                    }`}
                    onClick={() => handleSelect(address)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-brand-gray-900">{address.recipient}</span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-brand-pink text-white text-xs rounded">
                              기본
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-brand-gray-700">{formatPhoneNumber(address.phone)}</p>
                        <p className="text-sm text-brand-gray-700 mt-1">
                          [{address.zipcode}] {address.address}
                          {address.addressDetail && ` ${address.addressDetail}`}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(address);
                          }}
                          className="text-sm text-brand-pink hover:text-brand-pink/80"
                        >
                          수정
                        </button>
                        {!address.isDefault && (
                          <>
                            <span className="text-brand-gray-300">|</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(address.id);
                              }}
                              className="text-sm text-brand-gray-600 hover:text-brand-gray-900"
                            >
                              기본설정
                            </button>
                            <span className="text-brand-gray-300">|</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(address.id);
                              }}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* 새 배송지 추가 버튼 */}
              <button
                onClick={handleCreateClick}
                className="w-full border-2 border-dashed border-brand-gray-300 rounded-lg p-4 text-brand-gray-600 hover:border-brand-pink hover:text-brand-pink transition-colors"
              >
                + 새 배송지 추가
              </button>
            </div>
          ) : (
            // 배송지 등록/수정 폼
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                  수령인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  maxLength={20}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  placeholder="받는 분 성함"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                  우편번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.zipcode}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-brand-gray-700"
                    placeholder="우편번호"
                  />
                  <button
                    type="button"
                    onClick={handleSearchAddress}
                    className="px-4 py-2 bg-brand-pink text-white rounded-md hover:bg-brand-pink/90 whitespace-nowrap"
                  >
                    주소 검색
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                  주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  readOnly
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-brand-gray-700"
                  placeholder="주소 검색 버튼을 클릭해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                  상세주소
                </label>
                <input
                  id="addressDetail"
                  type="text"
                  value={formData.addressDetail}
                  onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  placeholder="아파트 동호수, 건물명 등"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault || false}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-brand-gray-700">
                  기본 배송지로 설정
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setMode('list');
                    resetForm();
                    setEditingAddress(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-brand-gray-700 bg-gray-50"
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-brand-pink text-white rounded-md hover:bg-brand-pink/90 disabled:bg-gray-300"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : mode === 'create' ? '등록' : '수정'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManageModal;


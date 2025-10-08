import React, { useEffect, useMemo, useState } from 'react';
import { get, put } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import MyPageNav from '../components/MyPageNav';
import { withdraw } from '../lib/auth';

type UserInfoResponseDto = {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  createdAt?: string;
};

type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

type ChangePasswordResponseDto = {
  message?: string;
};

const Account: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfoResponseDto | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [changing, setChanging] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [resultOk, setResultOk] = useState<boolean>(false);

  // 회원탈퇴 관련 상태
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await get<UserInfoResponseDto>('/api/users/me', { credentials: 'include' });
        setUser(data);
      } catch (e: any) {
        const msg = e instanceof Error ? e.message : '내 계정 정보를 불러오지 못했습니다.';
        setError(msg);
        // Unauthorized 시 로그인 페이지로 이동 유도
        if (String(msg).includes('401')) {
          showToast({ message: '로그인이 필요합니다.' });
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, showToast]);

  const createdAtFormatted = useMemo(() => {
    const s = user?.createdAt;
    if (!s) return '-';
    // Prefer direct string parse to avoid timezone shifts
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (m) {
      const [, yy, mm, dd, hh, min] = m;
      return `${yy}년 ${mm}월 ${dd}일 ${hh}시 ${min}분`;
    }
    // Fallback to Date parsing if format changes
    try {
      // trim microseconds to milliseconds if present
      const trimmed = s.replace(/(\.\d{3})\d+/, '$1');
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) return s;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}년 ${pad(d.getMonth() + 1)}월 ${pad(d.getDate())}일 ${pad(d.getHours())}시 ${pad(d.getMinutes())}분`;
    } catch {
      return s;
    }
  }, [user]);

  const canChange = useMemo(() => {
    return (
      currentPassword.trim().length >= 1 &&
      newPassword.length >= 8 &&
      newPassword.length <= 64 &&
      newPassword === confirm &&
      !changing
    );
  }, [currentPassword, newPassword, confirm, changing]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChange) return;
    setChanging(true);
    try {
      const body: ChangePasswordRequest = { currentPassword, newPassword };
      const res = await put<ChangePasswordResponseDto>('/api/users/password', body, { credentials: 'include' });
      setResultMsg(res?.message || '비밀번호가 성공적으로 변경되었습니다.');
      setResultOk(true);
      setResultOpen(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (e: any) {
      // Extract backend message if present in error.message (e.g., API 400: {"message":"..."})
      const raw = e instanceof Error ? e.message : String(e);
      let friendly = '비밀번호 변경 중 오류가 발생했습니다.';
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        try {
          const obj = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
          if (obj && typeof obj.message === 'string' && obj.message.trim()) {
            friendly = obj.message;
          }
        } catch {}
      }
      setResultMsg(friendly);
      setResultOk(false);
      setResultOpen(true);
    } finally {
      setChanging(false);
    }
  };

  const handleWithdrawClick = () => {
    setWithdrawPassword('');
    setWithdrawModalOpen(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawPassword.trim()) {
      showToast({ message: '비밀번호를 입력해주세요.' });
      return;
    }

    setWithdrawing(true);
    try {
      const res = await withdraw(withdrawPassword);
      setWithdrawModalOpen(false);
      setResultMsg(res.message || '회원 탈퇴가 완료되었습니다. 그동안 iherbyou를 이용해 주셔서 감사합니다.');
      setResultOk(true);
      setResultOpen(true);
      
      // 3초 후 홈으로 이동
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (e: any) {
      const raw = e instanceof Error ? e.message : String(e);
      setWithdrawModalOpen(false);
      setResultMsg(raw || '회원 탈퇴 중 오류가 발생했습니다.');
      setResultOk(false);
      setResultOpen(true);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-brand-gray-900 mb-6">마이페이지 {'>'} 내 계정</h1>

        {loading ? (
          <div className="text-brand-gray-700">불러오는 중...</div>
        ) : error && !user ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            <div className="lg:row-span-2">
              <MyPageNav />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-md p-6 border">
              <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">내 정보</h2>
              <div className="space-y-2 text-sm text-brand-gray-800">
                <div className="flex justify-between"><span className="text-brand-gray-600">이메일</span><span>{user?.email || '-'}</span></div>
                <div className="flex justify-between"><span className="text-brand-gray-600">이름</span><span>{user?.name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-brand-gray-600">휴대폰</span><span>{user?.phoneNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-brand-gray-600">가입일</span><span>{createdAtFormatted}</span></div>
              </div>
              </div>

              {/* Password Card */}
              <div className="bg-white rounded-2xl shadow-md p-6 border">
              <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">비밀번호 변경</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-brand-gray-700 mb-1">현재 비밀번호</label>
                  <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" required />
                </div>
                <div>
                  <label className="block text-sm text-brand-gray-700 mb-1">새 비밀번호 (8자 이상)</label>
                  <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} minLength={8} maxLength={64} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" required />
                </div>
                <div>
                  <label className="block text-sm text-brand-gray-700 mb-1">새 비밀번호 확인</label>
                  <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} minLength={8} maxLength={64} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" required />
                </div>
                {newPassword && confirm && newPassword !== confirm && (
                  <div className="text-xs text-red-600">비밀번호가 일치하지 않습니다.</div>
                )}
                <div className="pt-2">
                  <button type="submit" disabled={!canChange} className={`px-6 py-2 rounded-md text-sm font-medium ${canChange ? 'bg-brand-green text-white hover:bg-brand-darkGreen' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>변경하기</button>
                </div>
              </form>
              </div>
            </div>

            {/* 회원탈퇴 섹션 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-red-100">
                <h2 className="text-lg font-semibold text-brand-gray-900 mb-3">회원 탈퇴</h2>
                <p className="text-sm text-brand-gray-600 mb-4">
                  탈퇴 시 다음 서비스를 더 이상 이용하실 수 없습니다:
                </p>
                <ul className="text-sm text-brand-gray-600 mb-4 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>주문 내역 및 배송 조회</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>적립금 및 쿠폰 사용</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>위시리스트 및 장바구니 저장</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>상품 리뷰 및 Q&A 작성</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>회원 전용 할인 혜택</span>
                  </li>
                </ul>
                <p className="text-xs text-red-600 mb-4">
                  ※ 탈퇴한 계정은 복구할 수 없으며, 동일한 이메일로 재가입이 제한될 수 있습니다.
                </p>
                <button
                  onClick={handleWithdrawClick}
                  className="px-4 py-2 text-sm rounded-md border border-red-500 text-red-600 bg-red-50"
                >
                  회원 탈퇴
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setWithdrawModalOpen(false)} />
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-brand-gray-900 mb-3">회원 탈퇴</h3>
              <p className="text-sm text-brand-gray-600 mb-4">
                정말로 탈퇴하시겠습니까? <br /> 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm text-brand-gray-700 mb-2">
                  비밀번호를 입력하여 본인 확인
                </label>
                <input
                  type="password"
                  value={withdrawPassword}
                  onChange={(e) => setWithdrawPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={withdrawing}
                />
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setWithdrawModalOpen(false)}
                  disabled={withdrawing}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-brand-gray-700 bg-gray-100 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleWithdrawConfirm}
                  disabled={withdrawing || !withdrawPassword.trim()}
                  className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawing ? '처리 중...' : '탈퇴하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-2xl border shadow-lg mx-auto overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center gap-2">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full ${resultOk ? 'bg-brand-green text-white' : 'bg-red-500 text-white'} flex items-center justify-center`}>
                  {resultOk ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  )}
                </div>
                {resultOk && (
                  <>
                    <svg className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 2l1.6 3.7L15 7.2l-3.4 1.5L10 12l-1.6-3.3L5 7.2l3.4-1.5L10 2z"/>
                    </svg>
                    <svg className="absolute -bottom-1 -left-1 w-3 h-3 text-pink-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 2l1.2 2.8L14 6l-2.8 1.2L10 10 8.8 7.2 6 6l2.8-1.2L10 2z"/>
                    </svg>
                  </>
                )}
              </div>
              <h2 className="text-base font-semibold text-brand-gray-900">{resultOk ? '비밀번호 변경 완료' : '비밀번호 변경 실패'}</h2>
            </div>
            <div className="px-6 py-5 text-sm text-brand-gray-800">
              <p>{resultMsg}</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={()=>setResultOpen(false)} className="px-4 py-2 rounded-md text-sm bg-brand-primary text-white hover:bg-brand-darkGreen">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;


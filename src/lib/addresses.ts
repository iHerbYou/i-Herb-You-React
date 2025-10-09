import { get, post, put, del } from './api';

// 배송지 응답 DTO
export type UserAddressResponseDto = {
  id: number;
  recipient: string;
  phone: string;
  zipcode: string;
  address: string;
  addressDetail: string | null;
  isDefault: boolean;
};

// 배송지 생성 요청 DTO
export type UserAddressCreateRequestDto = {
  recipient: string;
  phone: string;
  zipcode: string;
  address: string;
  addressDetail?: string;
  isDefault?: boolean;
};

// 배송지 수정 요청 DTO
export type UserAddressUpdateRequestDto = {
  recipient: string;
  phone: string;
  zipcode: string;
  address: string;
  addressDetail?: string;
  isDefault?: boolean;
};

// 내 배송지 목록 조회
export async function getAddresses(): Promise<UserAddressResponseDto[]> {
  return await get<UserAddressResponseDto[]>(
    '/api/users/me/addresses',
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 새 배송지 등록
export async function createAddress(data: UserAddressCreateRequestDto): Promise<UserAddressResponseDto> {
  return await post<UserAddressResponseDto>(
    '/api/users/me/addresses',
    data,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 배송지 정보 수정
export async function updateAddress(addressId: number, data: UserAddressUpdateRequestDto): Promise<UserAddressResponseDto> {
  return await put<UserAddressResponseDto>(
    `/api/users/me/addresses/${addressId}`,
    data,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 배송지 삭제
export async function deleteAddress(addressId: number): Promise<void> {
  await del<void>(
    `/api/users/me/addresses/${addressId}`,
    undefined,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 기본 배송지로 설정
export async function setDefaultAddress(addressId: number): Promise<UserAddressResponseDto> {
  return await post<UserAddressResponseDto>(
    `/api/users/me/addresses/${addressId}/default`,
    undefined,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}


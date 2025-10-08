import { get, post } from './api';
import { setAuthTokenCookie, clearAuthTokenCookie, setRefreshTokenCookie, clearRefreshTokenCookie } from './api';

export type LoginResponse = {
  email: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenExpiresIn?: number;
  message?: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
};

export type SignupResponse = {
  email: string;
  message: string;
};

function dispatchAuthChangeEvent() {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:change'));
    }
  } catch {}
}

export function isLoggedIn(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const raw = window.sessionStorage.getItem('auth');
    return !!raw;
  } catch {
    return false;
  }
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const res = await post<SignupResponse>('/api/users/signup', payload, { credentials: 'include', auth: false });
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('prefillEmail', payload.email);
    }
  } catch {}
  return res;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await post<LoginResponse>('/api/users/login', { email, password }, { credentials: 'include', auth: false });
  setAuthTokenCookie(res.accessToken, res.expiresIn);
  if (res.refreshToken) {
    setRefreshTokenCookie(res.refreshToken, res.refreshTokenExpiresIn);
  }
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('auth', JSON.stringify({ nickname: res.name || email, role: 'user' }));
    }
  } catch {}
  dispatchAuthChangeEvent();
  return res;
}

export async function logout(): Promise<void> {
  try {
    await post<{ message?: string }>('/api/users/logout', undefined, { credentials: 'include' });
  } catch {
    // ignore API errors
  }
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('auth');
      window.sessionStorage.clear(); // 모든 세션 데이터 정리
    }
  } catch {}
  clearAuthTokenCookie();
  clearRefreshTokenCookie();
  dispatchAuthChangeEvent();
}

// 디버깅/테스트용: 모든 인증 데이터 강제 정리
export function clearAllAuthData(): void {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear();
    }
  } catch {}
  clearAuthTokenCookie();
  clearRefreshTokenCookie();
  dispatchAuthChangeEvent();
}

export type PasswordResetRequestResponse = {
  message: string;
};

export type WithdrawRequestDto = {
  password: string;
};

export type WithdrawResponseDto = {
  message: string;
};

export type PasswordResetConfirmResponse = {
  message: string;
};

export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  const res = await post<PasswordResetRequestResponse>(
    '/api/users/password-reset-request',
    { email },
    { credentials: 'include', auth: false }
  );
  return res;
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<PasswordResetConfirmResponse> {
  const res = await post<PasswordResetConfirmResponse>(
    `/api/users/password-reset-confirm?token=${encodeURIComponent(token)}`,
    { newPassword },
    { credentials: 'include', auth: false }
  );
  return res;
}

export type EmailVerificationResponse = {
  message: string;
};

export async function verifyEmail(token: string): Promise<EmailVerificationResponse> {
  const res = await get<EmailVerificationResponse>(
    `/api/users/verify-email?token=${encodeURIComponent(token)}`,
    { credentials: 'include', auth: false }
  );
  return res;
}

export async function resendVerificationEmail(email: string): Promise<EmailVerificationResponse> {
  const res = await post<EmailVerificationResponse>(
    `/api/users/resend-verification?email=${encodeURIComponent(email)}`,
    undefined,
    { credentials: 'include', auth: false }
  );
  return res;
}

export async function withdraw(password: string): Promise<WithdrawResponseDto> {
  
  const res = await post<WithdrawResponseDto>(
    '/api/users/withdraw',
    { password },
    { credentials: 'include', auth: true }
  );
  
  // 회원탈퇴 성공 시 인증 데이터 정리
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('auth');
      window.sessionStorage.clear();
    }
  } catch {}
  clearAuthTokenCookie();
  clearRefreshTokenCookie();
  dispatchAuthChangeEvent();
  
  return res;
}
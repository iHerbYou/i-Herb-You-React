import { post } from './api';
import { setAuthTokenCookie, clearAuthTokenCookie } from './api';

export type LoginResponse = {
  email: string;
  name: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
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
    }
  } catch {}
  clearAuthTokenCookie();
  dispatchAuthChangeEvent();
}


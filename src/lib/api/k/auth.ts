import { apiClient } from './client';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  User,
} from '@/types/auth';

// 회원가입
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

// 로그인
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
};

// 로그아웃
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

// 토큰 재발급
export const refreshToken = async (refreshToken: string): Promise<RefreshResponse> => {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

// 내 정보 조회
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

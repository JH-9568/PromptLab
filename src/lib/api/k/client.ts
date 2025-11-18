import axios from 'axios';

// 환경변수에서 API Base URL 가져오기
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const baseConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// 인증이 필요한 기본 클라이언트
export const apiClient = axios.create({
  ...baseConfig,
  withCredentials: true,
});

// 공개용 클라이언트 (쿠키 없이)
export const publicApiClient = axios.create({
  ...baseConfig,
  withCredentials: false,
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 (인증 실패) 처리
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리 (나중에 refresh 로직 추가 가능)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }

    return Promise.reject(error);
  }
);

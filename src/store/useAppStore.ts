import { create } from 'zustand';
import type { User } from '@/types/auth';
import * as authApi from '@/lib/api/k/auth';

interface AppState {
  // 인증 관련
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  // 기존 상태
  selectedPromptId: number | null;
  selectedCategoryCode: string | null;
  searchQuery: string;
  draftPromptContent: string;
  favoriteVersions: Record<number, boolean>;

  // 인증 액션
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userid: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;

  // 기존 액션
  setSelectedPromptId: (promptId: number | null) => void;
  setSelectedCategoryCode: (categoryCode: string | null) => void;
  setSearchQuery: (query: string) => void;
  setDraftPromptContent: (content: string) => void;
  setFavoriteStatus: (versionId: number, starred: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 초기 상태
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  selectedPromptId: null,
  selectedCategoryCode: null,
  searchQuery: '',
  draftPromptContent: '',
  favoriteVersions: {},

  // 로그인
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      // 토큰 저장
      localStorage.setItem('access_token', response.access_token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      set({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.access_token,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // 회원가입
  register: async (email: string, password: string, userid: string, displayName: string) => {
    try {
      const response = await authApi.register({
        email,
        password,
        userid,
        display_name: displayName,
      });

      // 토큰 저장
      localStorage.setItem('access_token', response.access_token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      set({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.access_token,
      });
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        selectedPromptId: null,
      });
    }
  },

  // 자동 로그인 (앱 시작 시 토큰 확인)
  initializeAuth: async () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token) {
      try {
        // 토큰으로 사용자 정보 다시 가져오기
        const user = await authApi.getMe();

        set({
          isAuthenticated: true,
          user,
          accessToken: token,
        });
      } catch (error) {
        // 토큰이 유효하지 않으면 로그아웃 처리
        console.error('Token validation failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
        });
      }
    } else if (userStr) {
      // 토큰은 없지만 user 정보는 남아있는 경우 정리
      localStorage.removeItem('user');
    }
  },

  // 사용자 정보 설정
  setUser: (user: User | null) => set({ user }),

  // 토큰 설정
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    set({
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
    });
  },

  // 기존 액션
  setSelectedPromptId: (selectedPromptId) => set({ selectedPromptId }),
  setSelectedCategoryCode: (selectedCategoryCode) => set({ selectedCategoryCode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setDraftPromptContent: (draftPromptContent) => set({ draftPromptContent }),
  setFavoriteStatus: (versionId, starred) =>
    set((state) => {
      const updated = { ...state.favoriteVersions };
      if (starred) {
        updated[versionId] = true;
      } else {
        delete updated[versionId];
      }
      localStorage.setItem('favorite_version_ids', JSON.stringify(Object.keys(updated)));
      return { favoriteVersions: updated };
    }),
}));

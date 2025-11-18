import { create } from 'zustand';
import type { Prompt } from '@/lib/mock-data';
import type { PromptCategory } from '@/types/navigation';
import type { User } from '@/types/auth';
import type {
  UserProfile,
  UserPromptsResponse,
  UserFavoritesResponse,
  UserForksResponse,
  UserActivityResponse,
} from '@/types/user';
import * as authApi from '@/lib/api/k/auth';
import * as userApi from '@/lib/api/k/user';

interface AppState {
  // 인증 관련
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  // 프로필 관련 (다른 사용자 프로필 조회용)
  viewedProfile: UserProfile | null;
  userPrompts: UserPromptsResponse | null;
  userFavorites: UserFavoritesResponse | null;
  userForks: UserForksResponse | null;
  userActivity: UserActivityResponse | null;

  // 기존 상태
  selectedPrompt?: Prompt;
  selectedCategory: PromptCategory;
  searchQuery: string;

  // 인증 액션
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userid: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  completeOAuthLogin: (accessToken: string, user: User) => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;

  // 프로필 액션
  fetchUserProfile: (userid: string) => Promise<void>;
  updateUserProfile: (userid: string, data: { display_name?: string; bio?: string; email?: string; profile_image_url?: string }) => Promise<void>;
  fetchUserPrompts: (userid: string, page?: number) => Promise<void>;
  fetchUserFavorites: (userid: string, page?: number) => Promise<void>;
  fetchUserForks: (userid: string, page?: number) => Promise<void>;
  fetchUserActivity: (userid: string, page?: number) => Promise<void>;

  // 기존 액션
  setSelectedPrompt: (prompt?: Prompt) => void;
  setSelectedCategory: (category: PromptCategory) => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 초기 상태
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,

  // 프로필 초기 상태
  viewedProfile: null,
  userPrompts: null,
  userFavorites: null,
  userForks: null,
  userActivity: null,

  selectedPrompt: undefined,
  selectedCategory: 'Dev',
  searchQuery: '',

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
        selectedPrompt: undefined,
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

  // OAuth 로그인 완료
  completeOAuthLogin: (accessToken: string, user: User) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    set({
      isAuthenticated: true,
      user,
      accessToken,
    });
  },

  // 프로필 조회
  fetchUserProfile: async (userid: string) => {
    try {
      const profile = await userApi.getProfile(userid);
      set({ viewedProfile: profile });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  // 프로필 수정
  updateUserProfile: async (
    userid: string,
    data: { display_name?: string; bio?: string; email?: string; profile_image_url?: string }
  ) => {
    try {
      const updatedProfile = await userApi.updateProfile(userid, data);

      // viewedProfile 업데이트
      set({ viewedProfile: updatedProfile });

      // 본인 프로필인 경우 user 정보도 업데이트
      const currentUser = get().user;
      if (currentUser && currentUser.userid === userid) {
        set({
          user: {
            ...currentUser,
            display_name: updatedProfile.display_name,
            email: updatedProfile.email || currentUser.email,
            profile_image_url: updatedProfile.profile_image_url,
          },
        });
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...currentUser,
            display_name: updatedProfile.display_name,
            email: updatedProfile.email || currentUser.email,
            profile_image_url: updatedProfile.profile_image_url,
          })
        );
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  // 사용자 프롬프트 목록 조회
  fetchUserPrompts: async (userid: string, page = 1) => {
    try {
      const prompts = await userApi.getUserPrompts(userid, { page, limit: 20, sort: 'recent' });
      set({ userPrompts: prompts });
    } catch (error) {
      console.error('Failed to fetch user prompts:', error);
      throw error;
    }
  },

  // 즐겨찾기 목록 조회
  fetchUserFavorites: async (userid: string, page = 1) => {
    try {
      const favorites = await userApi.getUserFavorites(userid, { page, limit: 20, sort: 'recent' });
      set({ userFavorites: favorites });
    } catch (error) {
      console.error('Failed to fetch user favorites:', error);
      throw error;
    }
  },

  // 포크 목록 조회
  fetchUserForks: async (userid: string, page = 1) => {
    try {
      const forks = await userApi.getUserForks(userid, { page, limit: 20, sort: 'recent' });
      set({ userForks: forks });
    } catch (error) {
      console.error('Failed to fetch user forks:', error);
      throw error;
    }
  },

  // 활동 로그 조회
  fetchUserActivity: async (userid: string, page = 1) => {
    try {
      const activity = await userApi.getUserActivity(userid, { page, limit: 20, sort: 'recent' });
      set({ userActivity: activity });
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      throw error;
    }
  },

  // 기존 액션
  setSelectedPrompt: (selectedPrompt) => set({ selectedPrompt }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

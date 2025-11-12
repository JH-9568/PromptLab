import { create } from 'zustand';
import type { Prompt } from '@/lib/mock-data';
import type { PromptCategory } from '@/types/navigation';

interface AppState {
  isAuthenticated: boolean;
  selectedPrompt?: Prompt;
  selectedCategory: PromptCategory;
  searchQuery: string;
  login: () => void;
  logout: () => void;
  setSelectedPrompt: (prompt?: Prompt) => void;
  setSelectedCategory: (category: PromptCategory) => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  selectedPrompt: undefined,
  selectedCategory: 'Dev',
  searchQuery: '',
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false, selectedPrompt: undefined }),
  setSelectedPrompt: (selectedPrompt) => set({ selectedPrompt }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

// Hooks関連の型定義
// カスタムフックの戻り値型や引数型

import type { GitHubFile } from './api';

export interface UseGitHubApiReturn {
  // States
  isLoading: boolean;
  error: string;
  
  // Actions  
  fetchRepository: (url: string) => Promise<GitHubFile[]>;
  clearError: () => void;
}
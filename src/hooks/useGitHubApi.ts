// hooks/useGitHubApi.ts
// GitHub API関連処理の専用カスタムフック - useFileManagement.tsから抽出

import { useState, useCallback } from 'react';
import { 
  fetchRepoStructureRecursive, 
  extractDependencies
} from '../services/githubApi';
import type { GitHubFile, UseGitHubApiReturn } from '../types';
import { countLines, isCodeFile } from '../utils/fileUtils';

// UseGitHubApiReturn型は src/types/hooks.ts に移行

export const useGitHubApi = (): UseGitHubApiReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // GitHub APIからファイルを変換する共通処理
  const convertGitHubToGitHubFile = async (
    githubFiles: GitHubFile[]
  ): Promise<GitHubFile[]> => {
    console.log(`📊 ${githubFiles.length}個のファイルの依存関係を解析中...`);

    const GitHubFilePromises = githubFiles.map(async (file, index) => {
      let dependencies: string[] = [];
      let lineCount: number | undefined = undefined;
      
      // ファイルの場合は行数をカウント
      if (file.type === 'file' && file.content) {
        lineCount = countLines(file.content);
      }
      
      // 依存関係の解析（コードファイルのみ）
      if (file.content && isCodeFile(file.name) && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
        try {
          dependencies = extractDependencies(file.content, file.path);
          console.log(`✅ ${file.name}: ${dependencies.length}個の依存関係, ${lineCount}行`);
        } catch (error) {
          console.warn(`⚠️ ${file.name}: 依存関係の抽出でエラー`, error);
        }
      }

      return {
        ...file,
        id: index + 1,
        dependencies,
        lineCount,
      };
    });

    const GitHubFile = await Promise.all(GitHubFilePromises);
    return GitHubFile;
  };

  // GitHub リポジトリを取得する処理
  const fetchRepository = useCallback(async (url: string): Promise<GitHubFile[]> => {
    console.log('GitHub URL:', url);
    setError('');
    setIsLoading(true);

    try {
      const githubFiles = await fetchRepoStructureRecursive(url, '', 0, 3);
      console.log(`📁 ${githubFiles.length}個のファイルを取得`);

      if (githubFiles.length === 0) {
        throw new Error('ファイルが見つかりませんでした');
      }

      const GitHubFile = await convertGitHubToGitHubFile(githubFiles);
      console.log(`✅ ${GitHubFile.length}個のファイルを表示`);
      
      return GitHubFile;
    } catch (err) {
      console.error('GitHub API エラー:', err);
      const errorMessage = err instanceof Error ? err.message : 'ファイルの取得に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // エラー状態をクリアする
  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    // States
    isLoading,
    error,
    
    // Actions
    fetchRepository,
    clearError,
  };
};
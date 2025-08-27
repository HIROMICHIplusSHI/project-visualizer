// hooks/useFileStorage.ts
// プロジェクトファイル用localStorage管理 - useFileManagement.tsから抽出

import { useState, useEffect, useCallback } from 'react';
import type { GitHubFile } from '../services/githubApi';

interface UseFileStorageReturn {
  // States
  files: GitHubFile[];
  repoUrl: string;
  recentUrls: string[];
  
  // Actions
  setFiles: (files: GitHubFile[]) => void;
  setRepoUrl: (url: string) => void;
  addRecentUrl: (url: string) => void;
  setRecentUrls: (urls: string[]) => void;
  clearAll: () => void;
}

export const useFileStorage = (): UseFileStorageReturn => {
  // localStorage から初期状態を復元
  const [files, setFilesState] = useState<GitHubFile[]>(() => {
    try {
      const saved = localStorage.getItem('project-visualizer-files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [repoUrl, setRepoUrlState] = useState<string>(() => {
    return localStorage.getItem('project-visualizer-repoUrl') || '';
  });
  
  const [recentUrls, setRecentUrlsState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentUrls');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ファイル状態変更時に localStorage に保存
  useEffect(() => {
    try {
      localStorage.setItem('project-visualizer-files', JSON.stringify(files));
    } catch (error) {
      console.warn('Failed to save files to localStorage:', error);
    }
  }, [files]);

  // URL状態変更時に localStorage に保存
  useEffect(() => {
    try {
      localStorage.setItem('project-visualizer-repoUrl', repoUrl);
    } catch (error) {
      console.warn('Failed to save repoUrl to localStorage:', error);
    }
  }, [repoUrl]);

  // 最近のURL履歴変更時に localStorage に保存
  useEffect(() => {
    try {
      localStorage.setItem('recentUrls', JSON.stringify(recentUrls));
    } catch (error) {
      console.warn('Failed to save recentUrls to localStorage:', error);
    }
  }, [recentUrls]);

  // ファイル設定（外部から制御可能）
  const setFiles = useCallback((newFiles: GitHubFile[]) => {
    setFilesState(newFiles);
  }, []);

  // リポジトリURL設定
  const setRepoUrl = useCallback((url: string) => {
    setRepoUrlState(url);
  }, []);

  // 最近のURL設定（外部から制御可能）
  const setRecentUrls = useCallback((urls: string[]) => {
    setRecentUrlsState(urls);
  }, []);

  // URLを履歴に追加（重複防止）
  const addRecentUrl = useCallback((url: string) => {
    setRecentUrlsState((prev) => {
      const newUrls = [url, ...prev.filter((u) => u !== url)].slice(0, 3);
      return newUrls;
    });
  }, []);

  // すべての状態とlocalStorageをクリア
  const clearAll = useCallback(() => {
    setFilesState([]);
    setRepoUrlState('');
    setRecentUrlsState([]);
    
    // localStorage もクリア
    try {
      localStorage.removeItem('project-visualizer-files');
      localStorage.removeItem('project-visualizer-repoUrl');
      localStorage.removeItem('recentUrls');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }, []);

  return {
    // States
    files,
    repoUrl,
    recentUrls,
    
    // Actions
    setFiles,
    setRepoUrl,
    addRecentUrl,
    setRecentUrls,
    clearAll,
  };
};
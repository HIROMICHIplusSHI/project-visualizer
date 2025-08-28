// hooks/useFileManagement.ts
// 統合ファイル管理フック - 分離された専門フックを統合

import { useCallback } from 'react';

// 分離されたフックをインポート
import { useGitHubApi } from './useGitHubApi';
import { useLocalFiles } from './useLocalFiles';
import { useDirectoryApi } from './useDirectoryApi';
import { useFileStorage } from './useFileStorage';

export const useFileManagement = () => {
  // 各専門フックを初期化
  const githubApi = useGitHubApi();
  const localFiles = useLocalFiles();
  const directoryApi = useDirectoryApi();
  const fileStorage = useFileStorage();

  // 統合されたエラー状態 - いずれかのフックでエラーがあれば表示
  const error = githubApi.error || localFiles.error || directoryApi.error;
  
  // 統合されたローディング状態 - いずれかのフックがローディング中なら表示
  const isLoading = githubApi.isLoading || localFiles.isLoading || directoryApi.isLoading;

  // 統合されたURL処理
  const handleURLSubmit = useCallback(async (url: string) => {
    // まず各フックのエラーをクリア
    githubApi.clearError();
    localFiles.clearError();
    directoryApi.clearError();
    
    // repoUrlを設定
    fileStorage.setRepoUrl(url);
    
    try {
      const files = await githubApi.fetchRepository(url);
      fileStorage.setFiles(files);
      fileStorage.addRecentUrl(url); // 成功時のみURL履歴に追加
    } catch (err) {
      // エラーは各フックで管理されているのでここでは何もしない
      console.error('URL処理エラー:', err);
    }
  }, [githubApi, fileStorage, localFiles, directoryApi]);

  // 統合されたローカルファイル処理
  const handleLocalFolder = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    // エラーをクリア
    githubApi.clearError();
    localFiles.clearError();
    directoryApi.clearError();
    
    try {
      const files = await localFiles.loadLocalFolder(event);
      fileStorage.setFiles(files);
    } catch (err) {
      console.error('ローカルファイル処理エラー:', err);
    }
  }, [localFiles, fileStorage, githubApi, directoryApi]);

  // 統合されたディレクトリピッカー処理
  const handleDirectoryPicker = useCallback(async (): Promise<any> => {
    // エラーをクリア
    githubApi.clearError();
    localFiles.clearError();
    directoryApi.clearError();
    
    try {
      const result = await directoryApi.selectDirectory();
      if (result) {
        fileStorage.setFiles(result.files);
        return result.dirHandle;
      }
      return null;
    } catch (err) {
      console.error('Directory picker処理エラー:', err);
      return null;
    }
  }, [directoryApi, fileStorage, githubApi, localFiles]);

  return {
    // States from fileStorage
    files: fileStorage.files,
    setFiles: fileStorage.setFiles,
    repoUrl: fileStorage.repoUrl,
    recentUrls: fileStorage.recentUrls,
    setRecentUrls: fileStorage.setRecentUrls,
    
    // Integrated states
    error,
    isLoading,

    // Actions
    handleURLSubmit,
    handleLocalFolder,
    handleDirectoryPicker,
    clearAll: fileStorage.clearAll,
  };
};
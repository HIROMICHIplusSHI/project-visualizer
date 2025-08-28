// hooks/useLocalFiles.ts
// 従来のFile APIを使ったローカルファイル処理 - useFileManagement.tsから抽出

import { useState, useCallback } from 'react';
import { extractDependencies, type GitHubFile } from '../services/githubApi';
import { countLines } from '../utils/fileUtils';

interface UseLocalFilesReturn {
  // States
  isLoading: boolean;
  error: string;
  
  // Actions
  loadLocalFolder: (event: React.ChangeEvent<HTMLInputElement>) => Promise<GitHubFile[]>;
  clearError: () => void;
}

export const useLocalFiles = (): UseLocalFilesReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // ローカルフォルダを処理する（従来のwebkitdirectory使用）
  const loadLocalFolder = useCallback(async (event: React.ChangeEvent<HTMLInputElement>): Promise<GitHubFile[]> => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      throw new Error('ファイルが選択されていません');
    }

    setError('');
    setIsLoading(true);

    try {
      const GitHubFile: GitHubFile[] = [];
      let packageJsonContent = null;

      // package.jsonを先に読み込む
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name === 'package.json') {
          const content = await file.text();
          packageJsonContent = JSON.parse(content);
          break;
        }
      }

      console.log('📦 依存関係情報:', packageJsonContent?.dependencies);

      let processedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath || file.name;

        // 除外パターンをチェック
        if (
          relativePath.includes('node_modules') ||
          relativePath.includes('.git') ||
          relativePath.includes('dist') ||
          relativePath.includes('build') ||
          file.name.startsWith('.')
        ) {
          continue;
        }

        // 対象ファイル拡張子のみ処理
        if (file.name.match(/\.(tsx?|jsx?|json)$/)) {
          try {
            const content = await file.text();
            let dependencies: string[] = [];

            // TypeScript/JavaScript ファイルの依存関係解析
            if (file.name.match(/\.(tsx?|jsx?)$/)) {
              try {
                dependencies = extractDependencies(content, relativePath);
                console.log(`✅ ${file.name}: ${dependencies.length}個の依存関係`);
              } catch (error) {
                console.warn(`⚠️ ${file.name}: 解析エラー`, error);
              }
            }

            processedCount++;
            GitHubFile.push({
              id: processedCount,
              name: file.name,
              path: relativePath,
              type: 'file' as const,
              content,
              size: file.size,
              dependencies,
              lineCount: countLines(content),
            });
          } catch (error) {
            console.warn(`❌ ${file.name}: 読み込みエラー`, error);
          }
        }
      }

      console.log(`✅ ${GitHubFile.length}個のファイルを表示`);
      return GitHubFile;
    } catch (err) {
      console.error('ローカルファイル読み込みエラー:', err);
      const errorMessage = err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました';
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
    loadLocalFolder,
    clearError,
  };
};
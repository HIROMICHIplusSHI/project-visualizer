// hooks/useDirectoryApi.ts
// Directory Picker APIを使った高速ディレクトリアクセス処理 - useFileManagement.tsから抽出

import { useState, useCallback } from 'react';
import { extractDependencies, type GitHubFile } from '../services/githubApi';
import { countLines } from '../utils/fileUtils';

interface ProcessingStats {
  total: number;
  processed: number;
  skipped: number;
  errors: number;
}

interface UseDirectoryApiReturn {
  // States
  isLoading: boolean;
  error: string;
  
  // Actions
  selectDirectory: () => Promise<{ files: GitHubFile[]; dirHandle: any } | null>;
  clearError: () => void;
  
  // Utilities
  isSupported: () => boolean;
}

export const useDirectoryApi = (): UseDirectoryApiReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Directory Picker API サポートの確認
  const isSupported = useCallback(() => {
    return 'showDirectoryPicker' in window;
  }, []);

  // 再帰的にディレクトリを処理する内部関数
  const processDirectory = async (
    dirHandle: any, 
    basePath = '', 
    stats: ProcessingStats,
    fileId: { current: number }
  ): Promise<GitHubFile[]> => {
    const GitHubFile: GitHubFile[] = [];
    
    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath = basePath ? `${basePath}/${name}` : name;
      
      // 除外パターンをチェック
      if (name.startsWith('.') || 
          ['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', 'coverage'].includes(name)) {
        stats.skipped++;
        continue;
      }

      if (handle.kind === 'directory') {
        // 再帰的にサブディレクトリを処理
        const subFiles = await processDirectory(handle, fullPath, stats, fileId);
        GitHubFile.push(...subFiles);
      } else if (handle.kind === 'file') {
        stats.total++;
        
        // 対象ファイル拡張子のみ処理
        if (name.match(/\.(tsx?|jsx?|json|md)$/)) {
          try {
            const file = await handle.getFile();
            let content = '';
            let dependencies: string[] = [];
            
            // 1MB以下のファイルのみ読み込み
            if (file.size < 1024 * 1024) {
              content = await file.text();
              
              // TypeScript/JavaScript ファイルの依存関係解析
              if (name.match(/\.(tsx?|jsx?)$/)) {
                dependencies = extractDependencies(content, fullPath);
              }
            }

            stats.processed++;
            GitHubFile.push({
              id: fileId.current++,
              name,
              path: fullPath,
              type: 'file' as const,
              content,
              size: file.size,
              dependencies,
              lineCount: countLines(content),
            });

            // package.json の情報を表示（初回のみ）
            if (name === 'package.json' && content) {
              try {
                const pkgData = JSON.parse(content);
                const pkgName = pkgData.name || 'Unknown';
                if (pkgData.description) {
                  console.log(`📚 ${pkgName}: ${pkgData.description}`);
                }
              } catch (error) {
                console.warn('package.json の解析に失敗:', error);
              }
            }
          } catch (error) {
            stats.errors++;
            console.warn(`❌ ${name}: 読み込みエラー`, error);
          }
        } else {
          stats.skipped++;
        }
      }
    }
    
    return GitHubFile;
  };

  // ディレクトリ選択処理
  const selectDirectory = useCallback(async (): Promise<{ files: GitHubFile[]; dirHandle: any } | null> => {
    if (!isSupported()) {
      alert('このブラウザではDirectory Picker APIがサポートされていません。ChromeまたはEdgeをお使いください。');
      return null;
    }

    // ページが隠れている状態では実行しない
    if (document.hidden || document.visibilityState === 'hidden') {
      console.warn('Directory picker called while page is hidden');
      return null;
    }

    setError('');
    setIsLoading(true);

    try {
      // @ts-expect-error - showDirectoryPicker is not in TypeScript definitions yet
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read'
      });
      
      const stats: ProcessingStats = {
        total: 0,
        processed: 0,
        skipped: 0,
        errors: 0,
      };

      const fileId = { current: 1 };
      const GitHubFile = await processDirectory(dirHandle, '', stats, fileId);

      console.log(`✅ ${GitHubFile.length}個のファイルを表示`);
      console.log(`📊 処理統計 - 総数:${stats.total} 処理:${stats.processed} 除外:${stats.skipped} エラー:${stats.errors}`);
      
      return { files: GitHubFile, dirHandle };
    } catch (err) {
      console.error('Directory picker エラー:', err);
      
      // ユーザーキャンセル以外はエラー表示
      if (err instanceof Error && err.name !== 'AbortError') {
        const errorMessage = `ディレクトリの読み込みに失敗しました: ${err.message}`;
        setError(errorMessage);
      }
      
      return null;
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
    selectDirectory,
    clearError,
    
    // Utilities
    isSupported,
  };
};
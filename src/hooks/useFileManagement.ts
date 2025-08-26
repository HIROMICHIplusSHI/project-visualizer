import { useState, useEffect } from 'react';
import { 
  fetchRepoStructureRecursive, 
  extractDependencies,
  type GitHubFile 
} from '../services/githubApi';

export const useFileManagement = () => {
  // localStorage から初期状態を復元
  const [files, setFiles] = useState<GitHubFile[]>(() => {
    try {
      const saved = localStorage.getItem('project-visualizer-files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [repoUrl, setRepoUrl] = useState<string>(() => {
    return localStorage.getItem('project-visualizer-repoUrl') || '';
  });
  
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentUrls, setRecentUrls] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentUrls');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 状態変更時に localStorage に保存
  useEffect(() => {
    try {
      localStorage.setItem('project-visualizer-files', JSON.stringify(files));
    } catch (error) {
      console.warn('Failed to save files to localStorage:', error);
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem('project-visualizer-repoUrl', repoUrl);
    } catch (error) {
      console.warn('Failed to save repoUrl to localStorage:', error);
    }
  }, [repoUrl]);

  const convertGitHubToGitHubFile = async (
    githubFiles: GitHubFile[]
  ): Promise<GitHubFile[]> => {
    console.log(`📊 ${githubFiles.length}個のファイルの依存関係を解析中...`);

    const GitHubFilePromises = githubFiles.map(async (file, index) => {
      let dependencies: string[] = [];
      
      if (file.content && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
        try {
          dependencies = extractDependencies(file.content, file.path);
          console.log(`✅ ${file.name}: ${dependencies.length}個の依存関係`);
        } catch (error) {
          console.warn(`⚠️ ${file.name}: 依存関係の抽出でエラー`, error);
        }
      }

      return {
        ...file,
        id: index + 1,
        dependencies,
      };
    });

    const GitHubFile = await Promise.all(GitHubFilePromises);
    return GitHubFile;
  };

  const handleURLSubmit = async (url: string) => {
    console.log('GitHub URL:', url);
    setRepoUrl(url);
    setError('');
    setIsLoading(true);

    try {
      const githubFiles = await fetchRepoStructureRecursive(url, '', 0, 3);
      console.log(`📁 ${githubFiles.length}個のファイルを取得`);

      if (githubFiles.length === 0) {
        setError('ファイルが見つかりませんでした');
        setIsLoading(false);
        return;
      }

      const GitHubFile = await convertGitHubToGitHubFile(githubFiles);
      setFiles(GitHubFile);

      // URL履歴に追加（重複防止）
      setRecentUrls((prev) => {
        const newUrls = [url, ...prev.filter((u) => u !== url)].slice(0, 3);
        localStorage.setItem('recentUrls', JSON.stringify(newUrls));
        return newUrls;
      });

      console.log(`✅ ${GitHubFile.length}個のファイルを表示`);
    } catch (err) {
      console.error('GitHub API エラー:', err);
      setError(err instanceof Error ? err.message : 'ファイルの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalFolder = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

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

        if (
          relativePath.includes('node_modules') ||
          relativePath.includes('.git') ||
          relativePath.includes('dist') ||
          relativePath.includes('build') ||
          file.name.startsWith('.')
        ) {
          continue;
        }

        if (file.name.match(/\.(tsx?|jsx?|json)$/)) {
          try {
            const content = await file.text();
            let dependencies: string[] = [];

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
            });
          } catch (error) {
            console.warn(`❌ ${file.name}: 読み込みエラー`, error);
          }
        }
      }

      setFiles(GitHubFile);
      console.log(`✅ ${GitHubFile.length}個のファイルを表示`);
    } catch (err) {
      console.error('ローカルファイル読み込みエラー:', err);
      setError(err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectoryPicker = async (): Promise<any> => {
    if (!('showDirectoryPicker' in window)) {
      alert('このブラウザではDirectory Picker APIがサポートされていません。ChromeまたはEdgeをお使いください。');
      return null;
    }

    // Check if we're in a valid navigation state
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
      
      const GitHubFile: GitHubFile[] = [];
      let fileId = 1;

      const stats = {
        total: 0,
        processed: 0,
        skipped: 0,
        errors: 0,
      };

      const processDirectory = async (dirHandle: any, basePath = '') => {
        for await (const [name, handle] of dirHandle.entries()) {
          const fullPath = basePath ? `${basePath}/${name}` : name;
          
          if (name.startsWith('.') || 
              ['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', 'coverage'].includes(name)) {
            stats.skipped++;
            continue;
          }

          if (handle.kind === 'directory') {
            await processDirectory(handle, fullPath);
          } else if (handle.kind === 'file') {
            stats.total++;
            
            if (name.match(/\.(tsx?|jsx?|json|md)$/)) {
              try {
                const file = await handle.getFile();
                let content = '';
                let dependencies: string[] = [];
                
                if (file.size < 1024 * 1024) { // 1MB以下のファイルのみ読み込み
                  content = await file.text();
                  
                  if (name.match(/\.(tsx?|jsx?)$/)) {
                    dependencies = extractDependencies(content, fullPath);
                  }
                }

                stats.processed++;
                GitHubFile.push({
                  id: fileId++,
                  name,
                  path: fullPath,
                  type: 'file' as const,
                  content,
                  size: file.size,
                  dependencies,
                });

                // パッケージ情報を表示（初回のみ）
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
      };

      await processDirectory(dirHandle);

      setFiles(GitHubFile);
      console.log(`✅ ${GitHubFile.length}個のファイルを表示`);
      return dirHandle; // ディレクトリハンドルを返す
    } catch (err) {
      console.error('Directory picker エラー:', err);
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(`ディレクトリの読み込みに失敗しました: ${err.message}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setRepoUrl('');
    setError('');
    setIsLoading(false);
    
    // localStorage もクリア
    try {
      localStorage.removeItem('project-visualizer-files');
      localStorage.removeItem('project-visualizer-repoUrl');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  };

  return {
    // States
    files,
    setFiles,
    repoUrl,
    error,
    isLoading,
    recentUrls,
    setRecentUrls,

    // Actions
    handleURLSubmit,
    handleLocalFolder,
    handleDirectoryPicker,
    clearAll,
  };
};
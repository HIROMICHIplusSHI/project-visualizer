import { useState, useRef, useEffect } from 'react';
import { extractDependencies, type GitHubFile } from '../services/githubApi';

export const useRealtimeMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [currentDirHandle, setCurrentDirHandle] = useState<any>(null);
  const monitorIntervalRef = useRef<number | null>(null);
  const filesRef = useRef<GitHubFile[]>([]);

  const scanDirectory = async (dirHandle: any, basePath = ''): Promise<GitHubFile[]> => {
    const GitHubFile: GitHubFile[] = [];
    let fileId = 1;

    const processDirectory = async (dirHandle: any, basePath = '') => {
      // @ts-expect-error - values() method exists on directory handles
      for await (const [name, handle] of dirHandle.entries()) {
        const fullPath = basePath ? `${basePath}/${name}` : name;
        
        if (name.startsWith('.') || 
            ['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', 'coverage'].includes(name)) {
          continue;
        }

        if (handle.kind === 'directory') {
          await processDirectory(handle, fullPath);
        } else if (handle.kind === 'file') {
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

              GitHubFile.push({
                id: fileId++,
                name,
                path: fullPath,
                content,
                size: file.size,
                dependencies,
              });
            } catch (error) {
              console.warn(`❌ ${name}: 読み込みエラー`, error);
            }
          }
        }
      }
    };

    await processDirectory(dirHandle, basePath);
    return GitHubFile;
  };

  const checkForChanges = async (setFiles: (files: GitHubFile[]) => void) => {
    if (!currentDirHandle || !isMonitoring) return;

    // TODO(human) - Add console.log statements here to debug file state changes

    try {
      const GitHubFile = await scanDirectory(currentDirHandle);
      const oldFiles = filesRef.current;
      let hasChanges = false;

      // 初回は比較しない
      if (oldFiles.length === 0) {
        filesRef.current = GitHubFile;
        return;
      }

      console.log(
        `ファイル数: 旧=${oldFiles.length}, 新=${GitHubFile.length}`
      );

      if (GitHubFile.length !== oldFiles.length) {
        hasChanges = true;
        console.log('📊 ファイル数の変更を検出');
      } else {
        for (let i = 0; i < GitHubFile.length; i++) {
          const newFile = GitHubFile[i];
          const oldFile = oldFiles.find((f) => f.name === newFile.name);

          if (!oldFile) {
            hasChanges = true;
            console.log(`➕ 新しいファイル: ${newFile.name}`);
            break;
          }

          if (oldFile.size !== newFile.size) {
            hasChanges = true;
            console.log(
              `📝 サイズ変更: ${newFile.name} (${oldFile.size} → ${newFile.size})`
            );
            break;
          }

          if (
            oldFile.dependencies?.length !== newFile.dependencies?.length ||
            !oldFile.dependencies?.every((dep, idx) => dep === newFile.dependencies?.[idx])
          ) {
            hasChanges = true;
            console.log(`🔗 依存関係変更: ${newFile.name}`);
            break;
          }
        }

        // 削除されたファイルをチェック
        for (const oldFile of oldFiles) {
          if (!GitHubFile.find((f) => f.name === oldFile.name)) {
            hasChanges = true;
            console.log(`➖ ファイル削除: ${oldFile.name}`);
            break;
          }
        }
      }

      if (hasChanges) {
        console.log('ファイルの変更を検出しました');
        filesRef.current = GitHubFile;
        setFiles(GitHubFile);
      }
    } catch (error) {
      console.error('ファイル監視エラー:', error);
    }
  };

  const startMonitoring = (setFiles: (files: GitHubFile[]) => void) => {
    if (!currentDirHandle) {
      alert('まずディレクトリを選択してください');
      return;
    }

    setIsMonitoring(true);
    console.log('🔄 リアルタイム監視を開始しました');
    
    monitorIntervalRef.current = window.setInterval(() => {
      checkForChanges(setFiles);
    }, 3000); // 3秒間隔
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
    console.log('⏸ リアルタイム監視を停止しました');
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }
    };
  }, []);

  return {
    // States
    isMonitoring,
    currentDirHandle,
    setCurrentDirHandle,
    filesRef,

    // Actions
    startMonitoring,
    stopMonitoring,
  };
};
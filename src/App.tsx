// App.tsx（実際の依存関係解析版）
import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import URLInput from './components/URLInput';
import FileList, { type FileData } from './components/FileList';
import {
  fetchRepoStructureRecursive, // これはそのまま
  fetchFileContent,
  extractDependencies,
  type GitHubFile,
} from './services/githubApi';
import ForceGraph from './components/ForceGraph';
import ViewTabs from './components/ViewTabs';

function App() {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [files, setFiles] = useState<FileData[]>([]);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'split'>('list');
  const [fileFilter, setFileFilter] = useState<'all' | 'withDeps' | 'main'>(
    'withDeps'
  );
  const [mode, setMode] = useState<'github' | 'local'>('local');

  // ❌ getDummyDependencies 関数を削除（もう使わない）

  // ⭐ convertGitHubToFileData を async に変更して、実際の依存関係を解析
  // src/App.tsx の convertGitHubToFileData を修正

  const convertGitHubToFileData = async (
    githubFiles: GitHubFile[]
  ): Promise<FileData[]> => {
    console.log('🔍 依存関係を解析中...');

    const fileDataPromises = githubFiles.map(async (file, index) => {
      let dependencies: string[] = [];

      if (
        file.type === 'file' &&
        file.download_url &&
        (file.name.endsWith('.tsx') ||
          file.name.endsWith('.ts') ||
          file.name.endsWith('.jsx') ||
          file.name.endsWith('.js'))
      ) {
        try {
          const content = await fetchFileContent(file.download_url);
          // ファイルのパスも渡すように変更
          dependencies = extractDependencies(content, file.path);

          // 依存関係のマッピングを改善
          dependencies = dependencies.map((dep) => {
            // フルパスでのマッチングを試みる
            const exactMatch = githubFiles.find(
              (f) =>
                f.name === dep ||
                f.path.endsWith(dep) ||
                f.path.includes(dep.replace('.tsx', '').replace('.ts', ''))
            );

            if (exactMatch) {
              return exactMatch.name;
            }

            // index.tsxの場合の特別処理
            if (dep.includes('/index.')) {
              const folderName = dep.split('/')[0];
              const indexFile = githubFiles.find(
                (f) =>
                  f.path.includes(folderName) && f.name.startsWith('index.')
              );
              if (indexFile) {
                return indexFile.name;
              }
            }

            return dep;
          });

          console.log(`✅ ${file.name}: ${dependencies.length}個の依存関係`);
        } catch (error) {
          console.error(`❌ ${file.name} の解析失敗:`, error);
        }
      }

      return {
        id: index + 1,
        name: file.name,
        type: file.type,
        size: file.size,
        dependencies: [...new Set(dependencies)], // 重複除去
      };
    });

    const fileData = await Promise.all(fileDataPromises);
    return fileData;
  };

  const handleURLSubmit = async (url: string) => {
    console.log('GitHub URL:', url);
    setRepoUrl(url);
    setIsLoading(true);
    setError('');
    setFiles([]);

    try {
      // 変数名を統一する
      const githubFiles = await fetchRepoStructureRecursive(url, '', 0, 3);
      console.log(`取得したファイル数: ${githubFiles.length}`);

      const fileData = await convertGitHubToFileData(githubFiles);
      setFiles(fileData);

      if (!recentUrls.includes(url)) {
        setRecentUrls((prev) => [url, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredFiles = () => {
    switch (fileFilter) {
      case 'withDeps':
        // 依存関係があるファイルのみ
        return files.filter(
          (file) =>
            (file.dependencies && file.dependencies.length > 0) ||
            files.some((f) => f.dependencies?.includes(file.name))
        );
      case 'main':
        // 主要ファイルのみ（JS/TS系）
        return files.filter((file) =>
          file.name.match(/\.(tsx?|jsx?|mjs|cjs)$/)
        );
      default:
        return files;
    }
  };

  const filteredFiles = getFilteredFiles();

  // npm APIからパッケージ情報を取得する関数
  const getPackageInfo = async (packageName: string) => {
    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      const data = await response.json();

      return {
        name: packageName,
        description: data.description,
        version: data['dist-tags']?.latest,
        homepage: data.homepage,
      };
    } catch (error) {
      console.error(`❌ ${packageName}の情報取得に失敗:`, error);
      return null;
    }
  };

  const handleLocalFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setIsLoading(true);
    setError('');

    try {
      const files = Array.from(fileList);
      console.log(`📁 ${files.length}個のファイルを読み込み中...`);

      // 除外パターンのリスト
      const EXCLUDE_PATTERNS = [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        'coverage',
        '.cache',
        '.vscode',
        '.idea',
      ];

      // 除外チェック関数
      const shouldExclude = (path: string): boolean => {
        // パスをスラッシュで分割
        const pathParts = path.split('/');

        // 各パスの部分に除外パターンが含まれているかチェック
        return pathParts.some((part) => EXCLUDE_PATTERNS.includes(part));
      };

      // 統計情報
      let excludedCount = 0;
      let processedCount = 0;

      // FileData形式に変換
      const fileData: FileData[] = [];
      let packageJsonContent = null;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = file.webkitRelativePath || file.name;

        // 除外チェック（改善版）
        if (shouldExclude(path)) {
          excludedCount++;
          console.log(`🚫 除外: ${path}`);
          continue;
        }

        // パスの最後の部分（ファイル名）を取得
        const parts = path.split('/');
        const name = parts[parts.length - 1];

        // 隠しファイルの除外
        if (name.startsWith('.') && name !== '.gitignore') {
          excludedCount++;
          continue;
        }

        // package.jsonの処理
        if (name === 'package.json' && parts.length === 1) {
          // ルートのpackage.jsonのみ
          console.log('📦 package.jsonを発見！');
          const content = await file.text();
          packageJsonContent = JSON.parse(content);
          console.log('📚 依存関係:', {
            dependencies: packageJsonContent.dependencies
              ? Object.keys(packageJsonContent.dependencies).length
              : 0,
            devDependencies: packageJsonContent.devDependencies
              ? Object.keys(packageJsonContent.devDependencies).length
              : 0,
          });
          continue;
        }

        let dependencies: string[] = [];

        // TypeScript/JavaScriptファイルの場合、依存関係を解析
        if (name.match(/\.(tsx?|jsx?|mjs|cjs)$/)) {
          try {
            const content = await file.text();
            dependencies = extractDependencies(content, path);
            console.log(`✅ ${name}: ${dependencies.length}個の依存関係`);
          } catch (error) {
            console.error(`❌ ${name}の読み取りエラー:`, error);
          }
        }

        processedCount++;
        fileData.push({
          id: processedCount,
          name: name,
          type: name.includes('.') ? 'file' : 'dir',
          size: file.size,
          dependencies: dependencies,
        });
      }

      // 統計情報の表示
      console.log('📊 処理統計:', {
        total: files.length,
        processed: processedCount,
        excluded: excludedCount,
        excludeRate: `${Math.round((excludedCount / files.length) * 100)}%`,
      });

      setFiles(fileData);
      console.log(`✅ ${fileData.length}個のファイルを表示`);
    } catch (err) {
      setError('ファイルの読み込みに失敗しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const clearAll = () => {
    setFiles([]);
    setRepoUrl('');
    setError('');
  };

  // App.tsxに追加する新しい関数

  // File System Access APIを使った新しいハンドラー
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleDirectoryPicker = async () => {
    setIsLoading(true);
    setError('');

    try {
      // @ts-expect-error - File System Access APIはまだ型定義が不完全
      const dirHandle = await window.showDirectoryPicker();
      console.log(`📁 ディレクトリ選択: ${dirHandle.name}`);

      const fileData: FileData[] = [];
      let fileId = 1;
      let packageJsonContent: Record<string, any> | null = null; // anyのままでOK（ESLintの設定次第）

      // 統計情報
      const stats = {
        total: 0,
        processed: 0,
        excluded: 0,
      };

      // 除外パターン
      const EXCLUDE_DIRS = [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        'coverage',
      ];

      // ディレクトリを再帰的に読み込む（型定義をanyに戻す）
      async function* walkDirectory(
        dirHandle: any,
        path = ''
      ): AsyncGenerator<{ handle: any; path: string }> {
        for await (const entry of dirHandle.values()) {
          stats.total++;

          const entryPath = path ? `${path}/${entry.name}` : entry.name;

          // 除外チェック
          if (entry.kind === 'directory' && EXCLUDE_DIRS.includes(entry.name)) {
            stats.excluded++;
            console.log(`🚫 除外: ${entryPath}/`);
            continue;
          }

          if (entry.kind === 'file') {
            yield { handle: entry, path: entryPath };
          } else if (entry.kind === 'directory') {
            yield* walkDirectory(entry, entryPath);
          }
        }
      }

      // ファイルを処理
      for await (const { handle, path } of walkDirectory(dirHandle)) {
        const fileName = handle.name;

        // 隠しファイルをスキップ
        if (fileName.startsWith('.') && fileName !== '.gitignore') {
          stats.excluded++;
          continue;
        }

        // package.jsonの特別処理
        if (fileName === 'package.json' && !path.includes('/')) {
          console.log('📦 ルートのpackage.jsonを発見！');
          const file = await handle.getFile();
          const content = await file.text();
          packageJsonContent = JSON.parse(content);

          // null チェックを追加
          if (packageJsonContent) {
            console.log('📚 依存関係:', {
              dependencies: packageJsonContent.dependencies
                ? Object.keys(packageJsonContent.dependencies).length
                : 0,
              devDependencies: packageJsonContent.devDependencies
                ? Object.keys(packageJsonContent.devDependencies).length
                : 0,
            });
          }
        }

        let dependencies: string[] = [];

        // JS/TSファイルの依存関係を解析
        if (fileName.match(/\.(tsx?|jsx?|mjs|cjs)$/)) {
          try {
            const file = await handle.getFile();
            const content = await file.text();
            dependencies = extractDependencies(content, path);
          } catch (error) {
            console.error(`❌ ${fileName}の読み取りエラー:`, error);
          }
        }

        stats.processed++;
        fileData.push({
          id: fileId++,
          name: fileName,
          type: 'file',
          size: (await handle.getFile()).size,
          dependencies: dependencies,
        });

        // 進捗表示
        if (stats.processed % 50 === 0) {
          console.log(`⏳ ${stats.processed}ファイル処理済み...`);
        }
      }

      console.log('📊 処理完了:', {
        total: stats.total,
        processed: stats.processed,
        excluded: stats.excluded,
        rate: `${Math.round((stats.excluded / stats.total) * 100)}%除外`,
      });

      // npm API呼び出し（packageJsonContentのnullチェック）
      if (packageJsonContent?.dependencies) {
        const importantPackages = [
          'react',
          'typescript',
          'd3',
          'vite',
          'axios',
        ];
        const depsToFetch = Object.keys(packageJsonContent.dependencies)
          .filter((name) => importantPackages.includes(name))
          .slice(0, 5);

        console.log('🔍 主要パッケージ情報を取得:', depsToFetch);

        for (const pkgName of depsToFetch) {
          try {
            const info = await getPackageInfo(pkgName);
            if (info) {
              console.log(`📚 ${pkgName}: ${info.description}`);
            }
          } catch (error) {
            console.error(`npm API エラー (${pkgName}):`, error);
          }
        }
      }

      setFiles(fileData);
      console.log(`✅ ${fileData.length}個のファイルを表示`);
    } catch (err) {
      const error = err as Error;
      if (error.name !== 'AbortError') {
        setError('ディレクトリの読み込みに失敗しました: ' + error.message);
        console.error('エラー:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ここから重要！return部分
  return (
    <div className='App'>
      <Header title='Project Visualizer' />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          padding: '20px',
          backgroundColor: '#f3f4f6',
        }}
      >
        <button
          onClick={() => setMode('local')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'local' ? '#3b82f6' : 'white',
            color: mode === 'local' ? 'white' : 'black',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ローカル
        </button>
        <button
          onClick={() => setMode('github')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'github' ? '#3b82f6' : 'white',
            color: mode === 'github' ? 'white' : 'black',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          GitHub
        </button>
      </div>

      {/* モードによって表示切り替え */}
      {mode === 'github' ? (
        <URLInput onSubmit={handleURLSubmit} />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>ローカルファイルを選択</h3>

          {/* 新しいボタン */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleDirectoryPicker}
              style={{
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
              🚀 フォルダを選択（高速版・Chrome/Edge推奨）
            </button>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              node_modules自動除外・リアルタイム更新対応
            </div>
          </div>

          {/* 従来の方法（注意書き付き） */}
          <div
            style={{
              padding: '15px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '10px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                marginBottom: '10px',
                fontWeight: 'bold',
              }}
            >
              または従来の方法（全ブラウザ対応）：
            </p>

            {/* 警告メッセージ */}
            <div
              style={{
                padding: '10px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '6px',
                marginBottom: '10px',
              }}
            >
              <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                ⚠️ <strong>注意：</strong>node_modulesフォルダがある場合、
                <br />
                すべてのファイル（1万個以上）を読み込むため動作が重くなります。
                <br />
                可能であれば上の高速版をご利用ください。
              </p>
            </div>

            <input
              type='file'
              // @ts-expect-error - webkitdirectoryは標準のHTML属性ではないため
              webkitdirectory=''
              directory=''
              multiple
              onChange={handleLocalFolder}
            />

            <div
              style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}
            >
              それでも利用する場合は、小規模なプロジェクトでお試しください
            </div>
          </div>
        </div>
      )}
      {/* URL履歴表示 */}
      {recentUrls.length > 0 && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#f8f9fa',
            margin: '0 20px 10px',
            borderRadius: '6px',
          }}
        >
          <small style={{ color: '#6b7280' }}>最近のリポジトリ：</small>
          {recentUrls.map((url) => (
            <button
              key={url}
              onClick={() => handleURLSubmit(url)}
              style={{
                marginLeft: '10px',
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {url.split('/').slice(-2).join('/')}
            </button>
          ))}
        </div>
      )}

      {/* 現在のリポジトリとクリアボタン */}
      {repoUrl && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#e8f4fd',
            margin: '0 20px',
            borderRadius: '6px',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            📍 現在のリポジトリ: <strong>{repoUrl}</strong>
          </span>
          <button
            onClick={clearAll}
            style={{
              padding: '5px 10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            クリア
          </button>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#fee',
            margin: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#c00',
          }}
        >
          ⚠️ エラー: {error}
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            fontSize: '16px',
            color: '#6b7280',
          }}
        >
          ⏳ リポジトリを読み込み中...
        </div>
      )}
      {/* ⭐ ビュー切り替えタブを追加 */}
      {files.length > 0 && (
        <>
          <ViewTabs currentView={viewMode} onViewChange={setViewMode} />

          {/* フィルターボタンを追加 */}
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              表示フィルター:
            </span>
            <button
              onClick={() => setFileFilter('all')}
              style={{
                padding: '6px 12px',
                backgroundColor: fileFilter === 'all' ? '#3b82f6' : 'white',
                color: fileFilter === 'all' ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              全て ({files.length})
            </button>
            <button
              onClick={() => setFileFilter('withDeps')}
              style={{
                padding: '6px 12px',
                backgroundColor:
                  fileFilter === 'withDeps' ? '#3b82f6' : 'white',
                color: fileFilter === 'withDeps' ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              依存関係あり (
              {
                files.filter(
                  (f) =>
                    (f.dependencies && f.dependencies.length > 0) ||
                    files.some((ff) => ff.dependencies?.includes(f.name))
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFileFilter('main')}
              style={{
                padding: '6px 12px',
                backgroundColor: fileFilter === 'main' ? '#3b82f6' : 'white',
                color: fileFilter === 'main' ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              主要ファイル (
              {files.filter((f) => f.name.match(/\.(tsx?|jsx?)$/)).length})
            </button>

            <span
              style={{
                marginLeft: 'auto',
                fontSize: '13px',
                color: '#6b7280',
              }}
            >
              表示中: {filteredFiles.length} / {files.length} ファイル
            </span>
          </div>

          {/* ⭐️ ここに追加！FileListとForceGraphの表示 */}
          {/* リストビュー */}
          {(viewMode === 'list' || viewMode === 'split') && (
            <div
              style={{
                display: viewMode === 'split' ? 'inline-block' : 'block',
                width: viewMode === 'split' ? '50%' : '100%',
                verticalAlign: 'top',
              }}
            >
              <FileList files={filteredFiles} />
            </div>
          )}

          {/* グラフビュー */}
          {(viewMode === 'graph' || viewMode === 'split') && (
            <div
              style={{
                display: viewMode === 'split' ? 'inline-block' : 'block',
                width: viewMode === 'split' ? '50%' : '100%',
                verticalAlign: 'top',
              }}
            >
              <ForceGraph files={filteredFiles} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

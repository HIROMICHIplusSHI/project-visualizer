// App.tsx（完全版）
import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import URLInput from './components/URLInput';
import FileList, { type FileData } from './components/FileList';
import { fetchRepoStructure, type GitHubFile } from './services/githubApi';
import ForceGraph from './components/ForceGraph';

function App() {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [files, setFiles] = useState<FileData[]>([]);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  const getDummyDependencies = (
    fileName: string,
    allFiles: GitHubFile[]
  ): string[] => {
    const deps: string[] = [];

    // シンプルなルール：各ファイルは次のファイルに依存
    const currentIndex = allFiles.findIndex((f) => f.name === fileName);
    if (currentIndex >= 0 && currentIndex < allFiles.length - 1) {
      // 次のファイルに依存
      deps.push(allFiles[currentIndex + 1].name);
    }

    // 最後のファイルは最初のファイルに依存（円を作る）
    if (currentIndex === allFiles.length - 1 && allFiles.length > 1) {
      deps.push(allFiles[0].name);
    }

    // READMEは複数ファイルに依存
    if (fileName === 'README.md') {
      const tsxFiles = allFiles
        .filter((f) => f.name.endsWith('.tsx'))
        .slice(0, 3);
      tsxFiles.forEach((f) => {
        if (!deps.includes(f.name)) {
          deps.push(f.name);
        }
      });
    }

    console.log(`${fileName} → 依存:`, deps);
    return deps;
  };

  const convertGitHubToFileData = (githubFiles: GitHubFile[]): FileData[] => {
    return githubFiles.map((file, index) => ({
      id: index + 1,
      name: file.name,
      type: file.type,
      size: file.size,
      dependencies: getDummyDependencies(file.name, githubFiles), // ⭐️ ここを変更！
    }));
  };

  const handleURLSubmit = async (url: string) => {
    console.log('GitHub URL:', url);
    setRepoUrl(url);
    setIsLoading(true);
    setError('');
    setFiles([]);

    try {
      const githubFiles = await fetchRepoStructure(url);
      const fileData = convertGitHubToFileData(githubFiles);
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

  const clearAll = () => {
    setFiles([]);
    setRepoUrl('');
    setError('');
  };

  // ここから重要！return部分
  return (
    <div className='App'>
      <Header title='Project Visualizer' />

      <URLInput onSubmit={handleURLSubmit} />

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

      {/* ⭐️ ここが重要！FileListを使う！ */}
      <FileList files={files} />
      {/* D3.js可視化を追加！ */}
      {files.length > 0 && <ForceGraph files={files} />}
    </div>
  );
}

export default App;

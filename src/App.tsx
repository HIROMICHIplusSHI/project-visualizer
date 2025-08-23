// App.tsx（完全版）
import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import URLInput from './components/URLInput';
import FileList, { type FileData } from './components/FileList';
import { fetchRepoStructure, type GitHubFile } from './services/githubApi'; // servicesに注意

function App() {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>(''); // エラー管理

  // 初期データを空にする（実際のデータを使うため）
  const [files, setFiles] = useState<FileData[]>([]);

  // GitHub APIからデータを変換する関数
  const convertGitHubToFileData = (githubFiles: GitHubFile[]): FileData[] => {
    return githubFiles.map((file, index) => ({
      id: index + 1,
      name: file.name,
      dependencies: [],
    }));
  };

  // URL送信時の処理
  const handleURLSubmit = async (url: string) => {
    console.log('GitHub URL:', url);
    setRepoUrl(url);
    setIsLoading(true);
    setError('');

    try {
      const githubFiles = await fetchRepoStructure(url);
      const fileData = convertGitHubToFileData(githubFiles);
      setFiles(fileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addFile = () => {
    const newFile: FileData = {
      id: Date.now(),
      name: `newFile${files.length + 1}.tsx`,
      dependencies: [],
    };
    setFiles([...files, newFile]);
  };

  const deleteFile = (id: number) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  return (
    <div className='App'>
      <Header title='Project Visualizer' />

      {/* URLInputにhandleURLSubmitを渡す！ */}
      <URLInput onSubmit={handleURLSubmit} />

      {/* リポジトリURL表示 */}
      {repoUrl && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#e8f4fd',
            margin: '0 20px',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          📍 現在のリポジトリ: <strong>{repoUrl}</strong>
        </div>
      )}

      {/* エラー表示（errorを使う！） */}
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

      {/* ファイルリスト */}
      <FileList files={files} onAddFile={addFile} onDeleteFile={deleteFile} />
    </div>
  );
}

export default App;

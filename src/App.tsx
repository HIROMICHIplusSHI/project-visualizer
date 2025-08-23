// App.tsx（更新版）
import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import URLInput from './components/URLInput';
import FileList, { type FileData } from './components/FileList';

function App() {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 初期データ
  const [files, setFiles] = useState<FileData[]>([
    {
      id: 1,
      name: 'App.tsx',
      dependencies: ['FileNode.tsx', 'App.css'],
    },
    {
      id: 2,
      name: 'main.tsx',
      dependencies: ['App.tsx'],
    },
    {
      id: 3,
      name: 'FileNode.tsx',
      dependencies: [],
    },
    {
      id: 4,
      name: 'App.css',
      dependencies: [],
    },
  ]);

  // URL送信時の処理
  const handleURLSubmit = async (url: string) => {
    console.log('GitHub URL:', url);
    setRepoUrl(url);
    setIsLoading(true);

    // TODO: ここで実際のGitHub API呼び出し
    // 今は2秒後にダミーデータを追加
    setTimeout(() => {
      const newFiles: FileData[] = [
        {
          id: Date.now(),
          name: 'README.md',
          dependencies: [],
        },
        {
          id: Date.now() + 1,
          name: 'package.json',
          dependencies: [],
        },
      ];
      setFiles((prev) => [...prev, ...newFiles]);
      setIsLoading(false);
    }, 2000);
  };

  // ファイル追加
  const addFile = () => {
    const newFile: FileData = {
      id: Date.now(),
      name: `newFile${files.length + 1}.tsx`,
      dependencies: [],
    };
    setFiles([...files, newFile]);
  };

  // ファイル削除
  const deleteFile = (id: number) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  return (
    <div className='App'>
      <Header title='Project Visualizer' />

      {/* URL入力部分 */}
      <URLInput onSubmit={handleURLSubmit} />

      {/* 現在のリポジトリURL表示 */}
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

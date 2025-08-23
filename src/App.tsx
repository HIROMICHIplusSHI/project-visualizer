// App.tsx

import { useState } from 'react';
import './App.css';
import { FileNode } from './FileNode';

// 型定義（新規追加）
type FileData = {
  id: number;
  name: string;
  dependencies?: string[]; // このファイルが使っている他のファイル
};

function App() {
  // より現実的なデータ構造に更新
  const [files, setFiles] = useState<FileData[]>([
    {
      id: 1,
      name: 'App.tsx',
      dependencies: ['FileNode.tsx', 'App.css'], // Appは2つのファイルを使用
    },
    {
      id: 2,
      name: 'main.tsx',
      dependencies: ['App.tsx'], // mainはAppを使用
    },
    {
      id: 3,
      name: 'FileNode.tsx',
      dependencies: [], // FileNodeは他に依存なし
    },
    {
      id: 4,
      name: 'App.css',
      dependencies: [], // CSSも依存なし
    },
  ]);

  // 新規追加：選択中のファイルを管理
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // 選択をクリアする関数
  const clearSelection = () => {
    setSelectedFileName(null);
  };

  // ファイル追加（昨日の機能を修正）
  const addFile = () => {
    const newFile: FileData = {
      id: Date.now(),
      name: `newFile${files.length + 1}.tsx`,
      dependencies: [], // 新しいファイルは依存関係なしで始める
    };
    setFiles([...files, newFile]);
  };

  // ファイル削除（昨日の機能）
  const deleteFile = (id: number) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  return (
    <div className='App'>
      <h1>プロジェクト構造可視化アプリ</h1>
      <p>ファイル数: {files.length}</p>

      <button
        onClick={addFile}
        style={{
          padding: '10px 20px',
          margin: '20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        ＋ ファイルを追加
      </button>

      <div>
        {files.map((file) => (
          <div key={file.id} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileNode
                fileName={file.name}
                dependencies={file.dependencies}
                isSelected={selectedFileName === file.name} // 追加
                isDependency={
                  selectedFileName
                    ? files
                        .find((f) => f.name === selectedFileName)
                        ?.dependencies?.includes(file.name) || false
                    : false
                } // 追加
                onSelect={() =>
                  setSelectedFileName(
                    selectedFileName === file.name ? null : file.name
                  )
                } // 追加
              />
              <button
                onClick={clearSelection} // ← ここで使う！
                style={{
                  padding: '10px 20px',
                  margin: '20px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                }}
              ></button>
              <button onClick={() => deleteFile(file.id)}>削除</button>
            </div>

            {/* 依存関係を表示 */}
            {file.dependencies && file.dependencies.length > 0 && (
              <div
                style={{
                  marginLeft: '40px',
                  marginTop: '5px',
                  fontSize: '12px',
                  color: 'gray',
                }}
              >
                → 使用: {file.dependencies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

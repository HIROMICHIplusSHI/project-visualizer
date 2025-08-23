// components/FileList.tsx（新規作成）
import { useState } from 'react';
import { FileNode } from '../FileNode';

// 型定義を共通化するためexport
export interface FileData {
  id: number;
  name: string;
  dependencies?: string[];
}

interface FileListProps {
  files: FileData[];
  onAddFile: () => void;
  onDeleteFile: (id: number) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onAddFile,
  onDeleteFile,
}) => {
  // 選択状態の管理はFileList内で行う
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const clearSelection = () => {
    setSelectedFileName(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2>📁 ファイル構造 ({files.length}件)</h2>
        <div>
          <button
            onClick={clearSelection}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              opacity: selectedFileName ? 1 : 0.5,
            }}
            disabled={!selectedFileName}
          >
            選択をクリア
          </button>
          <button
            onClick={onAddFile}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            ＋ ファイルを追加
          </button>
        </div>
      </div>

      <div>
        {files.map((file) => (
          <div key={file.id} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <FileNode
                  fileName={file.name}
                  dependencies={file.dependencies}
                  isSelected={selectedFileName === file.name}
                  isDependency={
                    selectedFileName
                      ? files
                          .find((f) => f.name === selectedFileName)
                          ?.dependencies?.includes(file.name) || false
                      : false
                  }
                  onSelect={() =>
                    setSelectedFileName(
                      selectedFileName === file.name ? null : file.name
                    )
                  }
                />
              </div>
              <button
                onClick={() => onDeleteFile(file.id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;

import React, { useState } from 'react';
import { Folder, File, Search } from 'lucide-react';
import { type GitHubFile } from '../services/githubApi';

interface ProjectTreeViewProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile) => void;
}

const ProjectTreeView: React.FC<ProjectTreeViewProps> = ({
  files,
  selectedFile,
  onFileSelect,
}) => {

  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleFileClick = (file: GitHubFile) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // 🔍 検索クエリに基づいてファイルをフィルタリング
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className='project-tree'
      style={{
        width: '300px',
        height: '100%',
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
          エクスプローラー
        </h3>

        {/* 🔍 検索入力フィールド */}
        <div style={{
          position: 'relative',
          marginBottom: '10px'
        }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="ファイルを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px 6px 28px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#6b7280'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* 検索結果の件数表示 */}
        {searchQuery && (
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            marginBottom: '8px',
            padding: '4px 8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '3px'
          }}>
            {filteredFiles.length}件見つかりました
          </div>
        )}

        <div>
          {filteredFiles.map((file) => (
            <div
              key={file.path}
              onClick={() => handleFileClick(file)}
              style={{
                padding: '5px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                backgroundColor:
                  selectedFile?.path === file.path
                    ? '#ea580c' // オレンジ系の背景
                    : hoveredFile === file.path
                    ? '#f0f0f0'
                    : 'transparent',
                border: selectedFile?.path === file.path ? '2px solid #f97316' : 'none',
                color: selectedFile?.path === file.path ? 'white' : 'inherit',
                boxShadow: selectedFile?.path === file.path ? '0 0 8px rgba(249, 115, 22, 0.3)' : 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={() => setHoveredFile(file.path)}
              onMouseLeave={() => setHoveredFile(null)}
            >
              {file.type === 'dir' ? (
                <Folder
                  size={16}
                  style={{ marginRight: '5px', color: '#90a4ae' }}
                />
              ) : (
                <File
                  size={16}
                  style={{ marginRight: '5px', color: '#90a4ae' }}
                />
              )}

              <span style={{ fontSize: '13px' }}>{file.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTreeView;

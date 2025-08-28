// components/FileTreeExplorer.tsx
// IDEライクなファイルツリーエクスプローラー

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search, FolderOpen } from 'lucide-react';
import type { GitHubFile } from '../services/githubApi';
import FileIcon from './icons/FileIcon';
import { 
  buildFileTree, 
  flattenFileTree, 
  toggleNodeExpansion,
  type FileTreeNode 
} from '../utils/fileTreeUtils';

interface FileTreeExplorerProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile) => void;
  className?: string;
  style?: React.CSSProperties;
}

const FileTreeExplorer: React.FC<FileTreeExplorerProps> = ({
  files,
  selectedFile,
  onFileSelect,
  className,
  style
}) => {
  const [treeNodes, setTreeNodes] = useState<FileTreeNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);

  // ファイルツリーの構築
  useMemo(() => {
    const tree = buildFileTree(files);
    setTreeNodes(tree);
  }, [files]);

  // 表示用フラットリストの生成
  const displayNodes = useMemo(() => {
    return flattenFileTree(treeNodes, showHiddenFiles);
  }, [treeNodes, showHiddenFiles]);

  // 検索フィルタリング
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return displayNodes;
    
    return displayNodes.filter(node => 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayNodes, searchQuery]);

  // ノード展開/折りたたみ
  const handleNodeToggle = (nodePath: string) => {
    setTreeNodes(prevNodes => toggleNodeExpansion(prevNodes, nodePath));
  };

  // ファイル選択
  const handleFileSelect = (node: FileTreeNode) => {
    if (node.type === 'file' && node.file && onFileSelect) {
      onFileSelect(node.file);
    }
  };

  // インデントレベルに応じたスタイル
  const getIndentStyle = (level: number) => ({
    marginLeft: `${level * 20}px`
  });

  return (
    <div 
      className={className}
      style={{
        width: '300px',
        height: '100%',
        borderRight: '1px solid #e5e7eb',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {/* ヘッダー */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <FolderOpen size={16} />
          エクスプローラー
        </h3>

        {/* 検索入力 */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <Search
            size={14}
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
              borderRadius: '6px',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: 'white'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6b7280',
                padding: '2px'
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* オプション */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: '#6b7280',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={showHiddenFiles}
              onChange={(e) => setShowHiddenFiles(e.target.checked)}
              style={{ width: '12px', height: '12px' }}
            />
            隠しファイル表示
          </label>
          
          {searchQuery && (
            <span style={{
              fontSize: '11px',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {filteredNodes.length}件
            </span>
          )}
        </div>
      </div>

      {/* ファイルツリー */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 0'
      }}>
        {filteredNodes.map((node) => (
          <div
            key={node.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              textAlign: 'left',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '13px',
              backgroundColor: selectedFile?.path === node.path ? '#e0f2fe' : 'transparent',
              borderLeft: selectedFile?.path === node.path ? '3px solid #0284c7' : '3px solid transparent',
              color: selectedFile?.path === node.path ? '#0284c7' : '#374151',
              transition: 'all 0.15s ease',
              ...getIndentStyle(node.level)
            }}
            onClick={() => {
              if (node.type === 'directory') {
                handleNodeToggle(node.path);
              } else {
                handleFileSelect(node);
              }
            }}
            onMouseEnter={(e) => {
              if (selectedFile?.path !== node.path) {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFile?.path !== node.path) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {/* 展開/折りたたみアイコン */}
            {node.type === 'directory' && (
              <div style={{ 
                width: '16px', 
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginRight: '4px'
              }}>
                {node.isExpanded ? (
                  <ChevronDown size={14} style={{ color: '#6b7280' }} />
                ) : (
                  <ChevronRight size={14} style={{ color: '#6b7280' }} />
                )}
              </div>
            )}

            {/* ファイルアイコン（フォルダはアイコンなし） */}
            {node.type === 'file' && (
              <div style={{ 
                marginRight: '6px',
                marginLeft: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FileIcon fileName={node.name} size={16} />
              </div>
            )}

            {/* ファイル/フォルダ名 */}
            <span style={{
              flexGrow: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {node.name}
            </span>

            {/* ファイルサイズ（小さく表示） */}
            {node.type === 'file' && node.file?.size && (
              <span style={{
                fontSize: '10px',
                color: '#9ca3af',
                marginLeft: '8px'
              }}>
                {formatFileSize(node.file.size)}
              </span>
            )}
          </div>
        ))}
        
        {/* 空の状態 */}
        {filteredNodes.length === 0 && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px'
          }}>
            {searchQuery ? 'ファイルが見つかりません' : 'ファイルがありません'}
          </div>
        )}
      </div>
    </div>
  );
};

// ファイルサイズフォーマット関数
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export default FileTreeExplorer;
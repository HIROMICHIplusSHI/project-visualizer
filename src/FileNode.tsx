// FileNode.tsx

import { useState } from 'react';

// FileNode.tsx

type FileNodeProps = {
  fileName: string;
  dependencies?: string[];
  isSelected?: boolean; // 追加
  isDependency?: boolean; // 追加
  onSelect?: () => void; // 追加
};

export function FileNode({
  fileName,
  dependencies = [],
  isSelected = false,
  isDependency = false,
  onSelect,
}: FileNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false); // 追加！

  const extension = fileName.split('.').pop() || '';

  const getIcon = () => {
    // フォルダの場合
    if (fileName.endsWith('/') || extension === '') {
      return isOpen ? '📂' : '📁';
    }
    // ファイルの場合
    return '📄';
  };

  const getColor = () => {
    switch (extension) {
      case 'tsx':
        return 'blue';
      case 'css':
        return 'green';
      case 'ts':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // 背景色を決める関数を更新
  const getBackgroundColor = () => {
    if (isSelected) return '#ffd700'; // 金色（最優先）
    if (isDependency) return '#e6f3ff'; // 薄い青
    if (isHovered) return '#d4d4d8'; // もっと濃いグレーに変更！
    if (isOpen) return '#e0e0e0';
    return '#f5f5f5'; // デフォルトは薄いグレー
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
    setClickCount(clickCount + 1);

    // 選択機能を呼び出す（追加）
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)} // 追加！
      onMouseLeave={() => setIsHovered(false)} // 追加！
      style={{
        cursor: 'pointer',
        padding: '10px',
        margin: '5px',
        backgroundColor: getBackgroundColor(),
        borderRadius: '5px',
        borderLeft: `4px solid ${getColor()}`,
        border: isSelected
          ? '2px solid #ff9800'
          : isDependency
          ? '2px dashed #3b82f6' // 点線！
          : 'none',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 選択状態のインジケーター */}
      {isSelected && <span>👉 </span>}
      {isDependency && <span>🔗 </span>} {/* 依存関係のアイコン追加！ */}
      {/* アイコンとファイル名 */}
      {isOpen ? '📂' : '📁'} {getIcon()} {fileName}
      {/* クリック回数の表示 */}
      <span
        style={{
          marginLeft: '10px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        (クリック: {clickCount}回)
      </span>
      {/* 依存ファイル数を表示（ここが抜けていた！） */}
      {dependencies.length > 0 && (
        <span
          style={{
            marginLeft: '10px',
            fontSize: '11px',
            background: '#f0f0f0',
            padding: '2px 6px',
            borderRadius: '10px',
          }}
        >
          {dependencies.length}個のファイルを使用
        </span>
      )}
      {/* 展開時に依存関係の詳細を表示（ここも抜けていた！） */}
      {isOpen && dependencies.length > 0 && (
        <div
          style={{
            marginTop: '10px',
            marginLeft: '20px',
            fontSize: '12px',
            backgroundColor: 'white',
            padding: '10px', // 少し広く
            borderRadius: '8px', // もっと丸く
            border: '1px solid #e0e0e0', // 枠線追加
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)', // 内側の影
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#4a5568', // 少し暗めの色
              fontSize: '13px',
            }}
          >
            📎 使用しているファイル:
          </div>
          {dependencies.map((dep, index) => (
            <div
              key={index}
              style={{
                marginLeft: '10px',
                color: '#666',
                padding: '3px 0', // 行間を追加
                borderBottom:
                  index < dependencies.length - 1
                    ? '1px dotted #e0e0e0'
                    : 'none', // 区切り線
              }}
            >
              • {dep}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

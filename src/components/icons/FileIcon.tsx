// components/icons/FileIcon.tsx
// VS Code風のファイル拡張子別SVGアイコンコンポーネント

import React from 'react';

interface FileIconProps {
  fileName: string;
  size?: number;
}

const FileIcon: React.FC<FileIconProps> = ({ fileName, size = 16 }) => {
  // TODO(human): 拡張子に応じたSVGアイコンを返すロジックを実装
  // 以下は基本的な実装例です。主要な拡張子用のSVGアイコンを追加してください。
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  const baseName = fileName.toLowerCase();
  
  // 共通のSVGプロパティ
  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  };
  
  // 特殊ファイル名の処理
  if (baseName === 'package.json') {
    return (
      <svg {...svgProps}>
        <rect x="2" y="2" width="12" height="12" rx="1" fill="#e8f5e8" stroke="#4caf50" strokeWidth="0.5"/>
        <rect x="4" y="4" width="8" height="1" fill="#4caf50"/>
        <rect x="4" y="6" width="6" height="1" fill="#4caf50"/>
        <rect x="4" y="8" width="4" height="1" fill="#4caf50"/>
        <circle cx="11" cy="8" r="1.5" fill="#4caf50"/>
      </svg>
    );
  }
  
  if (baseName === 'tsconfig.json') {
    return (
      <svg {...svgProps}>
        <rect x="2" y="2" width="12" height="12" rx="1" fill="#e3f2fd" stroke="#2196f3" strokeWidth="0.5"/>
        <text x="8" y="9" textAnchor="middle" fontSize="7" fill="#2196f3" fontWeight="bold">TS</text>
      </svg>
    );
  }
  
  // TODO(human): 以下の拡張子用のアイコンを実装してください
  // .ts, .tsx, .js, .jsx, .css, .scss, .html, .md, .json, etc.
  
  switch (ext) {
    case 'ts':
      return (
        <svg {...svgProps}>
          {/* TODO(human): TypeScriptアイコン実装 */}
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#e3f2fd" stroke="#2196f3"/>
          <text x="8" y="10" textAnchor="middle" fontSize="6" fill="#2196f3" fontWeight="bold">TS</text>
        </svg>
      );
      
    case 'tsx':
      return (
        <svg {...svgProps}>
          {/* TODO(human): React TypeScriptアイコン実装 */}
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#e1f5fe" stroke="#00bcd4"/>
          <text x="8" y="10" textAnchor="middle" fontSize="5" fill="#00bcd4" fontWeight="bold">TSX</text>
        </svg>
      );
      
    case 'js':
      return (
        <svg {...svgProps}>
          {/* TODO(human): JavaScriptアイコン実装 */}
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#fff8e1" stroke="#ff9800"/>
          <text x="8" y="10" textAnchor="middle" fontSize="6" fill="#ff9800" fontWeight="bold">JS</text>
        </svg>
      );
      
    case 'jsx':
      return (
        <svg {...svgProps}>
          {/* TODO(human): React JavaScriptアイコン実装 */}
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#e8f5e8" stroke="#4caf50"/>
          <text x="8" y="10" textAnchor="middle" fontSize="5" fill="#4caf50" fontWeight="bold">JSX</text>
        </svg>
      );
      
    case 'css':
      return (
        <svg {...svgProps}>
          {/* TODO(human): CSSアイコン実装 */}
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#e3f2fd" stroke="#2196f3"/>
          <text x="8" y="10" textAnchor="middle" fontSize="6" fill="#2196f3" fontWeight="bold">CSS</text>
        </svg>
      );
      
    case 'json':
      return (
        <svg {...svgProps}>
          {/* TODO(human): JSONアイコン実装 */}
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#fff8e1" stroke="#ff9800"/>
          <path d="M5 6h2v4H5zm4 0h2v4H9z" fill="#ff9800"/>
        </svg>
      );
      
    default:
      return (
        <svg {...svgProps}>
          {/* デフォルトファイルアイコン */}
          <rect x="3" y="2" width="8" height="11" rx="0.5" fill="#f5f5f5" stroke="#9e9e9e" strokeWidth="0.5"/>
          <path d="M9 2v3h2" fill="none" stroke="#9e9e9e" strokeWidth="0.5"/>
          <rect x="11" y="2" width="2" height="2" fill="#f5f5f5"/>
        </svg>
      );
  }
};

export default FileIcon;
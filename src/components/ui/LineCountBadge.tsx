// components/ui/LineCountBadge.tsx
// 行数表示用のバッジコンポーネント

import React from 'react';
import { formatLineCount } from '../../utils/fileUtils';

interface LineCountBadgeProps {
  lineCount?: number;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  style?: React.CSSProperties;
}

const LineCountBadge: React.FC<LineCountBadgeProps> = ({
  lineCount,
  variant = 'default',
  className,
  style
}) => {
  // 行数がundefinedまたは0の場合の処理
  if (lineCount === undefined) {
    return null;
  }

  // バリアント別のスタイル設定
  const getVariantStyles = () => {
    const baseStyle = {
      backgroundColor: '#f1f5f9',
      padding: '2px 6px',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      display: 'inline-block',
      whiteSpace: 'nowrap' as const
    };

    switch (variant) {
      case 'compact':
        return {
          ...baseStyle,
          fontSize: '9px',
          padding: '1px 4px'
        };
      case 'detailed':
        return {
          ...baseStyle,
          fontSize: '11px',
          padding: '3px 8px'
        };
      default:
        return {
          ...baseStyle,
          fontSize: '10px'
        };
    }
  };

  // 数字の色とフォントウェイト
  const numberStyle = {
    color: '#0066cc',
    fontWeight: '600'
  };

  // 「行」の色とサイズ
  const unitStyle = {
    color: '#64748b',
    fontSize: variant === 'compact' ? '8px' : 
             variant === 'detailed' ? '10px' : '9px'
  };

  return (
    <span 
      className={className}
      style={{ ...getVariantStyles(), ...style }}
      title={`${lineCount}行`}
    >
      <span style={numberStyle}>
        {lineCount.toLocaleString()}
      </span>
      <span style={unitStyle}>
        行
      </span>
    </span>
  );
};

export default LineCountBadge;
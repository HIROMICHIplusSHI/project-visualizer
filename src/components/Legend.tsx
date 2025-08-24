// src/components/Legend.tsx（完全版）
import React, { useState } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Palette,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const items = [
    { icon: Folder, color: '#FFB800', label: 'フォルダ' },
    { icon: FileCode, color: '#61DAFB', label: 'React (.tsx)' },
    { icon: FileText, color: '#3178C6', label: 'TypeScript (.ts)' },
    { icon: Palette, color: '#1572B6', label: 'スタイル (.css)' },
    { icon: Package, color: '#5A9E4F', label: '設定 (.json)' },
    { icon: FileText, color: '#666', label: 'その他' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px', // ⭐ 60px → 10px（もっと上に）
        left: '10px', // ⭐ right → left（左側に戻す）
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 10,
        minWidth: '140px',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: isOpen ? '8px' : '0',
          color: '#374151',
          borderBottom: isOpen ? '1px solid #e5e7eb' : 'none',
          paddingBottom: isOpen ? '4px' : '0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>ファイルタイプ</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {isOpen && (
        <div>
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '4px',
                  gap: '8px',
                }}
              >
                <Icon size={14} style={{ color: '#6b7280' }} />
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#4b5563' }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Legend;

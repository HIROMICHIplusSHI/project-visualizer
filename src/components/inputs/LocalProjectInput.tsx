// components/inputs/LocalProjectInput.tsx
// ローカルプロジェクト入力UI - ProjectInputSection.tsxから抽出

import React from 'react';

interface LocalProjectInputProps {
  onDirectorySelect: () => void;
  onLocalFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const LocalProjectInput: React.FC<LocalProjectInputProps> = ({
  onDirectorySelect,
  onLocalFolderSelect,
}) => {
  return (
    <div style={{
      padding: '40px 30px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb'
    }}>
      {/* ヘッダーセクション */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          backgroundColor: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'white'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
          </svg>
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: '12px',
          margin: 0
        }}>
          ローカルプロジェクト
        </h3>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.5',
          margin: 0
        }}>
          PCに保存されているプロジェクトを<br />
          直接読み込み・リアルタイム監視
        </p>
      </div>

      {/* 推奨方式: Directory Picker API */}
      <div
        onClick={onDirectorySelect}
        style={{
          width: '100%',
          padding: '20px 24px',
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          border: '2px dashed #3b82f6',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#dbeafe';
          e.currentTarget.style.borderColor = '#2563eb';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#eff6ff';
          e.currentTarget.style.borderColor = '#3b82f6';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
        </svg>
        フォルダをドロップまたはクリック (推奨・高速)
      </div>

      {/* 推奨方式の説明 */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#64748b', 
          marginBottom: '8px'
        }}>
          ⚡ 推奨選択肢
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: '#64748b', 
          lineHeight: '1.5',
          marginBottom: '8px'
        }}>
          最新のプロジェクトファイルに直接アクセスし、完全な依存関係を解析
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#64748b',
          padding: '6px 10px',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          📋 対応: Chrome 86+ / Edge 86+
        </div>
      </div>

      {/* 従来の方法（非推奨） */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        marginTop: '20px'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          または従来の方法（非推奨・重い処理）
        </div>
        
        <input
          type="file"
          {...({ webkitdirectory: "" } as any)}
          onChange={onLocalFolderSelect}
          style={{ display: 'none' }}
          id="legacy-folder-input"
        />
        <label
          htmlFor="legacy-folder-input"
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#9ca3af';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
          </svg>
          フォルダをドロップまたはクリック (非推奨・重い)
        </label>
        
        {/* 警告表示 */}
        <div style={{
          backgroundColor: '#fef8f8',
          border: '1px solid #f1c2c2',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '12px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: '500', 
            color: '#7f1d1d', 
            marginBottom: '4px'
          }}>
            ⚠️ 非推奨・重い処理
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#7f1d1d', 
            lineHeight: '1.4'
          }}>
            node_modules含む全ファイル読込みで処理が重くなります
          </div>
        </div>
      </div>

      {/* セキュリティ情報 */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '16px'
      }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: '500', 
          color: '#475569', 
          marginBottom: '6px',
          textAlign: 'center'
        }}>
          🔒 セキュリティとプライバシー
        </div>
        <div style={{
          fontSize: '11px',
          color: '#64748b',
          lineHeight: '1.4',
          textAlign: 'center'
        }}>
          • あなたのファイルは安全：ブラウザ内でのみ処理され、外部に送信されません<br />
          • 選択したフォルダのみアクセス（他のフォルダには一切触れません）<br />
          • <span style={{ color: '#ef4444', fontWeight: '500' }}>ページを更新すると、セキュリティのためリアルタイム監視がリセットされます</span>
        </div>
      </div>
    </div>
  );
};

export default LocalProjectInput;
// components/layouts/StatusSection.tsx
// ステータス表示UI（履歴、エラー、ローディング） - App.tsxから抽出

import React from 'react';

interface StatusSectionProps {
  recentUrls: string[];
  repoUrl: string;
  error: string;
  isLoading: boolean;
  onUrlSelect: (url: string) => void;
  onClear: () => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  recentUrls,
  repoUrl,
  error,
  isLoading,
  onUrlSelect,
  onClear,
}) => {
  return (
    <>
      {/* URL履歴表示 */}
      {recentUrls.length > 0 && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#f8f9fa',
            margin: '0 20px 10px',
            borderRadius: '6px',
          }}
        >
          <small style={{ color: '#6b7280' }}>最近のリポジトリ：</small>
          {recentUrls.map((url) => (
            <button
              key={url}
              onClick={() => onUrlSelect(url)}
              style={{
                marginLeft: '10px',
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {url.split('/').slice(-2).join('/')}
            </button>
          ))}
        </div>
      )}

      {/* 現在のリポジトリとクリアボタン */}
      {repoUrl && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#e8f4fd',
            margin: '0 20px',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <small style={{ color: '#1976d2' }}>
            現在のリポジトリ: {repoUrl}
          </small>
          <button
            onClick={onClear}
            style={{
              padding: '4px 8px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            クリア
          </button>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#fee',
            margin: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#c00',
          }}
        >
          ⚠️ エラー: {error}
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
    </>
  );
};

export default StatusSection;
import { useState } from 'react';

interface URLInputProps {
  onSubmit: (url: string) => void;
}

// URLInput.tsx

// URLInput.tsx

const URLInput: React.FC<URLInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* 注意書き */}
      <div
        style={{
          marginBottom: '20px',
          padding: '12px 15px',
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: '0 0 8px 0',
                color: '#c2410c',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              ⚠️ GitHub API利用に関する注意
            </h4>
            <div
              style={{
                fontSize: '12px',
                color: '#7c2d12',
                lineHeight: '1.5',
              }}
            >
              <div style={{ marginBottom: '4px' }}>
                • <strong>API制限：</strong>
                1時間60回まで（未認証）により開発停止中
              </div>
              <div style={{ marginBottom: '4px' }}>
                • <strong>現状の仕様：</strong>
                GitHubリポジトリの読み込み /
                中規模以上のプロジェクトは1発で制限にかかる恐れあり
              </div>
              <div
                style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  backgroundColor: '#ffedd5',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}
              >
                💡 ローカルモードの利用を推奨します
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 既存のフォーム */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <input
            type='text'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='https://github.com/user/repo'
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              outline: 'none',
            }}
          />
          <button
            type='submit'
            style={{
              padding: '10px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#2563eb')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#3b82f6')
            }
          >
            取得
          </button>
        </div>
        <div
          style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          例: https://github.com/facebook/react（小規模リポジトリ推奨）
        </div>
      </form>
    </div>
  );
};
export default URLInput;

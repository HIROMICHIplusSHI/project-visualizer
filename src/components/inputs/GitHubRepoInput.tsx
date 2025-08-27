// components/inputs/GitHubRepoInput.tsx
// GitHubリポジトリ入力UI - ProjectInputSection.tsxから抽出

import React from 'react';
import URLInput from '../URLInput';

interface GitHubRepoInputProps {
  onURLSubmit: (url: string) => void;
}

const GitHubRepoInput: React.FC<GitHubRepoInputProps> = ({
  onURLSubmit,
}) => {
  return (
    <div style={{
      padding: '40px 30px',
      backgroundColor: 'white'
    }}>
      {/* ヘッダーセクション */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ 
          fontSize: '48px',
          marginBottom: '16px',
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          backgroundColor: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'white'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: '12px',
          margin: 0
        }}>
          GitHubリポジトリ
        </h3>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.5',
          margin: 0
        }}>
          パブリックリポジトリのURLから<br />
          プロジェクト構造を解析
        </p>
      </div>

      {/* GitHub API情報 */}
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
          🔗 GitHub API連携
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: '#64748b', 
          lineHeight: '1.5',
          marginBottom: '8px'
        }}>
          パブリックリポジトリのみ対応・ファイル内容は表示されません
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#64748b',
          padding: '6px 10px',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          📊 API制限: 60回/時間（未認証時）
        </div>
      </div>
      
      {/* GitHub URL入力フィールド */}
      <URLInput onSubmit={onURLSubmit} />
    </div>
  );
};

export default GitHubRepoInput;
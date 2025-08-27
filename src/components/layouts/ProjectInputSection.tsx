// components/layouts/ProjectInputSection.tsx
// プロジェクト入力セクションUI - App.tsxから抽出

import URLInput from '../URLInput';

interface ProjectInputSectionProps {
  show: boolean;
  onDirectorySelect: () => void;
  onLocalFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onURLSubmit: (url: string) => void;
}

const ProjectInputSection: React.FC<ProjectInputSectionProps> = ({ 
  show, 
  onDirectorySelect,
  onLocalFolderSelect, 
  onURLSubmit 
}) => {
  if (!show) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: 'calc(100vh - 400px)',
      backgroundColor: '#f3f4f6'
    }}>
      {/* 左側: ローカルプロジェクト */}
      <div style={{
        padding: '40px 30px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb'
      }}>
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

        {/* ディレクトリ選択エリア */}
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

        {/* 従来の方法（旧式） */}
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

        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: '1.4',
          marginTop: '16px'
        }}>
          セキュリティ: ブラウザはファイルシステムに直接アクセスしません。<br />
          選択されたフォルダのみアクセス許可されます。
        </div>
      </div>

      {/* 右側: GitHubリポジトリ */}
      <div style={{
        padding: '40px 30px',
        backgroundColor: 'white'
      }}>
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
        
        {/* GitHub URL入力 */}
        <URLInput onSubmit={onURLSubmit} />
      </div>
    </div>
  );
};

export default ProjectInputSection;
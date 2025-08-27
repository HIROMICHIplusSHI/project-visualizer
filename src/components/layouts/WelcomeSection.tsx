// components/layouts/WelcomeSection.tsx
// アプリケーションの機能説明UI - App.tsxから抽出

interface WelcomeSectionProps {
  show: boolean;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div style={{ 
      padding: '40px 20px 30px', 
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb' 
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          React プロジェクト可視化ツール
        </h2>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          React/TypeScriptプロジェクトの構造を直感的に可視化し、<br />
          ファイル間の依存関係をインタラクティブなグラフで表示します
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '32px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              color: 'white'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '8px'
            }}>
              構造分析
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              プロジェクトの全体構造とファイル階層を一目で把握
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              color: 'white'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '8px'
            }}>
              依存関係可視化
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              ファイル間の依存関係をインタラクティブなグラフで表示
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              color: 'white'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '8px'
            }}>
              影響範囲分析
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              ファイル変更の影響範囲をリアルタイムで分析
            </p>
          </div>
        </div>

        <div style={{ 
          maxWidth: '600px', 
          margin: '32px auto 0',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            主な機能
          </h3>
          
          <ul style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            listStyle: 'none',
            paddingLeft: '0'
          }}>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: '#10b981', marginRight: '8px', marginTop: '2px' }}>✓</span>
              <span><strong>リアルタイム依存関係マッピング:</strong> import/export関係を自動解析</span>
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: '#10b981', marginRight: '8px', marginTop: '2px' }}>✓</span>
              <span><strong>インタラクティブ力学グラフ:</strong> D3.jsベースの直感的な可視化</span>
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: '#10b981', marginRight: '8px', marginTop: '2px' }}>✓</span>
              <span><strong>ファイルフィルタリング:</strong> 主要ファイル/全ファイルの切り替え表示</span>
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: '#10b981', marginRight: '8px', marginTop: '2px' }}>✓</span>
              <span><strong>影響範囲可視化:</strong> 変更ファイルが与える影響を即座に特定</span>
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: '#10b981', marginRight: '8px', marginTop: '2px' }}>✓</span>
              <span><strong>デュアルビュー:</strong> グラフビューとツリービューの統合表示</span>
            </li>
          </ul>

          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '16px',
            lineHeight: '1.5'
          }}>
            ※ Reactプロジェクトに最適化されていますが、TypeScript/JavaScriptファイルも部分的にサポート
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
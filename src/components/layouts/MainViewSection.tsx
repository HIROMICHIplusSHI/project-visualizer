// components/layouts/MainViewSection.tsx
// メインビュー表示部分（リスト、グラフ、分割ビュー） - App.tsxから抽出

import React from 'react';
import type { GitHubFile } from '../../services/githubApi';
import FileTreeExplorer from '../FileTreeExplorer';
import ForceGraph from '../ForceGraph';

interface MainViewSectionProps {
  viewMode: 'list' | 'graph' | 'split';
  filteredFiles: GitHubFile[];
  selectedFile: GitHubFile | null;
  impactMode: boolean;
  changedFiles: string[];
  onFileSelect: (file: GitHubFile | null) => void;
  onResetImpactMode: () => void;
}

const MainViewSection: React.FC<MainViewSectionProps> = ({
  viewMode,
  filteredFiles,
  selectedFile,
  impactMode,
  changedFiles,
  onFileSelect,
  onResetImpactMode,
}) => {
  return (
    <div style={{ height: 'calc(100vh - 350px)' }}>
      {/* リストビュー */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', height: '100%' }}>
          <FileTreeExplorer
            files={filteredFiles}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
          <div
            style={{ flex: 1, padding: '20px', backgroundColor: '#fff' }}
          >
            {selectedFile ? (
              <div>
                <h3>📄 {selectedFile.name}</h3>
                <div style={{ marginTop: '20px' }}>
                  <p>
                    <strong>パス:</strong> {selectedFile.path}
                  </p>
                  <p>
                    <strong>サイズ:</strong>{' '}
                    {selectedFile.size
                      ? `${selectedFile.size} bytes`
                      : '不明'}
                  </p>
                  
                  {/* 基本情報表示後の拡張機能エリア */}
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#64748b',
                      marginBottom: '8px'
                    }}>
                      🔧 拡張機能
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      lineHeight: '1.5'
                    }}>
                      • <strong>依存関係分析</strong>: グラフビューの影響範囲可視化に統合済み<br />
                      • <strong>AIファイル診断</strong>: 今後のバージョンで実装予定<br />
                      • <strong>コード品質メトリクス</strong>: 将来的な機能拡張として検討中
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: '#999',
                  textAlign: 'center',
                  marginTop: '50px',
                }}
              >
                ファイルを選択してください
              </div>
            )}
          </div>
        </div>
      )}

      {/* グラフビュー */}
      {viewMode === 'graph' && (
        <ForceGraph 
          files={filteredFiles} 
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          impactMode={impactMode}
          changedFiles={changedFiles}
          onResetImpactMode={onResetImpactMode}
        />
      )}

      {/* 分割ビュー */}
      {viewMode === 'split' && (
        <div style={{ display: 'flex', height: '100%' }}>
          <FileTreeExplorer
            files={filteredFiles}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
          <div style={{ flex: 1 }}>
            <ForceGraph 
              files={filteredFiles}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              impactMode={impactMode}
              changedFiles={changedFiles}
              onResetImpactMode={onResetImpactMode}
            />
          </div>
          <div
            style={{
              width: '300px',
              padding: '20px',
              borderLeft: '1px solid #e0e0e0',
              backgroundColor: '#fff',
            }}
          >
            {selectedFile ? (
              <div>
                <h3>📄 {selectedFile.name}</h3>
                <div style={{ marginTop: '20px' }}>
                  <p>
                    <strong>パス:</strong> {selectedFile.path}
                  </p>
                  <p>
                    <strong>サイズ:</strong>{' '}
                    {selectedFile.size
                      ? `${selectedFile.size} bytes`
                      : '不明'}
                  </p>
                  
                  {/* 基本情報表示後の拡張機能エリア */}
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#64748b',
                      marginBottom: '8px'
                    }}>
                      🔧 拡張機能
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      lineHeight: '1.5'
                    }}>
                      • <strong>依存関係分析</strong>: グラフビューの影響範囲可視化に統合済み<br />
                      • <strong>AIファイル診断</strong>: 今後のバージョンで実装予定<br />
                      • <strong>コード品質メトリクス</strong>: 将来的な機能拡張として検討中
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: '#999',
                  textAlign: 'center',
                  marginTop: '50px',
                }}
              >
                ファイルを選択してください
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainViewSection;
// components/layouts/MainViewSection.tsx
// メインビュー表示部分（リスト、グラフ、分割ビュー） - App.tsxから抽出

import React, { useState, useEffect } from 'react';
import type { GitHubFile } from '../../services/githubApi';
import FileTreeExplorer from '../FileTreeExplorer';
import ForceGraph from '../ForceGraph';
import { formatLineCount } from '../../utils/fileUtils';

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isCompactLayout, setIsCompactLayout] = useState(false);

  // ウィンドウサイズ監視
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      setIsCompactLayout(newWidth < 1200); // 1200px未満はコンパクトレイアウト
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初期チェック

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                    <strong>行数:</strong>{' '}
                    {formatLineCount(selectedFile.lineCount)}
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
        <div style={{ 
          display: 'flex', 
          height: '100%',
          minWidth: isCompactLayout ? '700px' : '800px',
          gap: '0', // 空白を完全に除去
          flexDirection: windowWidth < 900 ? 'column' : 'row' // 非常に小さい画面では縦並び
        }}>
          <div style={{ 
            minWidth: isCompactLayout ? '200px' : '250px',
            maxWidth: isCompactLayout ? '300px' : '400px',
            flex: windowWidth < 900 ? '0 0 200px' : `0 0 ${isCompactLayout ? '20%' : '25%'}`,
            borderRight: 'none', // 境界線を完全に除去
            borderBottom: windowWidth < 900 ? '1px solid #e0e0e0' : 'none'
          }}>
            <FileTreeExplorer
              files={filteredFiles}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              isCompact={true}
            />
          </div>
          
          <div style={{ 
            flex: windowWidth < 900 ? '1' : `1 1 ${isCompactLayout ? '60%' : '50%'}`,
            minWidth: isCompactLayout ? '350px' : '400px',
            marginLeft: '0' // 左マージンを確実に0に
          }}>
            <ForceGraph 
              files={filteredFiles}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              impactMode={impactMode}
              changedFiles={changedFiles}
              onResetImpactMode={onResetImpactMode}
              isInSplitView={true}
            />
          </div>
          
          {/* 詳細パネルは小さい画面では非表示にするか縮小 */}
          {windowWidth > 800 && (
            <div
              style={{
                minWidth: isCompactLayout ? '200px' : '250px',
                maxWidth: isCompactLayout ? '280px' : '350px',
                flex: windowWidth < 900 ? '0 0 150px' : `0 0 ${isCompactLayout ? '20%' : '25%'}`,
                padding: isCompactLayout ? '15px' : '20px',
                borderLeft: windowWidth < 900 ? 'none' : '1px solid #e0e0e0',
                borderTop: windowWidth < 900 ? '1px solid #e0e0e0' : 'none',
                backgroundColor: '#fff',
                overflow: 'auto',
              }}
            >
              {selectedFile ? (
                <div>
                  <h3 style={{ 
                    fontSize: isCompactLayout ? '16px' : '18px',
                    margin: '0 0 10px 0'
                  }}>
                    📄 {selectedFile.name}
                  </h3>
                  <div style={{ 
                    marginTop: isCompactLayout ? '10px' : '20px',
                    fontSize: isCompactLayout ? '12px' : '14px'
                  }}>
                    <p style={{ marginBottom: '8px' }}>
                      <strong>パス:</strong> <br />
                      <span style={{ 
                        fontSize: isCompactLayout ? '11px' : '12px',
                        wordBreak: 'break-all'
                      }}>
                        {selectedFile.path}
                      </span>
                    </p>
                    <p style={{ marginBottom: '8px' }}>
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
          )}
        </div>
      )}
    </div>
  );
};

export default MainViewSection;
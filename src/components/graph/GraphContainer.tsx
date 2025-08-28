// components/graph/GraphContainer.tsx
// グラフUIレイアウト専用コンポーネント - ForceGraph.tsxから抽出

import React, { useRef } from 'react';
import type { GitHubFile } from '../../services/githubApi';
import GraphRenderer from './GraphRenderer';
import { GRAPH_CONFIG } from '../../constants/graphConfig';
import { getPerformanceSettings } from '../../constants/graphStyles';

interface GraphContainerProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  impactMode?: boolean;
  onResetImpactMode?: () => void;
  isInSplitView?: boolean; // 分割ビュー判定用
}

const GraphContainer: React.FC<GraphContainerProps> = ({
  files,
  selectedFile,
  onFileSelect,
  changedFiles,
  impactMode,
  onResetImpactMode,
  isInSplitView = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const perfSettings = getPerformanceSettings(files.length);
  
  // パフォーマンスレベルに応じた表示テキスト
  const getPerformanceLabel = (level: string) => {
    switch (level) {
      case 'light': return `⚡ ライトモード（${files.length}ファイル）`;
      case 'high': return `🚀 高速モード（${files.length}ファイル）`;
      case 'extreme': return `⚡🚀 極速モード（${files.length}ファイル）`;
      default: return null;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        padding: isInSplitView ? '0' : '20px', // 分割時は余白なし
        backgroundColor: isInSplitView ? '#ffffff' : '#f9fafb', // 分割時は白背景
        borderRadius: isInSplitView ? '0' : '8px',
        margin: '0',
        boxShadow: isInSplitView ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー情報 */}
      {!isInSplitView && (
        <>
          <h3
            style={{
              textAlign: 'center',
              color: '#374151',
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            依存関係グラフ
          </h3>
          
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            線は依存関係を表します。ホバーで関連ファイルを強調表示
            {perfSettings.isPerformanceMode && (
              <span style={{ color: '#f59e0b', marginLeft: '10px' }}>
                {getPerformanceLabel(perfSettings.performanceLevel)}
              </span>
            )}
          </p>
        </>
      )}

      {/* SVGコンテナ */}
      <div
        style={{
          width: '100%',
          height: isInSplitView ? 'calc(100% - 10px)' : 'fit-content',
          overflow: 'auto',
          border: isInSplitView ? 'none' : '1px solid #e5e7eb',
          borderRadius: isInSplitView ? '0' : '8px',
          backgroundColor: 'white',
          minHeight: isInSplitView ? '300px' : 'auto',
        }}
      >
        <GraphRenderer 
          files={files}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          changedFiles={changedFiles}
          impactMode={impactMode}
          onResetImpactMode={onResetImpactMode}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
};

export default GraphContainer;
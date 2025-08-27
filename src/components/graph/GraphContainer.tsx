// components/graph/GraphContainer.tsx
// グラフUIレイアウト専用コンポーネント - ForceGraph.tsxから抽出

import React, { useRef } from 'react';
import type { GitHubFile } from '../../services/githubApi';
import GraphRenderer from './GraphRenderer';
import { GRAPH_CONFIG } from '../../constants/graphConfig';

interface GraphContainerProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  impactMode?: boolean;
}

const GraphContainer: React.FC<GraphContainerProps> = ({
  files,
  selectedFile,
  onFileSelect,
  changedFiles,
  impactMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        margin: '0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー情報 */}
      <h3
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#374151',
          margin: '0 0 8px 0',
        }}
      >
        依存関係グラフ
      </h3>
      
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        線は依存関係を表します。ホバーで関連ファイルを強調表示
        {files.length > GRAPH_CONFIG.performance.labelThreshold && (
          <span style={{ color: '#f59e0b', marginLeft: '10px' }}>
            ⚡ パフォーマンスモード（{files.length}ファイル）
          </span>
        )}
      </p>

      {/* SVGコンテナ */}
      <div
        style={{
          width: '100%',
          height: 'fit-content',
          overflow: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: 'white',
        }}
      >
        <GraphRenderer 
          files={files}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          changedFiles={changedFiles}
          impactMode={impactMode}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
};

export default GraphContainer;
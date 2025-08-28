// components/graph/GraphContainer.tsx
// グラフUIレイアウト専用コンポーネント - ForceGraph.tsxから抽出

import React, { useRef } from 'react';
import type { GitHubFile } from '../../services/githubApi';
import GraphRenderer from './GraphRenderer';
import FileTreeExplorer from '../FileTreeExplorer';
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
        padding: isInSplitView ? '0' : '20px',
        backgroundColor: isInSplitView ? '#ffffff' : '#f9fafb',
        borderRadius: isInSplitView ? '0' : '8px',
        margin: '0',
        boxShadow: isInSplitView ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >


      {/* メインコンテンツ（サイドパネル + グラフ） */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          gap: '0'
        }}
      >
        {/* ツリービューサイドパネル（単体グラフビューの時のみ） */}
        {!isInSplitView && (
          <div
            style={{
              width: '300px',
              minWidth: '250px',
              maxWidth: '400px',
              borderRight: '1px solid #e5e7eb',
              backgroundColor: '#fafafa',
              overflow: 'hidden'
            }}
          >
            <FileTreeExplorer
              files={files}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              isCompact={true}
            />
          </div>
        )}

        {/* グラフエリア */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: 'white',
            minHeight: '300px',
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
    </div>
  );
};

export default GraphContainer;
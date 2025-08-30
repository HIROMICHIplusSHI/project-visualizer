// src/components/ForceGraph.tsx
// D3.js力学グラフ統合コンポーネント - 分離されたコンポーネントを統合

import React from 'react';
import type { ForceGraphProps } from '../types';
import GraphContainer from './graph/GraphContainer';

// ForceGraphProps型は src/types/components.ts に移行

const ForceGraph: React.FC<ForceGraphProps> = ({
  files,
  selectedFile,
  onFileSelect,
  changedFiles,
  impactMode,
  onResetImpactMode,
  isInSplitView = false
}) => {
  return (
    <GraphContainer 
      files={files}
      selectedFile={selectedFile}
      onFileSelect={onFileSelect}
      changedFiles={changedFiles}
      impactMode={impactMode}
      onResetImpactMode={onResetImpactMode}
      isInSplitView={isInSplitView}
    />
  );
};

export default ForceGraph;
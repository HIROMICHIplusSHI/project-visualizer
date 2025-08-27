// src/components/ForceGraph.tsx
// D3.js力学グラフ統合コンポーネント - 分離されたコンポーネントを統合

import React from 'react';
import type { GitHubFile } from '../services/githubApi';
import GraphContainer from './graph/GraphContainer';

interface ForceGraphProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  impactMode?: boolean;
}

const ForceGraph: React.FC<ForceGraphProps> = ({
  files,
  selectedFile,
  onFileSelect,
  changedFiles,
  impactMode
}) => {
  return (
    <GraphContainer 
      files={files}
      selectedFile={selectedFile}
      onFileSelect={onFileSelect}
      changedFiles={changedFiles}
      impactMode={impactMode}
    />
  );
};

export default ForceGraph;
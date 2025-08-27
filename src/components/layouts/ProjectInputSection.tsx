// components/layouts/ProjectInputSection.tsx
// プロジェクト入力セクション統合レイアウト - 分離されたコンポーネントを統合

import React from 'react';
import LocalProjectInput from '../inputs/LocalProjectInput';
import GitHubRepoInput from '../inputs/GitHubRepoInput';

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
      {/* 左側: ローカルプロジェクト入力 */}
      <LocalProjectInput 
        onDirectorySelect={onDirectorySelect}
        onLocalFolderSelect={onLocalFolderSelect}
      />

      {/* 右側: GitHubリポジトリ入力 */}
      <GitHubRepoInput 
        onURLSubmit={onURLSubmit}
      />
    </div>
  );
};

export default ProjectInputSection;
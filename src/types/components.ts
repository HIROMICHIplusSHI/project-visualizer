// UIコンポーネント関連の型定義
// Props型やコンポーネント固有の型

import type { GitHubFile } from './api';

export interface ForceGraphProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  impactMode?: boolean;
  onResetImpactMode?: () => void;
  isInSplitView?: boolean;
}

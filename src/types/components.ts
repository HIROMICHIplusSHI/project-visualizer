// UIコンポーネント関連の型定義
// Props型やコンポーネント固有の型

import type { GitHubFile } from './api';

// 共通データ型
export interface FileData {
  id: number;
  name: string;
  path?: string;
  type?: 'file' | 'dir';
  size?: number;
  dependencies?: string[];
}

// メインコンポーネント型
export interface ForceGraphProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  impactMode?: boolean;
  onResetImpactMode?: () => void;
  isInSplitView?: boolean;
}

// 基本コンポーネント型
export interface FileNodeProps {
  fileName: string;
  dependencies?: string[];
  isSelected?: boolean;
  isDependency?: boolean;
  onSelect?: () => void;
}

export interface HeaderProps {
  title: string;
  onNewProject?: () => void;
}

export interface URLInputProps {
  onSubmit: (url: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// UI コンポーネント型
export interface FileIconProps {
  fileName: string;
  size?: number;
}

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export interface LineCountBadgeProps {
  count: number;
  variant?: 'default' | 'highlighted';
}

// リスト・表示系コンポーネント型
export interface FileListProps {
  files: FileData[];
}

export interface ViewTabsProps {
  currentView: 'list' | 'graph' | 'split';
  onViewChange: (view: 'list' | 'graph' | 'split') => void;
  showRealtimeMonitor?: boolean;
  isMonitoring?: boolean;
  onToggleMonitoring?: () => void;
}

export interface ProjectTreeViewProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile) => void;
}

export interface FileTreeExplorerProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  showLineCount?: boolean;
}

// レイアウトコンポーネント型
export interface MainViewSectionProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  activeView: string;
  impactMode?: boolean;
  onResetImpactMode?: () => void;
}

export interface ProjectInputSectionProps {
  onFilesLoad: (files: GitHubFile[], repoUrl?: string) => void;
  isLoading?: boolean;
}

export interface WelcomeSectionProps {
  show: boolean;
  onDemoClick: () => void;
}

export interface StatusSectionProps {
  fileCount: number;
  selectedFile?: GitHubFile | null;
  isLoading?: boolean;
}

export interface FileListSectionProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  searchQuery?: string;
}

// フォーム・入力コンポーネント型
export interface GitHubRepoInputProps {
  onURLSubmit: (url: string) => void;
  isLoading?: boolean;
}

export interface LocalProjectInputProps {
  onFilesLoad: (files: GitHubFile[]) => void;
  isLoading?: boolean;
}

// グラフコンポーネント型
export interface GraphContainerProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  impactMode?: boolean;
  onResetImpactMode?: () => void;
}

export interface GraphRendererProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  canvasSize: { width: number; height: number };
  changedFiles?: string[];
  impactMode?: boolean;
}

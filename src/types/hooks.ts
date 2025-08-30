// Hooks関連の型定義
// カスタムフックの戻り値型や引数型

// 📏 ファイルサイズ監視 (現在: 127行, 13型)
// 🚨 分割検討: 150行超で機能別分割を推奨
//   - api-hooks.ts (API系Hook型)
//   - ui-hooks.ts (UI系Hook型)
//   - data-hooks.ts (データ処理系Hook型)

import type { GitHubFile } from './api';

// 共通型定義
export interface ProcessingStats {
  total: number;
  processed: number;
  skipped: number;
  errors: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

// Hook戻り値型
export interface UseGitHubApiReturn {
  // States
  isLoading: boolean;
  error: string;
  
  // Actions  
  fetchRepository: (url: string) => Promise<GitHubFile[]>;
  clearError: () => void;
}

export interface UseDirectoryApiReturn {
  // States
  isLoading: boolean;
  error: string;
  
  // Actions
  selectDirectory: () => Promise<{ files: GitHubFile[]; dirHandle: any } | null>;
  clearError: () => void;
  
  // Utilities
  isSupported: () => boolean;
}

export interface UseFileStorageReturn {
  // States
  files: GitHubFile[];
  repoUrl: string;
  recentUrls: string[];
  
  // Actions
  setFiles: (files: GitHubFile[]) => void;
  setRepoUrl: (url: string) => void;
  addRecentUrl: (url: string) => void;
  setRecentUrls: (urls: string[]) => void;
  clearStorage: () => void;
  clearAll: () => void;
}

export interface UseLocalFilesReturn {
  // States
  isLoading: boolean;
  error: string;
  
  // Actions
  loadLocalFolder: (event: React.ChangeEvent<HTMLInputElement>) => Promise<GitHubFile[]>;
  clearError: () => void;
}

export interface UseDragBehaviorReturn {
  createDragBehavior: (
    simulation: any // d3.Simulation型（循環依存回避）
  ) => any; // d3.DragBehavior型
}

export interface UseZoomControlsReturn {
  createZoomBehavior: (svg: any) => {
    g: any;
    zoom: any;
  };
  createZoomControls: (
    parentElement: HTMLElement,
    svg: any,
    zoom: any,
    onReset: () => void
  ) => void;
}

export interface UseNodeEventsReturn {
  handleNodeClick: (_event: any, d: any) => void; // D3Node型（循環依存回避）
  handleNodeMouseEnter: (
    nodeGroup: any,
    linkElements: any,
    dependencyMap: Record<string, string[]>
  ) => ((this: SVGGElement, _event: any, d: any) => void) | undefined;
  handleNodeMouseLeave: (
    nodeGroup: any,
    linkElements: any,
    dependencyMap: Record<string, string[]>
  ) => ((this: SVGGElement) => void) | undefined;
}

// Hook Props型
export interface UseNodeEventsProps {
  files: GitHubFile[];
  onFileSelect?: (file: GitHubFile | null) => void;
  selectedFile?: GitHubFile | null;
  changedFiles?: string[];
  impactMode?: boolean;
}

export interface UseForceSimulationProps {
  files: GitHubFile[];
  canvasSize: CanvasSize;
  changedFiles?: string[];
  impactMode?: boolean;
}

export interface UseCanvasSizeProps {
  files: any[]; // 汎用配列型
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export interface UseGraphInteractionsProps {
  files: GitHubFile[];
  canvasSize: CanvasSize;
  onFileSelect?: (file: GitHubFile | null) => void;
  selectedFile?: GitHubFile | null;
  changedFiles?: string[];
  impactMode?: boolean;
}

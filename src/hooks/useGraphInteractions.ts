// hooks/useGraphInteractions.ts
// D3.jsグラフインタラクション統合フック - 分離された専門フックを統合

import type { GitHubFile } from '../services/githubApi';
import type { UseGraphInteractionsProps } from '../types/hooks';

// 分離されたフックをインポート
import { useZoomControls } from './useZoomControls';
import { useDragBehavior } from './useDragBehavior';
import { useNodeEvents } from './useNodeEvents';

// TODO(human): UseGraphInteractionsProps 型定義を hooks.ts に移行完了

export const useGraphInteractions = ({
  files,
  onFileSelect,
  selectedFile,
  changedFiles,
  impactMode
}: UseGraphInteractionsProps) => {
  // 各専門フックを初期化
  const zoomControls = useZoomControls();
  const dragBehavior = useDragBehavior();
  const nodeEvents = useNodeEvents({
    files,
    onFileSelect,
    selectedFile,
    changedFiles,
    impactMode
  });

  // 統合されたインターフェースを返す
  return {
    // ズーム関連機能
    createZoomBehavior: zoomControls.createZoomBehavior,
    createZoomControls: zoomControls.createZoomControls,
    
    // ドラッグ機能
    createDragBehavior: dragBehavior.createDragBehavior,
    
    // ノードイベント機能
    handleNodeClick: nodeEvents.handleNodeClick,
    handleNodeMouseEnter: nodeEvents.handleNodeMouseEnter,
    handleNodeMouseLeave: nodeEvents.handleNodeMouseLeave,
  };
};
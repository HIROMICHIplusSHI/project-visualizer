// 共通ユーティリティ型定義
// 汎用的な型やヘルパー型

import * as d3 from 'd3';

// よく使われるイベントハンドラー型
export type EventHandler<T = void> = () => T;
export type EventHandlerWithParam<P, T = void> = (param: P) => T;

// 選択可能なアイテムの共通型
export interface Selectable {
  id: number;
}

// ファイルフィルタリング用の型（名前空間分離）
export type FileFilterFunction = (fileName: string) => boolean;  // 関数型
export type FileFilterType = 'all' | 'withDeps' | 'main';       // リテラル型

// D3グラフ関連の型（重複解決）
export interface D3Node extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  type?: 'file' | 'dir';
  size?: number;
}

export interface D3Link {
  source: number | D3Node;
  target: number | D3Node;
}

// 共通的なローディング状態
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// ファイルツリー関連型
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  file?: any; // GitHubFile型（循環依存回避のためany使用）
  isExpanded?: boolean;
  level: number;
}

// グラフ設定関連型（typeof 参照型）
export type CanvasConfig = {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  containerMargin: number;
  baseFileCount: number;
  widthScaleFactor: number;
  heightScaleFactor: number;
};

export type NodeConfig = {
  baseRadius: number;
  minRadius: number;
  maxRadius: number;
  scaleFactor: number;
  strokeWidth: number;
};

export type SimulationConfig = {
  alphaDecay: number;
  velocityDecay: number;
  forceStrength: number;
  centerForce: number;
  collideRadius: number;
  linkDistance: number;
  linkStrength: number;
};

export type LayoutConfig = {
  padding: number;
  centerX: number;
  centerY: number;
};

export type GraphConfig = {
  canvas: CanvasConfig;
  node: NodeConfig;
  simulation: SimulationConfig;
  layout: LayoutConfig;
};

// サンプルデータ型
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

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

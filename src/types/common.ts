// 共通ユーティリティ型定義
// 汎用的な型やヘルパー型

// よく使われるイベントハンドラー型
export type EventHandler<T = void> = () => T;
export type EventHandlerWithParam<P, T = void> = (param: P) => T;

// 選択可能なアイテムの共通型
export interface Selectable {
  id: number;
}

// ファイルフィルタリング用の型
export type FileFilter = (fileName: string) => boolean;

// 共通的なローディング状態
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

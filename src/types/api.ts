// API関連の型定義
// GitHubFile等のAPI応答やデータ構造に関する型

export interface GitHubFile {
  name: string;
  path: string; // 必須のまま
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
  dependencies?: string[];
  id: number; // 必須に変更（?を削除）
  content?: string; // ファイル内容
  lineCount?: number; // 行数情報
}

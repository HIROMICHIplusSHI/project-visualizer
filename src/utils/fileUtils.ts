// utils/fileUtils.ts
// ファイル処理関連のユーティリティ関数

/**
 * ファイル内容から行数をカウントする
 * @param content ファイル内容
 * @returns 行数（空ファイルの場合は0）
 */
export const countLines = (content: string): number => {
  if (!content || content.trim() === '') {
    return 0;
  }
  
  // 改行文字で分割して行数を計算
  // 最後が改行で終わっていても正確にカウント
  const lines = content.split(/\r\n|\r|\n/);
  
  // 最後の行が空文字列の場合は除外（ファイル末尾の改行）
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    return lines.length - 1;
  }
  
  return lines.length;
};

/**
 * ファイル拡張子からコードファイルかどうかを判定
 * @param fileName ファイル名
 * @returns コードファイルの場合 true
 */
export const isCodeFile = (fileName: string): boolean => {
  const codeExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
    'py', 'rb', 'php', 'java', 'c', 'cpp', 'h', 'hpp',
    'go', 'rs', 'swift', 'kt', 'dart', 'scala',
    'html', 'htm', 'css', 'scss', 'sass', 'less',
    'json', 'xml', 'yaml', 'yml', 'toml', 'ini',
    'md', 'txt', 'sql', 'sh', 'bash', 'zsh'
  ];
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? codeExtensions.includes(extension) : false;
};

/**
 * 行数を見やすい形式でフォーマット
 * @param lineCount 行数
 * @returns フォーマットされた文字列
 */
export const formatLineCount = (lineCount?: number): string => {
  if (lineCount === undefined || lineCount === null) {
    return '-';
  }
  
  if (lineCount === 0) {
    return '空ファイル';
  }
  
  // 1000行以上の場合は K表記
  if (lineCount >= 1000) {
    const kCount = Math.floor(lineCount / 1000);
    const remainder = lineCount % 1000;
    if (remainder === 0) {
      return `${kCount}K行`;
    } else {
      return `${kCount}.${Math.floor(remainder / 100)}K行`;
    }
  }
  
  return `${lineCount}行`;
};
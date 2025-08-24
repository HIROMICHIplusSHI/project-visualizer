// src/constants/graphStyles.ts
import { theme } from '../styles/theme';

// アイコンのSVGパス（Lucideアイコンから取得）
export const iconPaths = {
  folder:
    'M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H11L9 5H5C3.89543 5 3 5.89543 3 7Z',
  react: 'M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17 M2 12L12 17L22 12',
  typescript: 'M4 4H20V20H4V4Z M9 17V12L11 14L13 12V17 M16 12H14V17',
  css: 'M5 3L4.35 6.34H17.94L17.5 8.5H3.92L3.26 11.83H16.85L16.09 15.64L10.61 17.45L5.86 15.64L6.19 14H2.85L2.06 18.5L9.91 21L18.96 18.5L20.16 11.97L20.4 10.76L21.94 3H5Z',
  javascript:
    'M3 3H21V21H3V3Z M7.73 16.73C8.23 17.73 9.1 18.55 10.7 18.55C12.45 18.55 13.6 17.65 13.6 15.9V10H11.6V15.85C11.6 16.6 11.3 16.85 10.65 16.85C10 16.85 9.75 16.45 9.5 16L7.73 16.73Z M14.65 16.35C15.25 17.5 16.35 18.55 18.3 18.55C20.3 18.55 21.75 17.45 21.75 15.65C21.75 13.95 20.75 13.2 19.05 12.5L18.4 12.25C17.6 11.9 17.25 11.65 17.25 11.05C17.25 10.55 17.6 10.15 18.25 10.15C18.9 10.15 19.25 10.4 19.55 11L21.25 10.15C20.6 8.95 19.65 8.5 18.25 8.5C16.5 8.5 15.3 9.65 15.3 11.1C15.3 12.65 16.3 13.45 17.75 14.05L18.4 14.3C19.25 14.7 19.8 14.95 19.8 15.65C19.8 16.25 19.3 16.7 18.25 16.7C17.05 16.7 16.5 16.1 16.05 15.35L14.65 16.35Z',
  file: 'M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z M14 2V8H20',
  json: 'M12 2L2 19H22L12 2Z M12 5.5L18.5 17.5H5.5L12 5.5Z',
};

// ノードスタイル
export const nodeStyles = {
  circle: {
    radius: 24,
    hoverRadius: 28,
    fill: 'white',
    stroke: theme.colors.border,
    strokeWidth: 2,
    hoverStrokeWidth: 3,
    shadow: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  },
  icon: {
    scale: 0.8,
    hoverScale: 1,
    translateX: -10,
    translateY: -10,
    hoverTranslateX: -12,
    hoverTranslateY: -12,
  },
  text: {
    fontSize: '13px', // ⭐ 12px → 13px（もう少し大きく）
    dy: 40,
    fontWeight: '600', // そのまま
    color: '#111827', // ⭐ さらに濃く
  },
};

// リンクスタイル
export const linkStyles = {
  default: {
    stroke: '#cbd5e1',
    strokeOpacity: 0.8,
    strokeWidth: 1.5,
  },
  hover: {
    stroke: theme.colors.accent,
    strokeWidth: 3,
  },
};

// ファイルタイプの判定
export const getFileType = (fileName: string): keyof typeof iconPaths => {
  if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return 'react';
  if (fileName.endsWith('.ts')) return 'typescript';
  if (fileName.endsWith('.js')) return 'javascript';
  if (fileName.endsWith('.css') || fileName.endsWith('.scss')) return 'css';
  if (fileName.endsWith('.json')) return 'json';
  return 'file';
};

// ファイルタイプごとの色（アイコンの色）
export const getFileColor = (fileName: string, isDir: boolean): string => {
  if (isDir) return '#f59e0b'; // アンバー（フォルダ）

  const fileType = getFileType(fileName);
  const colorMap: Record<keyof typeof iconPaths, string> = {
    folder: '#f59e0b', // アンバー
    react: '#06b6d4', // シアン（React）
    typescript: '#3b82f6', // ブルー（TypeScript）
    javascript: '#eab308', // イエロー（JavaScript）
    css: '#ec4899', // ピンク（CSS）
    json: '#10b981', // エメラルド（JSON）
    file: '#6b7280', // グレー（その他）
  };

  return colorMap[fileType];
};

// 背景色を取得する関数（薄い色）
export const getNodeBgColor = (fileName: string, isDir: boolean): string => {
  const color = getFileColor(fileName, isDir);
  // 色を薄くする
  const colorMap: Record<string, string> = {
    '#f59e0b': '#fef3c7', // アンバー → 薄いアンバー
    '#06b6d4': '#e0f2fe', // シアン → 薄いシアン
    '#3b82f6': '#dbeafe', // ブルー → 薄いブルー
    '#eab308': '#fef9c3', // イエロー → 薄いイエロー
    '#ec4899': '#fce7f3', // ピンク → 薄いピンク
    '#10b981': '#d1fae5', // エメラルド → 薄いエメラルド
    '#6b7280': '#f3f4f6', // グレー → 薄いグレー
  };

  return colorMap[color] || '#f9fafb';
};

// アニメーション設定
export const animations = {
  duration: 200,
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// src/constants/graphStyles.ts

// ⭐ パフォーマンスモード用の設定
export const getPerformanceSettings = (nodeCount: number) => {
  if (nodeCount > 100) {
    return {
      showLabels: false, // ラベル非表示
      showHoverEffects: false, // ホバー効果なし
      animationDuration: 0, // アニメーションなし
      alphaDecay: 0.1, // 早く収束
      velocityDecay: 0.8, // 動き制限
    };
  } else if (nodeCount > 50) {
    return {
      showLabels: true,
      showHoverEffects: false, // ホバー効果なし
      animationDuration: 100, // 短いアニメーション
      alphaDecay: 0.05,
      velocityDecay: 0.6,
    };
  }
  // デフォルト（50ファイル以下）
  return {
    showLabels: true,
    showHoverEffects: true,
    animationDuration: 200,
    alphaDecay: 0.02,
    velocityDecay: 0.4,
  };
};

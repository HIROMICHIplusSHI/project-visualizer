// src/constants/graphConfig.ts
// ForceGraph コンポーネントの設定値を一元管理

export const CANVAS_CONFIG = {
  // 動的キャンバスサイズ設定
  minWidth: 600,
  maxWidth: 1200,
  minHeight: 400,
  maxHeight: 1200,
  containerMargin: 40,
  
  // サイズ計算パラメータ
  baseFileCount: 10, // 基準ファイル数
  widthScaleFactor: 200, // 幅スケール係数
  heightScaleFactor: 150, // 高さスケール係数
  
  // ノード配置境界
  nodeBoundaryMargin: 30,
} as const;

export const NODE_CONFIG = {
  // ノードサイズ設定
  baseSizeSmall: 18, // デフォルトサイズ
  baseSizeLarge: 32, // 依存ファイルの最大サイズ
  
  // サイズ計算パラメータ
  connectionThreshold: 3, // 依存関係の閾値
  maxSizeMultiplier: 1.8, // 最大サイズ倍率
  
  // 衝突検出
  collisionPadding: {
    withHover: 25,
    withoutHover: 20,
  },
} as const;

export const SIMULATION_CONFIG = {
  // 力学シミュレーション設定
  centerStrength: 0.02, // 中心向心力
  
  // ハブレイアウト力
  hubCenterStrength: 0.1, // ハブファイル向心力
  dependentCircleStrength: 0.05, // 依存ファイル円形配置力
  
  // 反発力設定
  chargeStrength: {
    withHover: -100,
    withoutHover: -50,
    hubMultiplier: 2, // ハブファイルの反発力倍率
  },
  
  // リンク距離設定
  linkDistance: {
    base: 120, // 最小リンク距離
    multiplier: 3, // ノードサイズによる倍率
    padding: 60, // 追加パディング
  },
} as const;

export const LAYOUT_CONFIG = {
  // レイアウト設定
  hubThreshold: 24, // ハブファイル判定閾値（ノードサイズ）
  
  // 円形配置パラメータ
  circleRadius: {
    base: 100,
    multiplier: 1.5, // ハブサイズによる倍率
  },
} as const;

// 統合された設定オブジェクト（ForceGraphRefactored.tsx用）
export const GRAPH_CONFIG = {
  node: {
    boundaryPadding: NODE_CONFIG.collisionPadding.withoutHover,
  },
  performance: {
    labelThreshold: 100, // ラベル表示の閾値（ファイル数）
  },
} as const;

// 設定値の型定義をエクスポート
export type CanvasConfig = typeof CANVAS_CONFIG;
export type NodeConfig = typeof NODE_CONFIG;
export type SimulationConfig = typeof SIMULATION_CONFIG;
export type LayoutConfig = typeof LAYOUT_CONFIG;
export type GraphConfig = typeof GRAPH_CONFIG;
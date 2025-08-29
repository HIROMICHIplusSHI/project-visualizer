// src/utils/graphHelpers.ts
// ForceGraph コンポーネントのヘルパー関数群

import * as d3 from 'd3';
import { type GitHubFile } from '../services/githubApi';
import { 
  CANVAS_CONFIG, 
  NODE_CONFIG, 
  SIMULATION_CONFIG, 
  LAYOUT_CONFIG 
} from '../constants/graphConfig';

// D3ノード・リンクの型定義
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

/**
 * 動的キャンバスサイズを計算
 * @param fileCount ファイル数
 * @param containerWidth コンテナ幅
 * @returns 計算されたキャンバスサイズ
 */
export const calculateCanvasSize = (fileCount: number, containerWidth: number = 800) => {
  const { minWidth, maxWidth, minHeight, maxHeight, containerMargin, 
          baseFileCount, widthScaleFactor, heightScaleFactor } = CANVAS_CONFIG;
  
  const actualMaxWidth = Math.max(containerWidth - containerMargin, maxWidth);
  
  // ファイル数による基本サイズ計算（平方根を使用してバランスよく）
  const sizeFactor = Math.sqrt(fileCount / baseFileCount);
  
  const calculatedWidth = Math.min(actualMaxWidth, Math.max(minWidth, minWidth + sizeFactor * widthScaleFactor));
  const calculatedHeight = Math.min(maxHeight, Math.max(minHeight, minHeight + sizeFactor * heightScaleFactor));
  
  return {
    width: calculatedWidth,
    height: calculatedHeight
  };
};

/**
 * ファイルパスによる柔軟な検索（拡張子の違いも許容）
 * @param targetPath 検索対象パス
 * @param files ファイル配列
 * @returns 見つかったファイル
 */
export const findFileByPath = (targetPath: string, files: GitHubFile[]): GitHubFile | undefined => {
  // まず完全一致を試す
  let found = files.find(f => f.path === targetPath);
  if (found) return found;
  
  // 部分一致を試す
  found = files.find(f => 
    f.path?.endsWith(targetPath) || 
    targetPath.endsWith('/' + f.name)
  );
  if (found) return found;
  
  // 拡張子なしでベース名を取得して一致を試す
  const baseName = targetPath.replace(/\.[^.]*$/, '');
  found = files.find(f => {
    const fileBaseName = f.path.replace(/\.[^.]*$/, '');
    return fileBaseName === baseName;
  });
  
  return found;
};

/**
 * ノードサイズを計算（依存関係数に基づく）
 * @param file 対象ファイル
 * @param files 全ファイル配列
 * @returns 計算されたノードサイズ
 */
export const calculateNodeSize = (file: GitHubFile, files: GitHubFile[]): number => {
  const { baseSizeSmall, baseSizeLarge, connectionThreshold, maxSizeMultiplier } = NODE_CONFIG;
  
  const dependencyCount = file.dependencies?.length || 0;
  const referencedCount = files.filter(f => 
    f.dependencies?.some(dep => 
      findFileByPath(dep, files)?.id === file.id
    )
  ).length;
  
  const totalConnections = dependencyCount + referencedCount;
  
  if (totalConnections === 0) return baseSizeSmall;
  
  // 依存関係が多いほど大きく（最大サイズまで）
  const sizeMultiplier = Math.min(totalConnections / connectionThreshold, maxSizeMultiplier);
  return Math.max(baseSizeSmall, Math.min(baseSizeLarge, baseSizeSmall * sizeMultiplier));
};

/**
 * D3ノードデータを生成
 * @param files ファイル配列
 * @returns D3ノード配列
 */
export const createNodes = (files: GitHubFile[]): D3Node[] => {
  return files.map((file) => ({
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
  }));
};

/**
 * D3リンクデータを生成（依存関係に基づく）
 * @param files ファイル配列
 * @returns D3リンク配列
 */
export const createLinks = (files: GitHubFile[]): D3Link[] => {
  const links: D3Link[] = [];
  
  files.forEach((file) => {
    if (file.dependencies) {
      file.dependencies.forEach((depPath) => {
        const targetFile = findFileByPath(depPath, files);
        if (targetFile && targetFile.id !== file.id) {
          links.push({
            source: file.id,
            target: targetFile.id,
          });
        }
      });
    }
  });
  
  return links;
};

/**
 * 依存関係マップを作成
 * @param files ファイル配列
 * @returns 依存関係マップ
 */
export const createDependencyMap = (files: GitHubFile[]): Record<string, string[]> => {
  const dependencyMap: Record<string, string[]> = {};
  
  files.forEach(file => {
    if (file.path && file.dependencies) {
      dependencyMap[file.path] = file.dependencies;
    }
  });
  
  return dependencyMap;
};

/**
 * ハブ中心レイアウトのカスタム力を生成
 * @param nodes ノード配列
 * @param files ファイル配列
 * @param hubFiles ハブファイル配列
 * @param width キャンバス幅
 * @param height キャンバス高さ
 * @returns カスタム力関数
 */
export const createCustomLayoutForce = (
  nodes: D3Node[], 
  files: GitHubFile[], 
  _hubFiles: D3Node[],
  width: number, 
  height: number
) => {
  const { hubCenterStrength, dependentCircleStrength } = SIMULATION_CONFIG;
  const { hubThreshold, circleRadius } = LAYOUT_CONFIG;
  
  return (alpha: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    nodes.forEach((node) => {
      const targetFile = files.find(f => f.id === node.id);
      if (!targetFile) return;
      
      const nodeSize = calculateNodeSize(targetFile, files);
      const isHub = nodeSize > hubThreshold;
      
      if (isHub) {
        // ハブファイルは中央付近に配置（強い向心力）
        const dx = centerX - (node.x || 0);
        const dy = centerY - (node.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const strength = distance > 0 ? (hubCenterStrength * alpha) : 0;
        
        node.vx = (node.vx || 0) + dx * strength;
        node.vy = (node.vy || 0) + dy * strength;
      } else {
        // 依存ファイルはハブの周りに円形配置
        const dependsOnHub = targetFile.dependencies?.some(dep => {
          const depFile = findFileByPath(dep, files);
          return depFile && calculateNodeSize(depFile, files) > hubThreshold;
        });
        
        if (dependsOnHub) {
          // 最も近いハブファイルを見つけて、その周りに配置
          const hubFiles = files.filter(f => calculateNodeSize(f, files) > hubThreshold);
          let closestHub: D3Node | null = null;
          let minDistance = Infinity;
          
          hubFiles.forEach(hubFile => {
            const hubNode = nodes.find(n => n.id === hubFile.id) as any;
            if (hubNode && hubNode.x !== undefined && hubNode.y !== undefined) {
              const dist = Math.sqrt(
                Math.pow((node.x || 0) - hubNode.x, 2) + 
                Math.pow((node.y || 0) - hubNode.y, 2)
              );
              if (dist < minDistance) {
                minDistance = dist;
                closestHub = hubNode;
              }
            }
          });
          
          if (closestHub && typeof (closestHub as any).x === 'number' && typeof (closestHub as any).y === 'number') {
            const hubSize = calculateNodeSize(
              files.find(f => f.id === (closestHub as any)!.id)!, files
            );
            const targetRadius = circleRadius.base + (hubSize - hubThreshold) * circleRadius.multiplier;
            
            const dx = (node.x || 0) - (closestHub as any).x;
            const dy = (node.y || 0) - (closestHub as any).y;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            
            if (currentDistance > 0) {
              const normalizedDx = dx / currentDistance;
              const normalizedDy = dy / currentDistance;
              
              const targetX = (closestHub as any).x + normalizedDx * targetRadius;
              const targetY = (closestHub as any).y + normalizedDy * targetRadius;
              
              const strength = dependentCircleStrength * alpha;
              node.vx = (node.vx || 0) + (targetX - (node.x || 0)) * strength;
              node.vy = (node.vy || 0) + (targetY - (node.y || 0)) * strength;
            }
          }
        }
      }
    });
  };
};

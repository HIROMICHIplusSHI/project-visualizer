// src/hooks/useCanvasSize.ts
// 動的キャンバスサイズ計算専用カスタムフック

import { useMemo, useRef, useEffect, useState } from 'react';
import { calculateCanvasSize } from '../utils/graphHelpers';

interface UseCanvasSizeProps {
  files: any[]; // ファイル配列
  containerRef?: React.RefObject<HTMLElement>;
}

interface CanvasSize {
  width: number;
  height: number;
}

/**
 * 動的キャンバスサイズを管理するカスタムフック
 * ファイル数とコンテナサイズに基づいて最適なキャンバスサイズを計算
 */
export const useCanvasSize = ({ files, containerRef }: UseCanvasSizeProps): CanvasSize => {
  const [containerWidth, setContainerWidth] = useState(800);
  
  // コンテナサイズの監視
  useEffect(() => {
    if (!containerRef?.current) return;
    
    const updateContainerWidth = () => {
      const width = containerRef.current?.clientWidth || 800;
      setContainerWidth(width);
    };
    
    // 初期サイズ設定
    updateContainerWidth();
    
    // リサイズ監視
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [containerRef]);
  
  // キャンバスサイズの計算（メモ化）
  const canvasSize = useMemo(() => {
    const { width, height } = calculateCanvasSize(files.length, containerWidth);
    
    console.log(`📐 Canvas size: ${width}x${height} for ${files.length} files`);
    
    return { width, height };
  }, [files.length, containerWidth]);
  
  return canvasSize;
};
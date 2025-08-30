// src/hooks/useCanvasSize.ts
// 動的キャンバスサイズ計算専用カスタムフック

import { useMemo, useEffect, useState } from 'react';
import { calculateCanvasSize } from '../utils/graphHelpers';
import type { UseCanvasSizeProps, CanvasSize } from '../types/hooks';

// TODO(human): UseCanvasSizeProps と CanvasSize 型定義を hooks.ts に移行完了

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
      const newWidth = containerRef.current?.clientWidth || 800;
      // デバウンス処理：幅の変化が大きい場合のみ更新
      setContainerWidth((prevWidth) => {
        const widthDiff = Math.abs(newWidth - prevWidth);
        // 20px以上の変化がある場合のみ更新（小さな変化を無視）
        if (widthDiff > 20) {
          // Container width changed
          return newWidth;
        }
        return prevWidth;
      });
    };
    
    // 初期サイズ設定
    updateContainerWidth();
    
    // リサイズ監視（デバウンス付き）
    let timeoutId: number;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateContainerWidth, 150);
    };
    
    const resizeObserver = new ResizeObserver(debouncedUpdate);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [containerRef]);
  
  // キャンバスサイズの計算（メモ化）
  const canvasSize = useMemo(() => {
    const { width, height } = calculateCanvasSize(files.length, containerWidth);
    
    // Canvas size calculated
    
    return { width, height };
  }, [files.length, containerWidth]);
  
  return canvasSize;
};
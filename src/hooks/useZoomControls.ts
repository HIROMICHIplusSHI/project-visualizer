// hooks/useZoomControls.ts
// D3.jsグラフのズーム機能専用フック - useGraphInteractions.tsから抽出

import { useCallback } from 'react';
import * as d3 from 'd3';

interface UseZoomControlsReturn {
  createZoomBehavior: (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    g: d3.Selection<SVGGElement, unknown, null, undefined>;
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  };
  createZoomControls: (
    parentElement: HTMLElement,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
    onReset?: () => void
  ) => d3.Selection<HTMLDivElement, unknown, null, undefined>;
}

export const useZoomControls = (): UseZoomControlsReturn => {
  // ズーム機能の設定
  const createZoomBehavior = useCallback((svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    const g = svg.append('g');
    
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        // Zoom event handling
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    return { g, zoom };
  }, []);

  // リセットボタンのみ作成（中央下部に配置）
  const createZoomControls = useCallback((
    parentElement: HTMLElement,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
    onReset?: () => void
  ) => {
    // Creating reset button
    const resetButton = d3
      .select(parentElement)
      .append('div')
      .style('position', 'absolute')
      .style('bottom', '20px')
      .style('left', '50%')
      .style('transform', 'translateX(-50%)')
      .style('z-index', '10');

    // 目立つリセットボタン
    resetButton
      .append('button')
      .html('🔄 表示をリセット')
      .style('padding', '12px 24px')
      .style('cursor', 'pointer')
      .style('border', '2px solid #3b82f6')
      .style('background', 'linear-gradient(145deg, #ffffff, #f1f5f9)')
      .style('color', '#1e40af')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('box-shadow', '0 4px 12px rgba(59, 130, 246, 0.15)')
      .style('transition', 'all 0.2s ease')
      .on('mouseover', function() {
        d3.select(this)
          .style('transform', 'translateY(-2px)')
          .style('box-shadow', '0 6px 20px rgba(59, 130, 246, 0.25)')
          .style('background', 'linear-gradient(145deg, #f8fafc, #e2e8f0)');
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('transform', 'translateY(0)')
          .style('box-shadow', '0 4px 12px rgba(59, 130, 246, 0.15)')
          .style('background', 'linear-gradient(145deg, #ffffff, #f1f5f9)');
      })
      .on('click', () => {
        // Reset button clicked
        const currentTransform = d3.zoomTransform(svg.node()!); // eslint-disable-line @typescript-eslint/no-unused-vars
        // Current zoom transform before reset
        
        // ズーム/パン位置のリセット
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
        
        // ファイル選択のリセット
        if (onReset) {
          onReset();
          // File selection reset called
        }
        
        // リセット完了後に確認
        setTimeout(() => {
          const afterTransform = d3.zoomTransform(svg.node()!); // eslint-disable-line @typescript-eslint/no-unused-vars
          // Transform after reset
        }, 600);
      });

    return resetButton;
  }, []);

  return {
    createZoomBehavior,
    createZoomControls,
  };
};
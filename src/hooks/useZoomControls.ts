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
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>
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
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    return { g, zoom };
  }, []);

  // ズームコントロールボタンの作成
  const createZoomControls = useCallback((
    parentElement: HTMLElement,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>
  ) => {
    const controls = d3
      .select(parentElement)
      .append('div')
      .style('position', 'absolute')
      .style('top', '10px')
      .style('left', '10px')
      .style('display', 'flex')
      .style('gap', '5px')
      .style('z-index', '10');

    // ズームイン
    controls
      .append('button')
      .text('+')
      .style('padding', '5px 10px')
      .style('cursor', 'pointer')
      .style('border', '1px solid #d1d5db')
      .style('background', 'white')
      .style('border-radius', '4px')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.scaleBy, 1.3);
      });

    // ズームアウト
    controls
      .append('button')
      .text('-')
      .style('padding', '5px 10px')
      .style('cursor', 'pointer')
      .style('border', '1px solid #d1d5db')
      .style('background', 'white')
      .style('border-radius', '4px')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.scaleBy, 0.7);
      });

    // リセット
    controls
      .append('button')
      .html('↻')
      .style('padding', '5px 10px')
      .style('cursor', 'pointer')
      .style('border', '1px solid #d1d5db')
      .style('background', 'white')
      .style('border-radius', '4px')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
      });

    return controls;
  }, []);

  return {
    createZoomBehavior,
    createZoomControls,
  };
};
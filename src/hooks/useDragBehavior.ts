// hooks/useDragBehavior.ts
// D3.jsノードドラッグ機能専用フック - useGraphInteractions.tsから抽出

import { useCallback } from 'react';
import * as d3 from 'd3';
import type { D3Node, D3Link } from './useForceSimulation';

interface UseDragBehaviorReturn {
  createDragBehavior: (
    simulation: d3.Simulation<D3Node, D3Link>
  ) => d3.DragBehavior<SVGGElement, D3Node, D3Node | d3.SubjectPosition>;
}

export const useDragBehavior = (): UseDragBehaviorReturn => {
  // ドラッグ機能の設定
  const createDragBehavior = useCallback((
    simulation: d3.Simulation<D3Node, D3Link>
  ) => {
    return d3
      .drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }, []);

  return {
    createDragBehavior,
  };
};
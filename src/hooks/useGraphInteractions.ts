// hooks/useGraphInteractions.ts
// グラフのインタラクション（ズーム、ドラッグ、クリック、ホバー）を管理するカスタムフック
import { useCallback } from 'react';
import * as d3 from 'd3';
import type { GitHubFile } from '../services/githubApi';
import type { D3Node, D3Link } from './useForceSimulation';
import { getPerformanceSettings } from '../constants/graphStyles';
import { nodeStyles, linkStyles } from '../constants/graphStyles';

interface UseGraphInteractionsProps {
  files: GitHubFile[];
  onFileSelect?: (file: GitHubFile | null) => void;
  selectedFile?: GitHubFile | null;
  changedFiles?: string[];
  impactMode?: boolean;
}

export const useGraphInteractions = ({
  files,
  onFileSelect,
  selectedFile,
  changedFiles,
  impactMode
}: UseGraphInteractionsProps) => {
  const perfSettings = getPerformanceSettings(files.length);

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

  // クリックイベントハンドラー
  const handleNodeClick = useCallback((_event: any, d: D3Node) => {
    if (onFileSelect) {
      const selectedGitHubFile = files.find((f) => f.id === d.id);
      onFileSelect(selectedGitHubFile || null);
    }
  }, [files, onFileSelect]);

  // ホバーイベントハンドラー（エンター）
  const handleNodeMouseEnter = useCallback((
    nodeGroup: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>,
    linkElements: d3.Selection<SVGLineElement, D3Link, SVGGElement, unknown>,
    dependencyMap: Record<string, string[]>
  ) => {
    if (!perfSettings.showHoverEffects) return;

    return function (this: SVGGElement, _event: any, d: D3Node) {
      // ノードのホバー効果
      d3.select(this)
        .select('circle')
        .transition()
        .duration(perfSettings.animationDuration)
        .attr('r', nodeStyles.circle.hoverRadius)
        .attr('stroke-width', nodeStyles.circle.hoverStrokeWidth);

      d3.select(this)
        .select('path')
        .transition()
        .duration(perfSettings.animationDuration)
        .attr(
          'transform',
          `translate(${nodeStyles.icon.hoverTranslateX}, ${nodeStyles.icon.hoverTranslateY}) scale(${nodeStyles.icon.hoverScale})`
        );

      // 関連リンクの強調
      linkElements
        .style('stroke', (l) => {
          const link = l as D3Link;
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          if (sourceId === d.id || targetId === d.id) {
            if (impactMode && changedFiles && changedFiles.length > 0) {
              // Impact色があれば優先
              return linkStyles.impact.stroke;
            }
            return linkStyles.hover.stroke;
          }
          
          return linkStyles.default.stroke;
        })
        .style('stroke-width', (l) => {
          const link = l as D3Link;
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          if (sourceId === d.id || targetId === d.id) {
            if (impactMode && changedFiles && changedFiles.length > 0) {
              return linkStyles.impact.strokeWidth;
            }
            return linkStyles.hover.strokeWidth;
          }
          
          return linkStyles.default.strokeWidth;
        });
    };
  }, [perfSettings, impactMode, changedFiles]);

  // ホバーイベントハンドラー（リーブ）
  const handleNodeMouseLeave = useCallback((
    nodeGroup: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>,
    linkElements: d3.Selection<SVGLineElement, D3Link, SVGGElement, unknown>,
    dependencyMap: Record<string, string[]>
  ) => {
    if (!perfSettings.showHoverEffects) return;

    return function (this: SVGGElement) {
      // ノードを元に戻す
      d3.select(this)
        .select('circle')
        .transition()
        .duration(perfSettings.animationDuration)
        .attr('r', (d) => {
          const targetFile = files.find(f => f.id === (d as D3Node).id);
          // calculateNodeSize関数を使用する必要があるため、ここでは基本サイズを使用
          return 24; // 基本サイズ - 後でcalculateNodeSizeを使用
        })
        .attr('stroke-width', nodeStyles.circle.strokeWidth);

      d3.select(this)
        .select('path')
        .transition()
        .duration(perfSettings.animationDuration)
        .attr(
          'transform',
          `translate(${nodeStyles.icon.translateX}, ${nodeStyles.icon.translateY}) scale(${nodeStyles.icon.scale})`
        );

      // リンクを元に戻す
      linkElements
        .style('stroke', linkStyles.default.stroke)
        .style('stroke-width', linkStyles.default.strokeWidth);
    };
  }, [perfSettings, files]);

  return {
    createZoomBehavior,
    createZoomControls,
    createDragBehavior,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave
  };
};
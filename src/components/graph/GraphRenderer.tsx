// components/graph/GraphRenderer.tsx
// D3.js描画専用コンポーネント - ForceGraph.tsxから抽出

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GitHubFile } from '../../services/githubApi';

// カスタムフック
import { useCanvasSize } from '../../hooks/useCanvasSize';
import { useForceSimulation } from '../../hooks/useForceSimulation';
import { useGraphInteractions } from '../../hooks/useGraphInteractions';

// ユーティリティ関数
import { createDependencyMap } from '../../utils/graphHelpers';
import {
  renderLinks,
  createNodeGroup,
  renderNodeCircles,
  renderNodeIcons,
  renderNodeLabels,
  updateSelectedNodeHighlight,
  updateSelectedLinkHighlight
} from '../../utils/nodeRenderer';

// スタイル・設定
import { GRAPH_CONFIG } from '../../constants/graphConfig';
import { getPerformanceSettings } from '../../constants/graphStyles';

interface GraphRendererProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  impactMode?: boolean;
  onResetImpactMode?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const GraphRenderer: React.FC<GraphRendererProps> = ({
  files,
  selectedFile,
  onFileSelect,
  changedFiles,
  impactMode,
  onResetImpactMode,
  containerRef
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // カスタムフックによる責任分散
  const canvasSize = useCanvasSize({ files, containerRef });
  const { nodes, links, createSimulation, stopSimulation } = useForceSimulation({
    files,
    canvasSize,
    changedFiles,
    impactMode
  });
  const {
    createZoomBehavior,
    createDragBehavior,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave
  } = useGraphInteractions({
    files,
    onFileSelect,
    selectedFile,
    changedFiles,
    impactMode
  });

  useEffect(() => {
    if (!svgRef.current || files.length === 0) return;

    // パフォーマンス設定取得
    const perfSettings = getPerformanceSettings(files.length);

    // 前回の描画内容をクリア（SVGとコントロールボタン両方）
    d3.select(svgRef.current).selectAll('*').remove();
    
    // 親要素に追加されたコントロールボタンもクリア
    const parentElement = svgRef.current.parentElement;
    if (parentElement) {
      d3.select(parentElement).selectAll('div').remove();
    }
    
    const { width, height } = canvasSize;
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '8px')
      .style('background', 'white');

    // ズーム機能の設定
    const { g, zoom } = createZoomBehavior(svg);


    // Impact visualization用の依存関係マップ
    const dependencyMap = createDependencyMap(files);

    // シミュレーションの作成と開始
    const simulation = createSimulation();

    // リンクの描画
    const linkGroup = g.append('g').attr('class', 'links');
    const linkElements = renderLinks(
      linkGroup,
      links,
      files,
      impactMode,
      changedFiles,
      dependencyMap
    );

    // ノードの描画
    const nodeGroup = createNodeGroup(g, nodes);
    
    // ノード要素の描画（パフォーマンスモードを考慮）
    renderNodeCircles(nodeGroup, files, impactMode, changedFiles, dependencyMap);
    renderNodeIcons(nodeGroup);
    
    // パフォーマンスモードでのラベル表示制御
    if (perfSettings.showLabels) {
      renderNodeLabels(nodeGroup, files.length);
    }

    // インタラクションの設定
    const drag = createDragBehavior(simulation);
    nodeGroup.call(drag);

    // イベントハンドラーの設定
    nodeGroup.on('click', handleNodeClick);

    const mouseEnterHandler = handleNodeMouseEnter(nodeGroup, linkElements, dependencyMap);
    const mouseLeaveHandler = handleNodeMouseLeave(nodeGroup, linkElements, dependencyMap);
    
    if (mouseEnterHandler) nodeGroup.on('mouseenter', mouseEnterHandler);
    if (mouseLeaveHandler) nodeGroup.on('mouseleave', mouseLeaveHandler);

    // シミュレーションの更新処理（パフォーマンス最適化）
    let tickCounter = 0; // フレームスキップ用カウンター
    simulation.on('tick', () => {
      tickCounter++;
      
      // 極速モードではフレームスキップ（2フレームに1回更新）
      if (perfSettings.performanceLevel === 'extreme' && tickCounter % 2 !== 0) {
        return;
      }
      
      // リンクの位置更新
      linkElements
        .attr('x1', (d) => {
          const source = d.source as d3.SimulationNodeDatum;
          return typeof source === 'object' ? source.x! : 0;
        })
        .attr('y1', (d) => {
          const source = d.source as d3.SimulationNodeDatum;
          return typeof source === 'object' ? source.y! : 0;
        })
        .attr('x2', (d) => {
          const target = d.target as d3.SimulationNodeDatum;
          return typeof target === 'object' ? target.x! : 0;
        })
        .attr('y2', (d) => {
          const target = d.target as d3.SimulationNodeDatum;
          return typeof target === 'object' ? target.y! : 0;
        });

      // ノードの位置更新（境界制限付き）
      nodes.forEach((d) => {
        d.x = Math.max(
          GRAPH_CONFIG.node.boundaryPadding,
          Math.min(width - GRAPH_CONFIG.node.boundaryPadding, d.x!)
        );
        d.y = Math.max(
          GRAPH_CONFIG.node.boundaryPadding,
          Math.min(height - GRAPH_CONFIG.node.boundaryPadding, d.y!)
        );
      });

      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // 選択されたファイルの強調表示
    updateSelectedNodeHighlight(
      nodeGroup,
      selectedFile,
      files,
      impactMode,
      changedFiles,
      dependencyMap
    );

    // リンクの強調表示
    updateSelectedLinkHighlight(
      linkElements,
      files,
      impactMode,
      changedFiles,
      dependencyMap
    );

    // クリーンアップ
    return () => {
      stopSimulation();
    };
  }, [
    files,
    selectedFile,
    changedFiles,
    impactMode,
    canvasSize,
    nodes,
    links,
    createSimulation,
    stopSimulation,
    createZoomBehavior,
    createDragBehavior,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave
  ]);

  return <svg ref={svgRef}></svg>;
};

export default GraphRenderer;
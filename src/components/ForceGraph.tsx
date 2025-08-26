// src/components/ForceGraph.tsx
// 力学グラフ表示コンポーネント - D3.jsを使用したノード・リンクの可視化
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GitHubFile } from '../services/githubApi';

// カスタムフック
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useForceSimulation } from '../hooks/useForceSimulation';
import { useGraphInteractions } from '../hooks/useGraphInteractions';

// ユーティリティ関数
import { createDependencyMap } from '../utils/graphHelpers';
import {
  renderLinks,
  createNodeGroup,
  renderNodeCircles,
  renderNodeIcons,
  renderNodeLabels,
  updateSelectedNodeHighlight
} from '../utils/nodeRenderer';

// スタイル・設定
import { GRAPH_CONFIG } from '../constants/graphConfig';

interface ForceGraphProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[];
  impactMode?: boolean;
}

const ForceGraph: React.FC<ForceGraphProps> = ({
  files,
  selectedFile,
  onFileSelect,
  changedFiles,
  impactMode
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    createZoomControls,
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

    // 前回の描画内容をクリア
    d3.select(svgRef.current).selectAll('*').remove();
    
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

    // ズームコントロールの作成
    const parentElement = svgRef.current.parentElement;
    let controls: d3.Selection<HTMLDivElement, unknown, null, undefined> | null = null;
    
    if (parentElement) {
      controls = createZoomControls(parentElement, svg, zoom);
    }

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
    
    // ノード要素の描画
    renderNodeCircles(nodeGroup, files, impactMode, changedFiles, dependencyMap);
    renderNodeIcons(nodeGroup);
    renderNodeLabels(nodeGroup, files.length);

    // インタラクションの設定
    const drag = createDragBehavior(simulation);
    nodeGroup.call(drag);

    // イベントハンドラーの設定
    nodeGroup.on('click', handleNodeClick);

    const mouseEnterHandler = handleNodeMouseEnter(nodeGroup, linkElements, dependencyMap);
    const mouseLeaveHandler = handleNodeMouseLeave(nodeGroup, linkElements, dependencyMap);
    
    if (mouseEnterHandler) nodeGroup.on('mouseenter', mouseEnterHandler);
    if (mouseLeaveHandler) nodeGroup.on('mouseleave', mouseLeaveHandler);

    // シミュレーションの更新処理
    simulation.on('tick', () => {
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

    // クリーンアップ
    return () => {
      stopSimulation();
      if (controls) {
        controls.remove();
      }
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
    createZoomControls,
    createDragBehavior,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        margin: '0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー情報 */}
      <h3
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#374151',
          margin: '0 0 8px 0',
        }}
      >
        依存関係グラフ
      </h3>
      
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        線は依存関係を表します。ホバーで関連ファイルを強調表示
        {files.length > GRAPH_CONFIG.performance.labelThreshold && (
          <span style={{ color: '#f59e0b', marginLeft: '10px' }}>
            ⚡ パフォーマンスモード（{files.length}ファイル）
          </span>
        )}
      </p>

      {/* SVGコンテナ */}
      <div
        style={{
          width: '100%',
          height: 'fit-content',
          overflow: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: 'white',
        }}
      >
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default ForceGraph;
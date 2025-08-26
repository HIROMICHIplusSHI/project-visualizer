// src/components/ForceGraph.tsx
// 力学グラフ表示コンポーネント - D3.jsを使用したノード・リンクの可視化
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { type GitHubFile } from '../services/githubApi';
import {
  nodeStyles,
  linkStyles,
  getFileColor,
  getPerformanceSettings, // パフォーマンス設定取得用
  calculateImpactLevel, // Impact visualization用
} from '../constants/graphStyles';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { 
  calculateNodeSize,
  type D3Node,
  type D3Link
} from '../utils/graphHelpers';
import {
  renderLinks,
  createNodeGroup,
  renderNodeCircles,
  renderNodeIcons,
  renderNodeLabels
} from '../utils/nodeRenderer';
import { useGraphInteractions } from '../hooks/useGraphInteractions';
import { useForceSimulation } from '../hooks/useForceSimulation';


interface ForceGraphProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[]; // Impact visualization用：変更されたファイルのパス
  impactMode?: boolean; // Impact visualization表示モード
}

// 型定義はutils/graphHelpers.tsから取得

const ForceGraph: React.FC<ForceGraphProps> = ({ files, selectedFile, onFileSelect, changedFiles, impactMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // カスタムフックで動的サイズ管理  
  const { width, height } = useCanvasSize({ 
    files, 
    containerRef: containerRef as React.RefObject<HTMLElement> 
  });
  
  // インタラクション処理のカスタムフック
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

  // シミュレーション管理のカスタムフック
  const { nodes, links, createSimulation, stopSimulation } = useForceSimulation({
    files,
    canvasSize: { width, height },
    changedFiles,
    impactMode
  });

  useEffect(() => {
    if (!svgRef.current || files.length === 0) return;

    // 前回の描画内容をクリア
    d3.select(svgRef.current).selectAll('*').remove();

    // ファイル数に応じたパフォーマンス設定を取得
    const perfSettings = getPerformanceSettings(files.length);
    // ファイル数とパフォーマンス設定の確認
    // console.log(`ファイル数: ${files.length}, パフォーマンスモード:`, perfSettings);

    // 動的サイズはuseCanvasSizeフックで管理済み

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '8px')
      .style('background', 'white');

    // ズームとインタラクション設定
    const { g, zoom } = createZoomBehavior(svg);
    
    // ズームコントロール
    const parentNode = svgRef.current.parentNode;
    let controls: d3.Selection<HTMLDivElement, unknown, null, undefined> | null = null;
    if (parentNode) {
      controls = createZoomControls(parentNode as HTMLElement, svg, zoom);
    }

    // Impact visualization用の依存関係マップを作成
    const dependencyMap: Record<string, string[]> = {};
    files.forEach((file) => {
      if (file.dependencies && file.path) {
        dependencyMap[file.path] = file.dependencies;
      }
    });

    // シミュレーション作成
    const simulation = createSimulation();

    // TODO(human): Replace the rendering logic below with function calls from utils/nodeRenderer.ts
    // Use renderLinks(), createNodeGroup(), renderNodeCircles(), renderNodeIcons(), renderNodeLabels()
    
    // リンク（線）を描画
    const linkGroup = g.append('g').attr('class', 'links');

    // レンダリング関数呼び出し
    const linkElements = renderLinks(linkGroup, links, files, impactMode, changedFiles, dependencyMap);
    const nodeGroup = createNodeGroup(g, nodes);
    
    renderNodeCircles(nodeGroup, files, impactMode, changedFiles, dependencyMap);
    renderNodeIcons(nodeGroup);
    renderNodeLabels(nodeGroup, files.length);

    // TODO(human): Replace interaction logic below with useGraphInteractions hook
    // Import useGraphInteractions and use createZoomBehavior, createDragBehavior, handleNodeClick, etc.
    
    // ホバー効果の設定（パフォーマンス設定による制御）
    if (perfSettings.showHoverEffects) {
      nodeGroup
        .on('mouseenter', function (this: SVGGElement, _event, d) {
          // 背景の円を大きく
          d3.select(this)
            .select('circle')
            .transition()
            .duration(perfSettings.animationDuration) // アニメーション速度設定
            .attr('r', nodeStyles.circle.hoverRadius)
            .attr('stroke-width', nodeStyles.circle.hoverStrokeWidth);

          // アイコンも少し大きく
          d3.select(this)
            .select('path')
            .transition()
            .duration(perfSettings.animationDuration) // アニメーション速度設定
            .attr(
              'transform',
              `translate(${nodeStyles.icon.hoverTranslateX}, ${nodeStyles.icon.hoverTranslateY}) scale(${nodeStyles.icon.hoverScale})`
            );

          // 関連する線を強調
          linkElements
            .style('stroke', (l) => {
              const link = l as D3Link;
              const sourceId =
                typeof link.source === 'object' ? link.source.id : link.source;
              const targetId =
                typeof link.target === 'object' ? link.target.id : link.target;
              
              if (sourceId === d.id || targetId === d.id) {
                // Impact Visualizationモードの場合は、Impact色を優先
                if (impactMode && changedFiles && changedFiles.length > 0) {
                  const sourceFile = files.find(f => f.id === sourceId);
                  const targetFile = files.find(f => f.id === targetId);
                  
                  if (sourceFile?.path && targetFile?.path) {
                    const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
                    const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
                    
                    if (sourceLevel >= 0 || targetLevel >= 0) {
                      return linkStyles.impact.stroke; // Impact色を維持
                    }
                  }
                }
                return linkStyles.hover.stroke; // 通常のホバー色
              }
              
              // ホバー対象外のリンクの色を決定
              if (impactMode && changedFiles && changedFiles.length > 0) {
                const sourceFile = files.find(f => f.id === sourceId);
                const targetFile = files.find(f => f.id === targetId);
                
                if (sourceFile?.path && targetFile?.path) {
                  const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
                  const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
                  
                  if (sourceLevel >= 0 || targetLevel >= 0) {
                    return linkStyles.impact.stroke; // Impact色を維持
                  }
                }
              }
              
              return linkStyles.default.stroke;
            })
            .style('stroke-width', (l) => {
              const link = l as D3Link;
              const sourceId =
                typeof link.source === 'object' ? link.source.id : link.source;
              const targetId =
                typeof link.target === 'object' ? link.target.id : link.target;
              
              if (sourceId === d.id || targetId === d.id) {
                // Impact Visualizationモードの場合は、Impact線の太さを優先
                if (impactMode && changedFiles && changedFiles.length > 0) {
                  const sourceFile = files.find(f => f.id === sourceId);
                  const targetFile = files.find(f => f.id === targetId);
                  
                  if (sourceFile?.path && targetFile?.path) {
                    const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
                    const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
                    
                    if (sourceLevel >= 0 || targetLevel >= 0) {
                      return linkStyles.impact.strokeWidth; // Impact線の太さを維持
                    }
                  }
                }
                return linkStyles.hover.strokeWidth; // 通常のホバー太さ
              }
              
              // ホバー対象外のリンクの太さを決定
              if (impactMode && changedFiles && changedFiles.length > 0) {
                const sourceFile = files.find(f => f.id === sourceId);
                const targetFile = files.find(f => f.id === targetId);
                
                if (sourceFile?.path && targetFile?.path) {
                  const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
                  const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
                  
                  if (sourceLevel >= 0 || targetLevel >= 0) {
                    return linkStyles.impact.strokeWidth; // Impact線の太さを維持
                  }
                }
              }
              
              return linkStyles.default.strokeWidth;
            });
        })
        .on('mouseleave', function (this: SVGGElement) {
          // 元に戻す
          d3.select(this)
            .select('circle')
            .transition()
            .duration(perfSettings.animationDuration) // アニメーション速度設定
            .attr('r', (d) => {
              const targetFile = files.find(f => f.id === (d as D3Node).id);
              return targetFile ? calculateNodeSize(targetFile, files) : nodeStyles.circle.radius;
            })
            .attr('stroke-width', nodeStyles.circle.strokeWidth);

          d3.select(this)
            .select('path')
            .transition()
            .duration(perfSettings.animationDuration) // アニメーション速度設定
            .attr(
              'transform',
              `translate(${nodeStyles.icon.translateX}, ${nodeStyles.icon.translateY}) scale(${nodeStyles.icon.scale})`
            );

          // 線を元に戻す（Impact Visualizationを考慮）
          linkElements
            .style('stroke', (d) => {
              // Impact Visualizationモードの場合は適切な色を設定
              if (impactMode && changedFiles && changedFiles.length > 0) {
                const link = d as D3Link;
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                const sourceFile = files.find(f => f.id === sourceId);
                const targetFile = files.find(f => f.id === targetId);
                
                if (sourceFile?.path && targetFile?.path) {
                  const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
                  const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
                  
                  if (sourceLevel >= 0 || targetLevel >= 0) {
                    return linkStyles.impact.stroke; // Impact色を維持
                  }
                }
              }
              return linkStyles.default.stroke;
            })
            .style('stroke-width', (d) => {
              // Impact Visualizationモードの場合は適切な太さを設定
              if (impactMode && changedFiles && changedFiles.length > 0) {
                const link = d as D3Link;
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                const sourceFile = files.find(f => f.id === sourceId);
                const targetFile = files.find(f => f.id === targetId);
                
                if (sourceFile?.path && targetFile?.path) {
                  const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
                  const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
                  
                  if (sourceLevel >= 0 || targetLevel >= 0) {
                    return linkStyles.impact.strokeWidth; // Impact線の太さを維持
                  }
                }
              }
              return linkStyles.default.strokeWidth;
            });
        });
    } else {
      // ホバー効果無効時は基本的な情報表示のみ
      // nodeGroup.on('mouseenter', function (_event, d) {
      //   console.log('ファイル:', d.name);
      // });
    }

    // インタラクション設定
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
          const link = d as D3Link;
          return typeof link.source === 'object' ? link.source.x! : 0;
        })
        .attr('y1', (d) => {
          const link = d as D3Link;
          return typeof link.source === 'object' ? link.source.y! : 0;
        })
        .attr('x2', (d) => {
          const link = d as D3Link;
          return typeof link.target === 'object' ? link.target.x! : 0;
        })
        .attr('y2', (d) => {
          const link = d as D3Link;
          return typeof link.target === 'object' ? link.target.y! : 0;
        });

      // ノードの位置更新（境界制限付き）
      nodes.forEach((d) => {
        d.x = Math.max(30, Math.min(width - 30, d.x!));
        d.y = Math.max(30, Math.min(height - 30, d.y!));
      });

      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // 選択されたファイルの強調表示を更新する関数
    const updateSelectedNode = () => {
      nodeGroup.selectAll<SVGCircleElement, D3Node>('circle')
        .attr('stroke-width', (d) => {
          if (selectedFile && selectedFile.id === d.id) {
            return 4; // 選択されたファイルの境界線を太く
          }
          return nodeStyles.circle.strokeWidth;
        })
        .attr('stroke', (d) => {
          // Impact visualizationが有効な場合は、それを優先
          if (impactMode && changedFiles && changedFiles.length > 0) {
            const targetFile = files.find(f => f.id === (d as D3Node).id);
            if (targetFile?.path) {
              const impactLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
              if (impactLevel >= 0) {
                return getFileColor(d.name, d.type === 'dir', impactLevel);
              }
            }
          }
          
          // Impact visualizationが無効またはimpactLevelが-1の場合、選択強調を適用
          if (selectedFile && selectedFile.id === d.id) {
            return '#f97316'; // オレンジ色で強調
          }
          
          return getFileColor(d.name, d.type === 'dir');
        });
    };

    // 初回と selectedFile 変更時に強調表示を更新
    updateSelectedNode();

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
    onFileSelect, 
    width, 
    height,
    createZoomBehavior,
    createZoomControls,
    createSimulation,
    createDragBehavior,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    stopSimulation,
    nodes,
    links
  ]);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        margin: '0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        height: '100%',
        overflow: 'auto', // スクロール可能
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* SVG コンテナ - 動的サイズ対応 */}
      <div
        style={{
          width: '100%',
          height: 'fit-content',
          overflow: 'auto', // 大きなキャンバス用のスクロール
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: 'white',
        }}
      >
      <h3
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#374151',
        }}
      >
        依存関係グラフ
      </h3>
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
        線は依存関係を表します。ホバーで関連ファイルを強調表示
        {files.length > 50 && (
          <span style={{ color: '#f59e0b', marginLeft: '10px' }}>
            ⚡ パフォーマンスモード（{files.length}ファイル）
          </span>
        )}
      </p>


        <svg ref={svgRef}></svg>
      </div>
      
      {/* ヘッダー情報 */}
      <h3
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#374151',
          margin: '16px 0 8px 0',
        }}
      >
        依存関係グラフ
      </h3>
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
        線は依存関係を表します。ホバーで関連ファイルを強調表示
        {files.length > 50 && (
          <span style={{ color: '#f59e0b', marginLeft: '10px' }}>
            ⚡ パフォーマンスモード（{files.length}ファイル）
          </span>
        )}
      </p>
    </div>
  );
};

export default ForceGraph;

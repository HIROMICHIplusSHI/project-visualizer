// src/components/ForceGraph.tsx
// 力学グラフ表示コンポーネント - D3.jsを使用したノード・リンクの可視化
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { type GitHubFile } from '../services/githubApi';
import {
  iconPaths,
  nodeStyles,
  linkStyles,
  getFileType,
  getFileColor,
  getNodeBgColor,
  getPerformanceSettings, // パフォーマンス設定取得用
  calculateImpactLevel, // Impact visualization用
} from '../constants/graphStyles';

interface ForceGraphProps {
  files: GitHubFile[];
  selectedFile?: GitHubFile | null;
  onFileSelect?: (file: GitHubFile | null) => void;
  changedFiles?: string[]; // Impact visualization用：変更されたファイルのパス
  impactMode?: boolean; // Impact visualization表示モード
}

interface D3Node extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  type?: 'file' | 'dir';
  size?: number;
}

interface D3Link {
  source: number | D3Node;
  target: number | D3Node;
}

const ForceGraph: React.FC<ForceGraphProps> = ({ files, selectedFile, onFileSelect, changedFiles, impactMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || files.length === 0) return;

    // 前回の描画内容をクリア
    d3.select(svgRef.current).selectAll('*').remove();

    // ファイル数に応じたパフォーマンス設定を取得
    const perfSettings = getPerformanceSettings(files.length);
    // ファイル数とパフォーマンス設定の確認
    // console.log(`ファイル数: ${files.length}, パフォーマンスモード:`, perfSettings);

    // 親要素の幅に合わせる
    const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
    const width = Math.min(containerWidth - 40);
    const height = 600;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '8px')
      .style('background', 'white');

    // ズーム用のグループ
    const g = svg.append('g');

    // ズーム機能
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // ズームコントロールボタン
    const parentNode = svgRef.current.parentNode;
    if (!parentNode) return;

    const controls = d3
      .select(parentNode as HTMLElement)
      .append('div')
      .style('position', 'absolute')
      .style('top', '10px')
      .style('left', '10px')
      .style('display', 'flex')
      .style('gap', '5px')
      .style('z-index', '10');

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

    // ノードとリンクのデータ準備
    const nodes: D3Node[] = files.map((file) => ({
      ...file,
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
    }));

    // 依存関係からリンクを作成
    const links: D3Link[] = [];
    files.forEach((file) => {
      if (file.dependencies) {
        file.dependencies.forEach((depPath) => {
          // pathで比較するように修正
          const targetFile = files.find(
            (f) =>
              f.path === depPath || // パスが完全一致
              f.path?.endsWith(depPath) || // 部分一致
              depPath.endsWith('/' + f.name) // ファイル名で一致
          );
          if (targetFile) {
            links.push({
              source: file.id,
              target: targetFile.id,
            });
          }
        });
      }
    });

    // Impact Visualization用の追加リンクを作成
    if (impactMode && changedFiles && changedFiles.length > 0) {
      for (const changedFile of changedFiles) {
        files.forEach((file) => {
          
          // 柔軟な依存関係マッチング（拡張子の違いを許容）
          const hasMatchingDependency = file.dependencies?.some(dep => {
            // 完全一致をチェック
            if (dep === changedFile) return true;
            
            // ベース名で比較（拡張子なし）
            const depBaseName = dep.replace(/\.[^.]*$/, '').replace(/"/g, '');
            const cfBaseName = changedFile.replace(/\.[^.]*$/, '');
            return depBaseName === cfBaseName;
          });
          
          if (file.path && hasMatchingDependency) {
            // 柔軟なファイル検索（拡張子の違いを許容）
            const findFileByPath = (targetPath: string) => {
              // まず完全一致を試す
              let found = files.find(f => f.path === targetPath);
              if (found) return found;
              
              // 拡張子なしでベース名を取得
              const baseName = targetPath.replace(/\.[^.]*$/, '');
              
              // ベース名が一致するファイルを探す
              found = files.find(f => {
                const fileBaseName = f.path.replace(/\.[^.]*$/, '');
                return fileBaseName === baseName;
              });
              
              return found;
            };
            
            const sourceFile = findFileByPath(changedFile);
            if (sourceFile) {
              // 既存のリンクと重複しないようチェック
              const exists = links.some(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return (sourceId === file.id && targetId === sourceFile.id) ||
                       (sourceId === sourceFile.id && targetId === file.id);
              });
              
              if (!exists) {
                links.push({
                  source: file.id,
                  target: sourceFile.id,
                });
              }
            }
          }
        });
      }
    }

    // Impact visualization用の依存関係マップを作成
    const dependencyMap: Record<string, string[]> = {};
    files.forEach((file) => {
      if (file.dependencies && file.path) {
        dependencyMap[file.path] = file.dependencies;
      }
    });


    // 力学シミュレーションの設定とノード間の力の定義
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => (d as D3Node).id)
          .distance(perfSettings.showHoverEffects ? 100 : 80) // パフォーマンス設定に応じた距離調整
      )
      .force(
        'charge',
        d3.forceManyBody().strength(perfSettings.showHoverEffects ? -100 : -50)
      )
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force(
        'collision',
        d3.forceCollide().radius(perfSettings.showHoverEffects ? 35 : 30)
      )
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03))
      .alphaDecay(perfSettings.alphaDecay) // シミュレーション収束速度の設定
      .velocityDecay(perfSettings.velocityDecay); // ノードの速度減衰設定

    // リンク（線）を描画
    const linkGroup = g.append('g').attr('class', 'links');

    const linkElements = linkGroup
      .selectAll<SVGLineElement, D3Link>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        // Impact visualizationモードでのリンク色分け
        if (impactMode && changedFiles && changedFiles.length > 0) {
          const sourceFile = files.find(f => f.id === (typeof d.source === 'object' ? d.source.id : d.source));
          const targetFile = files.find(f => f.id === (typeof d.target === 'object' ? d.target.id : d.target));
          
          if (sourceFile?.path && targetFile?.path) {
            const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
            const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
            
            // いずれかが影響を受けている場合は強調表示
            if (sourceLevel >= 0 || targetLevel >= 0) {
              return linkStyles.impact.stroke;
            }
          }
        }
        return linkStyles.default.stroke;
      })
      .attr('stroke-opacity', (d) => {
        if (impactMode && changedFiles && changedFiles.length > 0) {
          const sourceFile = files.find(f => f.id === (typeof d.source === 'object' ? d.source.id : d.source));
          const targetFile = files.find(f => f.id === (typeof d.target === 'object' ? d.target.id : d.target));
          
          if (sourceFile?.path && targetFile?.path) {
            const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
            const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
            
            if (sourceLevel >= 0 || targetLevel >= 0) {
              return linkStyles.impact.strokeOpacity;
            }
          }
        }
        return linkStyles.default.strokeOpacity;
      })
      .attr('stroke-width', (d) => {
        if (impactMode && changedFiles && changedFiles.length > 0) {
          const sourceFile = files.find(f => f.id === (typeof d.source === 'object' ? d.source.id : d.source));
          const targetFile = files.find(f => f.id === (typeof d.target === 'object' ? d.target.id : d.target));
          
          if (sourceFile?.path && targetFile?.path) {
            const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
            const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
            
            if (sourceLevel >= 0 || targetLevel >= 0) {
              return linkStyles.impact.strokeWidth;
            }
          }
        }
        return linkStyles.default.strokeWidth;
      });

    // ノードグループ
    const nodeGroup = g
      .selectAll<SVGGElement, D3Node>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // ノードの背景円を描画
    nodeGroup
      .append('circle')
      .attr('r', nodeStyles.circle.radius)
      .attr('fill', (d) => {
        // Impact visualizationモードの実装
        if (impactMode && changedFiles && changedFiles.length > 0) {
          const targetFile = files.find(f => f.id === d.id);
          if (targetFile?.path) {
            const impactLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
            if (impactLevel >= 0) {
              return getNodeBgColor(d.name, d.type === 'dir', impactLevel);
            }
          }
        }
        return getNodeBgColor(d.name, d.type === 'dir'); // 通常の色分け
      })
      .attr('stroke', (d) => {
        // Impact visualizationモードの境界色
        if (impactMode && changedFiles && changedFiles.length > 0) {
          const targetFile = files.find(f => f.id === d.id);
          if (targetFile?.path) {
            const impactLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
            if (impactLevel >= 0) {
              return getFileColor(d.name, d.type === 'dir', impactLevel);
            }
          }
        }
        return getFileColor(d.name, d.type === 'dir'); // 通常の境界色
      })
      .attr('stroke-width', nodeStyles.circle.strokeWidth)
      .style('filter', nodeStyles.circle.shadow);

    // ファイルタイプ別のアイコンを描画
    nodeGroup
      .append('path')
      .attr('d', (d) => {
        const fileType = d.type === 'dir' ? 'folder' : getFileType(d.name);
        return iconPaths[fileType];
      })
      .attr('fill', (d) => getFileColor(d.name, d.type === 'dir'))
      .attr(
        'transform',
        `translate(${nodeStyles.icon.translateX}, ${nodeStyles.icon.translateY}) scale(${nodeStyles.icon.scale})`
      )
      .style('pointer-events', 'none');

    // ファイル名ラベル表示（パフォーマンス設定に応じて切り替え）
    if (perfSettings.showLabels) {
      nodeGroup
        .append('text')
        .text((d) =>
          d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name
        )
        .attr('font-size', nodeStyles.text.fontSize)
        .attr('text-anchor', 'middle')
        .attr('dy', nodeStyles.text.dy)
        .attr('fill', nodeStyles.text.color)
        .style('user-select', 'none')
        .style('font-weight', nodeStyles.text.fontWeight);
    } else {
      // ファイル数が多い場合はツールチップのみ表示
      nodeGroup.append('title').text((d) => d.name);
    }

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
            .attr('r', nodeStyles.circle.radius)
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

    // クリックイベント
    nodeGroup.on('click', (_event, d) => {
      
      // ファイル選択ハンドラーを呼び出して連動させる
      if (onFileSelect) {
        const selectedGitHubFile = files.find((f) => f.id === d.id);
        onFileSelect(selectedGitHubFile || null);
      }
    });

    // ドラッグ機能
    const drag = d3
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

    nodeGroup.call(drag);

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
            const targetFile = files.find(f => f.id === d.id);
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
      simulation.stop();
      controls.remove();
    };
  }, [files, selectedFile]);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        margin: '0', // ← '20px' から '0' に変更
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        height: '100%', // ← 追加：高さも親要素いっぱいに
        overflow: 'auto',
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
      {/* 凡例 後で修正するかも？廃止予定
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '12px',
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>凡例</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              background: '#FFB800',
              borderRadius: '2px',
            }}
          ></span>
          <span>フォルダ</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              background: '#61DAFB',
              borderRadius: '50%',
            }}
          ></span>
          <span>React (.tsx)</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              background: '#3178C6',
              borderRadius: '50%',
            }}
          ></span>
          <span>TypeScript (.ts)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              background: '#666',
              borderRadius: '50%',
            }}
          ></span>
          <span>その他</span>
        </div>
      </div> */}

      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ForceGraph;

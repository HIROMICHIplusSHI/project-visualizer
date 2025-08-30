// hooks/useForceSimulation.ts
// D3.js力学シミュレーション管理を担当するカスタムフック
import { useMemo, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { GitHubFile } from '../services/githubApi';
import { getPerformanceSettings } from '../constants/graphStyles';
import { calculateNodeSize, findFileByPath, createCustomLayoutForce } from '../utils/graphHelpers';
import type { D3Node, D3Link } from '../types/common';
import type { UseForceSimulationProps } from '../types/hooks';

// TODO(human): UseForceSimulationProps 型定義を hooks.ts に移行完了

export const useForceSimulation = ({ 
  files, 
  canvasSize, 
  changedFiles, 
  impactMode 
}: UseForceSimulationProps) => {
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);

  // ノードデータを生成
  const nodes = useMemo((): D3Node[] => {
    return files.map((file) => ({
      ...file,
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
    }));
  }, [files]);

  // リンクデータを生成
  const links = useMemo((): D3Link[] => {
    const linkArray: D3Link[] = [];
    
    // 基本の依存関係リンク
    files.forEach((file) => {
      if (file.dependencies) {
        file.dependencies.forEach((depPath) => {
          const targetFile = findFileByPath(depPath, files);
          if (targetFile) {
            linkArray.push({
              source: file.id,
              target: targetFile.id,
            });
          }
        });
      }
    });

    // Impact Visualization用の追加リンク
    if (impactMode && changedFiles && changedFiles.length > 0) {
      for (const changedFile of changedFiles) {
        files.forEach((file) => {
          const hasMatchingDependency = file.dependencies?.some(dep => {
            // 完全一致をチェック
            if (dep === changedFile) return true;
            
            // ベース名で比較（拡張子なし）
            const depBaseName = dep.replace(/\.[^.]*$/, '').replace(/"/g, '');
            const cfBaseName = changedFile.replace(/\.[^.]*$/, '');
            return depBaseName === cfBaseName;
          });
          
          if (file.path && hasMatchingDependency) {
            const sourceFile = findFileByPath(changedFile, files);
            if (sourceFile) {
              // 既存のリンクと重複しないようチェック
              const exists = linkArray.some(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return (sourceId === file.id && targetId === sourceFile.id) ||
                       (sourceId === sourceFile.id && targetId === file.id);
              });
              
              if (!exists) {
                linkArray.push({
                  source: file.id,
                  target: sourceFile.id,
                });
              }
            }
          }
        });
      }
    }

    return linkArray;
  }, [files, changedFiles, impactMode]);

  // シミュレーション作成
  const createSimulation = useCallback(() => {
    const perfSettings = getPerformanceSettings(files.length);
    const { width, height } = canvasSize;

    // ハブファイルを特定
    const hubFiles = nodes.filter(node => {
      const targetFile = files.find(f => f.id === node.id);
      if (!targetFile) return false;
      const nodeSize = calculateNodeSize(targetFile, files);
      return nodeSize > 24;
    });

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => (d as D3Node).id)
          .distance((d: D3Link) => {
            const source = d.source as D3Node;
            const target = d.target as D3Node;
            const sourceFile = files.find(f => f.id === source.id);
            const targetFile = files.find(f => f.id === target.id);
            
            if (sourceFile && targetFile) {
              const sourceSize = calculateNodeSize(sourceFile, files);
              const targetSize = calculateNodeSize(targetFile, files);
              return Math.max(120, (sourceSize + targetSize) * 3 + 60);
            }
            return 120;
          })
      )
      .force(
        'charge',
        d3.forceManyBody().strength((d) => {
          const targetFile = files.find(f => f.id === (d as D3Node).id);
          const nodeSize = targetFile ? calculateNodeSize(targetFile, files) : 24;
          const baseStrength = perfSettings.showHoverEffects ? -100 : -50;
          return baseStrength * (nodeSize > 24 ? 2 : 1);
        })
      )
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.02))
      .force(
        'collision',
        d3.forceCollide().radius((d) => {
          const targetFile = files.find(f => f.id === (d as D3Node).id);
          const nodeSize = targetFile ? calculateNodeSize(targetFile, files) : 24;
          return nodeSize + (perfSettings.showHoverEffects ? 25 : 20);
        })
      )
      .force('customLayout', createCustomLayoutForce(nodes, files, hubFiles, width, height))
      .alphaDecay(perfSettings.alphaDecay)
      .velocityDecay(perfSettings.velocityDecay);

    simulationRef.current = simulation;
    return simulation;
  }, [nodes, links, files, canvasSize]);

  // シミュレーション停止
  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
  }, []);

  return {
    nodes,
    links,
    createSimulation,
    stopSimulation
  };
};
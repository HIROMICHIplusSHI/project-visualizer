// hooks/useNodeEvents.ts
// D3.jsノードイベント（クリック・ホバー）専用フック - useGraphInteractions.tsから抽出

import { useCallback } from 'react';
import * as d3 from 'd3';
import type { GitHubFile } from '../services/githubApi';
import type { D3Node, D3Link } from '../types/common';
import type { UseNodeEventsProps, UseNodeEventsReturn } from '../types/hooks';
import { getPerformanceSettings, calculateImpactLevel } from '../constants/graphStyles';
import { nodeStyles, linkStyles } from '../constants/graphStyles';

// TODO(human): UseNodeEventsProps と UseNodeEventsReturn 型定義を hooks.ts に移行完了

export const useNodeEvents = ({
  files,
  onFileSelect,
  selectedFile: _selectedFile, // eslint-disable-line @typescript-eslint/no-unused-vars
  changedFiles,
  impactMode
}: UseNodeEventsProps): UseNodeEventsReturn => {
  const perfSettings = getPerformanceSettings(files.length);

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
    dependencyMap: Record<string, string[]> // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    if (!perfSettings.showHoverEffects) return;

    return function (this: SVGGElement, _event: MouseEvent, d: D3Node) {
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

      // 関連リンクの強調（パフォーマンスモードでは最小限の処理のみ）
      if (perfSettings.showHoverEffects) {
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
      }
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
        .attr('r', nodeStyles.circle.radius)
        .attr('stroke-width', nodeStyles.circle.strokeWidth);

      d3.select(this)
        .select('path')
        .transition()
        .duration(perfSettings.animationDuration)
        .attr(
          'transform',
          `translate(${nodeStyles.icon.translateX}, ${nodeStyles.icon.translateY}) scale(${nodeStyles.icon.scale})`
        );

      // リンクを元に戻す（Impact Visualizationモードを考慮）
      // パフォーマンスモードの場合は重い計算をスキップしてデフォルト値に戻す
      if (!perfSettings.showHoverEffects) {
        linkElements
          .style('stroke', linkStyles.default.stroke)
          .style('stroke-width', linkStyles.default.strokeWidth);
        return;
      }

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
    };
  }, [perfSettings, files, impactMode, changedFiles]);

  return {
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
  };
};
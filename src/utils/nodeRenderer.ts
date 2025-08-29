// utils/nodeRenderer.ts
// ノードとリンクの描画ロジック
import * as d3 from 'd3';
import type { GitHubFile } from '../services/githubApi';
import type { D3Node, D3Link } from '../hooks/useForceSimulation';
import {
  iconPaths,
  nodeStyles,
  linkStyles,
  getFileType,
  getFileColor,
  getNodeBgColor,
  calculateImpactLevel,
  getPerformanceSettings
} from '../constants/graphStyles';
import { calculateNodeSize } from './graphHelpers';

/**
 * リンク（線）の描画
 */
export const renderLinks = (
  linkGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: D3Link[],
  files: GitHubFile[],
  impactMode?: boolean,
  changedFiles?: string[],
  dependencyMap?: Record<string, string[]>
) => {
  return linkGroup
    .selectAll<SVGLineElement, D3Link>('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', (d) => {
      if (impactMode && changedFiles && changedFiles.length > 0 && dependencyMap) {
        const sourceFile = files.find(f => f.id === (typeof d.source === 'object' ? d.source.id : d.source));
        const targetFile = files.find(f => f.id === (typeof d.target === 'object' ? d.target.id : d.target));
        
        if (sourceFile?.path && targetFile?.path) {
          const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
          const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
          
          if (sourceLevel >= 0 || targetLevel >= 0) {
            return linkStyles.impact.stroke;
          }
        }
      }
      return linkStyles.default.stroke;
    })
    .attr('stroke-opacity', (d) => {
      if (impactMode && changedFiles && changedFiles.length > 0 && dependencyMap) {
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
      if (impactMode && changedFiles && changedFiles.length > 0 && dependencyMap) {
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
};

/**
 * ノードグループの作成
 */
export const createNodeGroup = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: D3Node[]
) => {
  return g
    .selectAll<SVGGElement, D3Node>('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .style('cursor', 'pointer');
};

/**
 * ノードの背景円を描画
 */
export const renderNodeCircles = (
  nodeGroup: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>,
  files: GitHubFile[],
  impactMode?: boolean,
  changedFiles?: string[],
  dependencyMap?: Record<string, string[]>
) => {
  nodeGroup
    .append('circle')
    .attr('r', (d) => {
      const targetFile = files.find(f => f.id === d.id);
      return targetFile ? calculateNodeSize(targetFile, files) : nodeStyles.circle.radius;
    })
    .attr('fill', (d) => {
      if (impactMode && changedFiles && changedFiles.length > 0 && dependencyMap) {
        const targetFile = files.find(f => f.id === (d as D3Node).id);
        if (targetFile?.path) {
          const impactLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
          if (impactLevel >= 0) {
            return getNodeBgColor(d.name, d.type === 'dir', impactLevel);
          }
        }
      }
      return getNodeBgColor(d.name, d.type === 'dir');
    })
    .attr('stroke', (d) => {
      if (impactMode && changedFiles && changedFiles.length > 0 && dependencyMap) {
        const targetFile = files.find(f => f.id === (d as D3Node).id);
        if (targetFile?.path) {
          const impactLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
          if (impactLevel >= 0) {
            return getFileColor(d.name, d.type === 'dir', impactLevel);
          }
        }
      }
      return getFileColor(d.name, d.type === 'dir');
    })
    .attr('stroke-width', nodeStyles.circle.strokeWidth)
    .style('filter', nodeStyles.circle.shadow);
};

/**
 * ファイルアイコンを描画
 */
export const renderNodeIcons = (
  nodeGroup: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>
) => {
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
};

/**
 * ファイル名ラベルを描画
 */
export const renderNodeLabels = (
  nodeGroup: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>,
  fileCount: number
) => {
  const perfSettings = getPerformanceSettings(fileCount);
  
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
};

/**
 * リンクのハイライト更新
 */
export const updateSelectedLinkHighlight = (
  linkElements: d3.Selection<SVGLineElement, D3Link, SVGGElement, unknown>,
  files: GitHubFile[],
  impactMode?: boolean,
  changedFiles?: string[],
  dependencyMap?: Record<string, string[]>
) => {
  linkElements
    .style('stroke', (d) => {
      if (impactMode && changedFiles && changedFiles.length > 0 && dependencyMap) {
        const sourceFile = files.find(f => f.id === (typeof d.source === 'object' ? d.source.id : d.source));
        const targetFile = files.find(f => f.id === (typeof d.target === 'object' ? d.target.id : d.target));
        
        if (sourceFile?.path && targetFile?.path) {
          const sourceLevel = calculateImpactLevel(changedFiles, sourceFile.path, dependencyMap);
          const targetLevel = calculateImpactLevel(changedFiles, targetFile.path, dependencyMap);
          
          if (sourceLevel >= 0 || targetLevel >= 0) {
            return linkStyles.impact.stroke;
          }
        }
      }
      return linkStyles.default.stroke;
    })
    .style('stroke-width', (d) => {
      if (impactMode && changedFiles && changedFiles.length > 0 && dependencyMap) {
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
};

/**
 * 選択されたノードのハイライト更新
 */
export const updateSelectedNodeHighlight = (
  nodeGroup: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>,
  selectedFile?: GitHubFile | null,
  files?: GitHubFile[],
  impactMode?: boolean,
  changedFiles?: string[],
  dependencyMap?: Record<string, string[]>
) => {
  nodeGroup.selectAll<SVGCircleElement, D3Node>('circle')
    .attr('stroke-width', (d) => {
      if (selectedFile && selectedFile.id === d.id) {
        return 4; // 選択されたファイルの境界線を太く
      }
      return nodeStyles.circle.strokeWidth;
    })
    .attr('stroke', (d) => {
      // Impact visualizationが有効な場合は、それを優先
      if (impactMode && changedFiles && changedFiles.length > 0 && dependencyMap && files) {
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

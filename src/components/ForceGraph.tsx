// src/components/ForceGraph.tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { type FileData } from './FileList';

interface ForceGraphProps {
  files: FileData[];
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

const ForceGraph: React.FC<ForceGraphProps> = ({ files }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || files.length === 0) return;

    // SVGをクリア
    d3.select(svgRef.current).selectAll('*').remove();

    // 親要素の幅に合わせる
    const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
    const width = Math.min(containerWidth - 40, 800);
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
        file.dependencies.forEach((depName) => {
          const targetFile = files.find((f) => f.name === depName);
          if (targetFile) {
            links.push({
              source: file.id,
              target: targetFile.id,
            });
          }
        });
      }
    });

    // 力学シミュレーション
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => (d as D3Node).id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
      .force('collision', d3.forceCollide().radius(35))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // リンク（線）を描画
    const linkGroup = g.append('g').attr('class', 'links');

    const linkElements = linkGroup
      .selectAll<SVGLineElement, D3Link>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // ノードグループ
    const nodeGroup = g
      .selectAll<SVGGElement, D3Node>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // ディレクトリは四角形、ファイルは円として描画
    nodeGroup
      .append(function (d) {
        if (d.type === 'dir') {
          // ディレクトリは四角形
          return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        } else {
          // ファイルは円
          return document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
          );
        }
      })
      .attr('fill', (d) => {
        if (d.type === 'dir') return '#FFB800';
        if (d.name.endsWith('.tsx')) return '#61DAFB';
        if (d.name.endsWith('.ts')) return '#3178C6';
        if (d.name.endsWith('.css')) return '#1572B6';
        if (d.name.endsWith('.json')) return '#5A9E4F';
        return '#666';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      // 四角形の属性
      .attr('width', (d) => (d.type === 'dir' ? 40 : null))
      .attr('height', (d) => (d.type === 'dir' ? 40 : null))
      .attr('x', (d) => (d.type === 'dir' ? -20 : null))
      .attr('y', (d) => (d.type === 'dir' ? -20 : null))
      .attr('rx', (d) => (d.type === 'dir' ? 4 : null))
      .attr('ry', (d) => (d.type === 'dir' ? 4 : null))
      // 円の属性
      .attr('r', (d) => {
        if (d.type === 'dir') return null;
        return d.size && d.size > 10000 ? 20 : 15;
      });

    // ファイル名を追加
    nodeGroup
      .append('text')
      .text((d) =>
        d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name
      )
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .attr('dy', '35')
      .style('user-select', 'none');

    // ホバー効果
    nodeGroup
      .on('mouseenter', function (this: SVGGElement, _event, d) {
        // 四角形または円を大きく
        const shape = d3.select(this).select('rect, circle');

        if (d.type === 'dir') {
          // 四角形の場合
          shape
            .transition()
            .duration(200)
            .attr('width', 48)
            .attr('height', 48)
            .attr('x', -24)
            .attr('y', -24);
        } else {
          // 円の場合
          shape
            .transition()
            .duration(200)
            .attr('r', (d.size && d.size > 10000 ? 20 : 15) * 1.2);
        }

        // 関連する線を強調
        linkElements
          .style('stroke', (l) => {
            const link = l as D3Link;
            const sourceId =
              typeof link.source === 'object' ? link.source.id : link.source;
            const targetId =
              typeof link.target === 'object' ? link.target.id : link.target;
            if (sourceId === d.id || targetId === d.id) {
              return '#ff6b6b';
            }
            return '#999';
          })
          .style('stroke-width', (l) => {
            const link = l as D3Link;
            const sourceId =
              typeof link.source === 'object' ? link.source.id : link.source;
            const targetId =
              typeof link.target === 'object' ? link.target.id : link.target;
            if (sourceId === d.id || targetId === d.id) {
              return 4;
            }
            return 2;
          });
      })
      .on('mouseleave', function (this: SVGGElement) {
        // 元に戻す
        const shape = d3.select(this).select('rect, circle');
        const d = d3.select(this).datum() as D3Node;

        if (d.type === 'dir') {
          shape
            .transition()
            .duration(200)
            .attr('width', 40)
            .attr('height', 40)
            .attr('x', -20)
            .attr('y', -20);
        } else {
          shape
            .transition()
            .duration(200)
            .attr('r', d.size && d.size > 10000 ? 20 : 15);
        }

        // 線を元に戻す
        linkElements.style('stroke', '#999').style('stroke-width', 2);
      });

    // クリックイベント
    nodeGroup.on('click', (_event, d) => {
      console.log('クリックされたファイル:', d.name);
      console.log('依存関係:', files.find((f) => f.id === d.id)?.dependencies);
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

    // クリーンアップ
    return () => {
      simulation.stop();
      controls.remove();
    };
  }, [files]);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        margin: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
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
      </p>

      {/* 凡例 */}
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
      </div>

      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ForceGraph;

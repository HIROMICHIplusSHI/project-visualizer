// src/components/ForceGraph.tsx（依存関係の線を追加）
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

    const width = 800;
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
      .style('right', '10px')
      .style('display', 'flex')
      .style('gap', '5px');

    controls
      .append('button')
      .text('🔍+')
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
      .text('🔍-')
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
      .text('🔄')
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

    // 力学シミュレーション（リンクも追加）
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => (d as D3Node).id)
          .distance(100)
      ) // リンクの長さ
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

    // 円を追加
    nodeGroup
      .append('circle')
      .attr('r', (d) => {
        if (d.type === 'dir') return 25;
        if (d.size && d.size > 10000) return 20;
        return 15;
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
      .attr('stroke-width', 2);

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

    // ホバー効果（線も強調）
    nodeGroup
      .on('mouseenter', function (this: SVGGElement, _event, d) {
        // 円を大きく
        const selection = d3.select(this).select<SVGCircleElement>('circle');
        selection
          .transition()
          .duration(200)
          .attr('r', function (this: SVGCircleElement) {
            const data = d3.select(this).datum() as D3Node;
            const baseR = data.type === 'dir' ? 25 : 15;
            return baseR * 1.2;
          });

        // 関連する線を強調
        linkElements
          .style('stroke', (l) => {
            // anyを削除
            const link = l as D3Link; // 型アサーション
            const sourceId =
              typeof link.source === 'object' ? link.source.id : link.source;
            const targetId =
              typeof link.target === 'object' ? link.target.id : link.target;

            if (sourceId === d.id || targetId === d.id) {
              return '#ff6b6b'; // 赤く強調
            }
            return '#999';
          })
          .style('stroke-width', (l) => {
            // anyを削除
            const link = l as D3Link; // 型アサーション
            const sourceId =
              typeof link.source === 'object' ? link.source.id : link.source;
            const targetId =
              typeof link.target === 'object' ? link.target.id : link.target;

            if (sourceId === d.id || targetId === d.id) {
              return 4; // 太く
            }
            return 2;
          });
      })
      .on('mouseleave', function (this: SVGGElement) {
        // 円を元に戻す
        const selection = d3.select(this).select<SVGCircleElement>('circle');
        selection
          .transition()
          .duration(200)
          .attr('r', function (this: SVGCircleElement) {
            const d = d3.select(this).datum() as D3Node;
            if (d.type === 'dir') return 25;
            if (d.size && d.size > 10000) return 20;
            return 15;
          });

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
    // シミュレーションの更新処理
    simulation.on('tick', () => {
      // リンクの位置更新（型を明確に）
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
      <h3>🎨 依存関係グラフ</h3>
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
        線は依存関係を表します。ホバーで関連ファイルを強調表示
      </p>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ForceGraph;

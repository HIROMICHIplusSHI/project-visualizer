// src/components/ForceGraph.tsx（型エラー修正版）
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { type FileData } from './FileList';

interface ForceGraphProps {
  files: FileData[];
}

// D3.js用のノード型
interface D3Node extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  type?: 'file' | 'dir';
  size?: number;
}

const ForceGraph: React.FC<ForceGraphProps> = ({ files }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || files.length === 0) return;

    // SVGをクリア
    d3.select(svgRef.current).selectAll('*').remove();

    // SVGのサイズ
    const width = 800;
    const height = 600;

    // SVGの設定
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '8px')
      .style('background', 'white');

    // データをD3用に変換
    const nodes: D3Node[] = files.map((file) => ({
      ...file,
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
    }));

    // 力学シミュレーションの設定
    // ForceGraph.tsx の力学シミュレーション部分を修正
    const simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-50)) // 反発力を弱める（-100 → -50）
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1)) // 中心力を追加
      .force('collision', d3.forceCollide().radius(35)) // 衝突半径を少し大きく
      .force('x', d3.forceX(width / 2).strength(0.05)) // X方向の引力（新規）
      .force('y', d3.forceY(height / 2).strength(0.05)); // Y方向の引力（新規）

    // グループを作成（型を明確に指定）
    const nodeGroup = svg
      .selectAll<SVGGElement, D3Node>('g')
      .data(nodes)
      .enter()
      .append('g')
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

    // ホバー効果（thisの型を指定）
    nodeGroup
      .on('mouseenter', function (this: SVGGElement) {
        const selection = d3.select(this).select<SVGCircleElement>('circle');
        selection
          .transition()
          .duration(200)
          .attr('r', function (this: SVGCircleElement) {
            const d = d3.select(this).datum() as D3Node;
            const baseR = d.type === 'dir' ? 25 : 15;
            return baseR * 1.2;
          });
      })
      .on('mouseleave', function (this: SVGGElement) {
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
      });

    // クリックイベント
    nodeGroup.on('click', (_event, d) => {
      console.log('クリックされたファイル:', d.name);
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
      nodes.forEach((d) => {
        // 画面内に制限
        d.x = Math.max(30, Math.min(width - 30, d.x!));
        d.y = Math.max(30, Math.min(height - 30, d.y!));
      });

      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // クリーンアップ
    return () => {
      simulation.stop();
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
      }}
    >
      <h3>🎨 力学シミュレーション可視化</h3>
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
        ドラッグで移動、ホバーで拡大します
      </p>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ForceGraph;

import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { API_BASE_URL, TENANT_ID } from '../../services/api';
import { getAuthHeaders } from '../../services/auth';

export const GraphExplorerPage: React.FC = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v2/graph/attack-path`, {
          headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() }
        });
        const data = await response.json();
        setGraphData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, [containerRef]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-glow-cyan">Security Data Fabric</h2>
        <p className="text-muted-foreground mt-1">Interactive Attack Path Analysis & Graph Explorer.</p>
      </div>

      <div ref={containerRef} className="flex-1 bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl overflow-hidden relative min-h-[600px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 text-glow-cyan animate-pulse font-mono">
            Initializing Neo4j Graph Physics Engine...
          </div>
        )}
        
        {!loading && (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="id"
            nodeAutoColorBy="group"
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            linkColor={() => "rgba(0, 255, 255, 0.2)"}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.id;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = node.group === 3 ? '#ff3333' : '#00ffff';
              ctx.beginPath();
              ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
              ctx.fill();
              
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#ffffff';
              ctx.fillText(label, node.x, node.y + 8);
            }}
          />
        )}
      </div>
    </div>
  );
};

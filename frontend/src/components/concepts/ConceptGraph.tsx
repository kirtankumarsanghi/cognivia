import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mastery: number;
  connections: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ConceptGraphProps {
  concepts?: any[];
  selectedConceptId?: string;
  onConceptClick?: (conceptId: string) => void;
}

export default function ConceptGraph({ concepts = [], selectedConceptId, onConceptClick }: ConceptGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const animationFrameRef = useRef<number>();

  // Initialize nodes from concepts or create demo data
  useEffect(() => {
    const initNodes: Node[] = concepts.length > 0
      ? concepts.map((concept) => ({
          id: concept.id,
          name: concept.name,
          x: Math.random() * 700 + 50,
          y: Math.random() * 500 + 50,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          mastery: concept.mastery || Math.random() * 100,
          connections: concept.prerequisites?.map((p: any) => p.id) || [],
          difficulty: concept.difficulty || 'intermediate'
        }))
      : [
          { id: '1', name: 'Variables', x: 200, y: 150, vx: 0.3, vy: 0.2, mastery: 85, connections: [], difficulty: 'beginner' },
          { id: '2', name: 'Functions', x: 400, y: 200, vx: -0.2, vy: 0.3, mastery: 70, connections: ['1'], difficulty: 'beginner' },
          { id: '3', name: 'Loops', x: 300, y: 350, vx: 0.2, vy: -0.3, mastery: 60, connections: ['1'], difficulty: 'intermediate' },
          { id: '4', name: 'Arrays', x: 500, y: 300, vx: -0.3, vy: -0.2, mastery: 75, connections: ['1', '3'], difficulty: 'intermediate' },
          { id: '5', name: 'Objects', x: 600, y: 150, vx: 0.2, vy: 0.3, mastery: 55, connections: ['1', '4'], difficulty: 'intermediate' },
          { id: '6', name: 'Classes', x: 650, y: 400, vx: -0.2, vy: -0.3, mastery: 40, connections: ['2', '5'], difficulty: 'advanced' },
          { id: '7', name: 'Async/Await', x: 450, y: 450, vx: 0.3, vy: -0.2, mastery: 30, connections: ['2'], difficulty: 'advanced' },
          { id: '8', name: 'Recursion', x: 250, y: 500, vx: -0.2, vy: 0.2, mastery: 45, connections: ['2', '3'], difficulty: 'advanced' },
        ];
    
    nodesRef.current = initNodes;
  }, [concepts]);

  // Handle canvas resize
  useEffect(() => {
    const parent = canvasRef.current?.parentElement;
    if (!parent) return;

    const updateDimensions = () => {
      setDimensions({
        width: parent.clientWidth || 800,
        height: Math.max(600, parent.clientHeight || 600)
      });
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(parent);

    return () => observer.disconnect();
  }, []);

  // Physics simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      if (dimensions.width > 100 && dimensions.height > 100) {
        const currentNodes = nodesRef.current;

        // First pass: Calculate physics
        currentNodes.forEach(node => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;
          let newVx = node.vx;
          let newVy = node.vy;

          // Bounce off walls
          if (newX < 30 || newX > dimensions.width - 30) {
            newVx *= -0.8;
            newX = Math.max(30, Math.min(dimensions.width - 30, newX));
          }
          if (newY < 30 || newY > dimensions.height - 30) {
            newVy *= -0.8;
            newY = Math.max(30, Math.min(dimensions.height - 30, newY));
          }

          // Apply forces towards connected nodes
          node.connections.forEach(targetId => {
            const target = currentNodes.find(n => n.id === targetId);
            if (target) {
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                // Spring force
                const force = (dist - 150) * 0.002;
                newVx += (dx / dist) * force;
                newVy += (dy / dist) * force;
              }
            }
          });

          // Repulsion from other nodes
          currentNodes.forEach(other => {
            if (other.id !== node.id) {
              const dx = node.x - other.x;
              const dy = node.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 100 && dist > 0) {
                const force = (100 - dist) * 0.005;
                newVx += (dx / dist) * force;
                newVy += (dy / dist) * force;
              }
            }
          });

          // Slight pull to center
          const centerX = dimensions.width / 2;
          const centerY = dimensions.height / 2;
          newVx += (centerX - node.x) * 0.0001;
          newVy += (centerY - node.y) * 0.0001;

          // Add slight friction
          newVx *= 0.99;
          newVy *= 0.99;

          node.x = newX;
          node.y = newY;
          node.vx = newVx;
          node.vy = newVy;
        });

        // Second pass: Draw connections
        currentNodes.forEach(node => {
          node.connections.forEach(connId => {
            const connectedNode = currentNodes.find(n => n.id === connId);
            if (connectedNode) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(connectedNode.x, connectedNode.y);
              ctx.strokeStyle = hoveredNode === node.id || hoveredNode === connId
                ? 'rgba(232, 64, 64, 0.6)'
                : 'rgba(232, 166, 52, 0.2)';
              ctx.lineWidth = hoveredNode === node.id || hoveredNode === connId ? 2 : 1;
              ctx.stroke();
            }
          });
        });

        // Third pass: Draw nodes
        currentNodes.forEach(node => {
          const isSelected = selectedConceptId === node.id;
          const isHovered = hoveredNode === node.id;
          const radius = isHovered ? 35 : isSelected ? 32 : 28;

          // Node glow
          if (isHovered || isSelected) {
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius + 10);
            gradient.addColorStop(0, `rgba(232, 64, 64, 0.3)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 10, 0, Math.PI * 2);
            ctx.fill();
          }

          // Mastery background ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(232, 166, 52, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Mastery progress arc
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * node.mastery / 100));
          ctx.strokeStyle = node.mastery > 70 
            ? 'rgba(61, 214, 140, 0.8)' 
            : node.mastery > 40 
            ? 'rgba(232, 166, 52, 0.8)' 
            : 'rgba(232, 64, 64, 0.8)';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Difficulty indicator
          const difficultyColor = node.difficulty === 'beginner' 
            ? '#3DD68C' 
            : node.difficulty === 'intermediate' 
            ? '#E8A634' 
            : '#E84040';
          ctx.fillStyle = difficultyColor;
          ctx.beginPath();
          ctx.arc(node.x + radius - 8, node.y - radius + 8, 4, 0, Math.PI * 2);
          ctx.fill();

          // Node label
          ctx.fillStyle = '#ffffff';
          ctx.font = isHovered ? 'bold 13px var(--font-body)' : '12px var(--font-body)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const maxWidth = radius * 1.5;
          const nodeName = node.name || 'Unknown';
          const text = nodeName.length > 10 ? nodeName.substring(0, 10) + '...' : nodeName;
          ctx.fillText(text, node.x, node.y, maxWidth);

          if (isHovered) {
            ctx.font = '10px var(--font-mono)';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(`${Math.round(node.mastery)}%`, node.x, node.y + 18);
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, hoveredNode, selectedConceptId]);

  // Handle mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredNode = nodesRef.current.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });

    setHoveredNode(hoveredNode?.id || null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onConceptClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodesRef.current.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });

    if (clickedNode) {
      onConceptClick(clickedNode.id);
    }
  };

  return (
    <div className="relative w-full h-full bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 shadow-xl">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-surface-container to-transparent p-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
              Concept Knowledge Graph
            </h3>
            <p className="font-body-sm text-on-surface-variant">
              Interactive visualization of your learning journey
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3DD68C]" />
              <span className="text-on-surface-variant">Mastered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E8A634]" />
              <span className="text-on-surface-variant">Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E84040]" />
              <span className="text-on-surface-variant">Needs Work</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="w-full h-full"
      />

      {/* Hovered node tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-high border border-outline-variant/20 rounded-xl px-6 py-3 shadow-2xl backdrop-blur-sm"
          >
            <p className="font-body-sm text-on-surface text-center">
              Click to explore <span className="font-semibold text-primary">
                {nodesRef.current.find(n => n.id === hoveredNode)?.name}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!hoveredNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="font-body-sm text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">touch_app</span>
            Hover and click nodes to explore concepts
          </p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
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
  description?: string;
}

interface Particle {
  fromId: string;
  toId: string;
  progress: number;
  speed: number;
}

interface ConceptGraphProps {
  concepts?: any[];
  selectedConceptId?: string;
  onConceptClick?: (conceptId: string) => void;
}

export default function ConceptGraph({ concepts = [], selectedConceptId, onConceptClick }: ConceptGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const animationFrameRef = useRef<number>();
  
  // Pan and Zoom state
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Initialize nodes
  useEffect(() => {
    const initNodes: Node[] = concepts.length > 0
      ? concepts.map((concept) => ({
          id: concept.id,
          name: concept.name,
          x: Math.random() * 700 + 50,
          y: Math.random() * 500 + 50,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          mastery: concept.mastery ?? Math.random() * 100,
          connections: concept.prerequisites?.map((p: any) => p.id) || [],
          difficulty: concept.difficulty || 'intermediate',
          description: concept.description
        }))
      : [];
    
    nodesRef.current = initNodes;

    // Initialize flowing particles
    const initParticles: Particle[] = [];
    initNodes.forEach(node => {
      node.connections.forEach(targetId => {
        // Spawn 2-3 particles per connection
        const count = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < count; i++) {
          initParticles.push({
            fromId: node.id,
            toId: targetId,
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.003
          });
        }
      });
    });
    particlesRef.current = initParticles;

    // Reset view
    transformRef.current = { x: 0, y: 0, scale: 1 };
  }, [concepts]);

  // Handle resize
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
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Interaction handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    
    const newScale = Math.min(Math.max(0.5, transformRef.current.scale + delta), 2.5);
    
    // Zoom around mouse
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      transformRef.current.x = mouseX - (mouseX - transformRef.current.x) * (newScale / transformRef.current.scale);
      transformRef.current.y = mouseY - (mouseY - transformRef.current.y) * (newScale / transformRef.current.scale);
      transformRef.current.scale = newScale;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      transformRef.current.x = e.clientX - dragStartRef.current.x;
      transformRef.current.y = e.clientY - dragStartRef.current.y;
      canvas.style.cursor = 'grabbing';
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.scale;
    const y = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.scale;

    const hoveredNode = nodesRef.current.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });

    setHoveredNode(hoveredNode?.id || null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (canvasRef.current) canvasRef.current.style.cursor = hoveredNode ? 'pointer' : 'grab';
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || !onConceptClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.scale;
    const y = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.scale;

    const clickedNode = nodesRef.current.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });

    if (clickedNode) {
      onConceptClick(clickedNode.id);
    }
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      if (dimensions.width > 100 && dimensions.height > 100) {
        const currentNodes = nodesRef.current;
        const transform = transformRef.current;

        // Apply Transform
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);

        // Calculate physics
        currentNodes.forEach(node => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;
          let newVx = node.vx;
          let newVy = node.vy;

          // Bounce off invisible boundaries (to keep them roughly in view)
          const bounds = { w: Math.max(dimensions.width, 1200), h: Math.max(dimensions.height, 800) };
          if (newX < 50 || newX > bounds.w - 50) newVx *= -0.8;
          if (newY < 50 || newY > bounds.h - 50) newVy *= -0.8;
          newX = Math.max(50, Math.min(bounds.w - 50, newX));
          newY = Math.max(50, Math.min(bounds.h - 50, newY));

          // Spring forces for connections
          node.connections.forEach(targetId => {
            const target = currentNodes.find(n => n.id === targetId);
            if (target) {
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                const force = (dist - 200) * 0.001;
                newVx += (dx / dist) * force;
                newVy += (dy / dist) * force;
              }
            }
          });

          // Repulsion
          currentNodes.forEach(other => {
            if (other.id !== node.id) {
              const dx = node.x - other.x;
              const dy = node.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 150 && dist > 0) {
                const force = (150 - dist) * 0.008;
                newVx += (dx / dist) * force;
                newVy += (dy / dist) * force;
              }
            }
          });

          // Center pull
          newVx += ((dimensions.width / 2) - node.x) * 0.00005;
          newVy += ((dimensions.height / 2) - node.y) * 0.00005;
          newVx *= 0.95; // Friction
          newVy *= 0.95;

          node.x = newX;
          node.y = newY;
          node.vx = newVx;
          node.vy = newVy;
        });

        // Draw connections
        currentNodes.forEach(node => {
          node.connections.forEach(connId => {
            const connectedNode = currentNodes.find(n => n.id === connId);
            if (connectedNode) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(connectedNode.x, connectedNode.y);
              const isActive = hoveredNode === node.id || hoveredNode === connId || selectedConceptId === node.id || selectedConceptId === connId;
              ctx.strokeStyle = isActive ? 'rgba(232, 166, 52, 0.5)' : 'rgba(255, 255, 255, 0.05)';
              ctx.lineWidth = isActive ? 2 : 1;
              ctx.stroke();
            }
          });
        });

        // Update & Draw Flowing Particles
        particlesRef.current.forEach(particle => {
          const fromNode = currentNodes.find(n => n.id === particle.fromId);
          const toNode = currentNodes.find(n => n.id === particle.toId);
          
          if (fromNode && toNode) {
            particle.progress += particle.speed;
            if (particle.progress >= 1) particle.progress = 0;

            const px = fromNode.x + (toNode.x - fromNode.x) * particle.progress;
            const py = fromNode.y + (toNode.y - fromNode.y) * particle.progress;

            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(232, 166, 52, 0.8)';
            ctx.shadowColor = '#E8A634';
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        });

        // Draw nodes
        currentNodes.forEach(node => {
          const isSelected = selectedConceptId === node.id;
          const isHovered = hoveredNode === node.id;
          const radius = isHovered ? 35 : isSelected ? 32 : 28;

          if (isHovered || isSelected) {
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius + 15);
            gradient.addColorStop(0, `rgba(232, 166, 52, 0.2)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 15, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(20, 20, 22, 1)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#E8A634' : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.stroke();

          // Mastery Arc
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * node.mastery / 100));
          ctx.strokeStyle = node.mastery > 70 
            ? 'rgba(61, 214, 140, 0.9)' 
            : node.mastery > 40 
            ? 'rgba(232, 166, 52, 0.9)' 
            : 'rgba(232, 64, 64, 0.9)';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Text Label
          ctx.fillStyle = isSelected ? '#E8A634' : '#ffffff';
          ctx.font = isHovered || isSelected ? 'bold 13px var(--font-body)' : '12px var(--font-body)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const text = node.name.length > 12 ? node.name.substring(0, 11) + '...' : node.name;
          ctx.fillText(text, node.x, node.y, radius * 1.8);
        });

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [dimensions, hoveredNode, selectedConceptId]);

  return (
    <div className="relative w-full h-full bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 shadow-xl cursor-grab active:cursor-grabbing">
      {/* HUD overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-surface-container to-transparent p-6 pb-12 pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
              Concept Graph
            </h3>
            <p className="font-body-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">mouse</span>
              Scroll to zoom, drag to pan
            </p>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        className="w-full h-full block"
      />

      <AnimatePresence>
        {hoveredNode && !selectedConceptId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-high border border-outline-variant/20 rounded-xl px-6 py-3 shadow-2xl backdrop-blur-sm pointer-events-none"
          >
            <p className="font-body-sm text-on-surface text-center">
              Click to inspect <span className="font-semibold text-primary">
                {nodesRef.current.find(n => n.id === hoveredNode)?.name}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

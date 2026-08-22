import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    const cursorGlow = cursorGlowRef.current;
    if (!cursor || !cursorDot || !cursorGlow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;

    const speed = 0.12;
    const dotSpeed = 0.3;
    const glowSpeed = 0.05;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, input, textarea, select, [role="button"], .cursor-interactive');
      setIsPointer(!!isInteractive);
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    const handleMouseEnter = () => setIsHidden(false);
    const handleMouseLeave = () => setIsHidden(true);

    const animate = () => {
      // Smooth follow for outer cursor
      const distX = mouseX - cursorX;
      const distY = mouseY - cursorY;
      cursorX += distX * speed;
      cursorY += distY * speed;

      // Faster follow for inner dot
      const dotDistX = mouseX - dotX;
      const dotDistY = mouseY - dotY;
      dotX += dotDistX * dotSpeed;
      dotY += dotDistY * dotSpeed;

      // Slowest follow for glow
      const glowDistX = mouseX - glowX;
      const glowDistY = mouseY - glowY;
      glowX += glowDistX * glowSpeed;
      glowY += glowDistY * glowSpeed;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;

      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;

      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    const animationFrame = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      {/* Outer glow */}
      <div
        ref={cursorGlowRef}
        className={`custom-cursor-glow ${isPointer ? 'cursor-glow-pointer' : ''} ${isHidden ? 'cursor-hidden' : ''}`}
      />
      
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isPointer ? 'cursor-pointer' : ''} ${clicked ? 'cursor-clicked' : ''} ${isHidden ? 'cursor-hidden' : ''}`}
      />
      
      {/* Inner cursor dot */}
      <div
        ref={cursorDotRef}
        className={`custom-cursor-dot ${isPointer ? 'cursor-dot-pointer' : ''} ${clicked ? 'cursor-dot-clicked' : ''} ${isHidden ? 'cursor-hidden' : ''}`}
      />
    </>
  );
}

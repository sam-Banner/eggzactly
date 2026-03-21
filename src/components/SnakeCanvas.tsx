import { useEffect, useRef, useCallback } from 'react';
import { useMessContext } from '@/context/MessContext';

interface SnakeSegment {
  x: number;
  y: number;
}

interface Snake {
  memberId: string;
  color: string;
  pattern: 'striped' | 'dotted';
  segments: SnakeSegment[];
  targetX: number;
  targetY: number;
  speed: number;
  state: 'idle' | 'hunting' | 'returning';
  idleAngle: number;
  idleSpeed: number;
  baseLength: number;
}

const CANVAS_W = 600;
const CANVAS_H = 400;
const TRAY_CX = CANVAS_W / 2;
const TRAY_CY = CANVAS_H / 2;
const TRAY_W = 200;
const TRAY_H = 240;
const SEG_SPACING = 6;
const BASE_SEGMENTS = 8;
const SEGMENTS_PER_EGG = 3;

const SnakeCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakesRef = useRef<Snake[]>([]);
  const animRef = useRef<number>(0);
  const { members, lastEatEvent } = useMessContext();
  const prevEventRef = useRef<number | null>(null);

  // Initialize / sync snakes with members
  useEffect(() => {
    const existing = snakesRef.current;
    const newSnakes: Snake[] = members.map((m, i) => {
      const prev = existing.find(s => s.memberId === m.id);
      const angle = (i / members.length) * Math.PI * 2;
      const spawnR = 160;
      const sx = TRAY_CX + Math.cos(angle) * spawnR;
      const sy = TRAY_CY + Math.sin(angle) * spawnR;
      const segCount = BASE_SEGMENTS + m.eggsEaten * SEGMENTS_PER_EGG;

      if (prev) {
        // Update color/pattern, adjust segment count
        while (prev.segments.length < segCount) {
          const last = prev.segments[prev.segments.length - 1];
          prev.segments.push({ x: last.x, y: last.y });
        }
        prev.segments = prev.segments.slice(0, segCount);
        prev.color = m.color;
        prev.pattern = m.pattern;
        prev.baseLength = segCount;
        return prev;
      }

      const segments: SnakeSegment[] = Array.from({ length: segCount }, (_, j) => ({
        x: sx - j * 2,
        y: sy,
      }));

      return {
        memberId: m.id,
        color: m.color,
        pattern: m.pattern,
        segments,
        targetX: sx,
        targetY: sy,
        speed: 2 + Math.random(),
        state: 'idle' as const,
        idleAngle: Math.random() * Math.PI * 2,
        idleSpeed: 0.01 + Math.random() * 0.015,
        baseLength: segCount,
      };
    });
    snakesRef.current = newSnakes;
  }, [members]);

  // Handle eat events - send snake to tray
  useEffect(() => {
    if (!lastEatEvent || lastEatEvent.timestamp === prevEventRef.current) return;
    prevEventRef.current = lastEatEvent.timestamp;

    const snake = snakesRef.current.find(s => s.memberId === lastEatEvent.memberId);
    if (!snake) return;

    // Calculate egg position on tray
    const row = Math.floor(lastEatEvent.eggIndex / 5);
    const col = lastEatEvent.eggIndex % 5;
    const eggX = TRAY_CX - TRAY_W / 2 + 20 + col * (TRAY_W / 5);
    const eggY = TRAY_CY - TRAY_H / 2 + 20 + row * (TRAY_H / 6);

    snake.targetX = eggX;
    snake.targetY = eggY;
    snake.state = 'hunting';
    snake.speed = 5;
  }, [lastEatEvent]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    for (const snake of snakesRef.current) {
      const head = snake.segments[0];
      if (!head) continue;

      // Movement logic
      const dx = snake.targetX - head.x;
      const dy = snake.targetY - head.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (snake.state === 'idle') {
        // Smooth wandering
        snake.idleAngle += snake.idleSpeed;
        const memberIdx = snakesRef.current.indexOf(snake);
        const baseAngle = (memberIdx / snakesRef.current.length) * Math.PI * 2;
        const wanderR = 40 + Math.sin(snake.idleAngle * 0.7) * 20;
        const orbitR = 150;
        snake.targetX = TRAY_CX + Math.cos(baseAngle + snake.idleAngle * 0.3) * orbitR + Math.cos(snake.idleAngle) * wanderR;
        snake.targetY = TRAY_CY + Math.sin(baseAngle + snake.idleAngle * 0.3) * orbitR + Math.sin(snake.idleAngle * 1.3) * wanderR * 0.6;
        snake.speed = 1.5;
      }

      if (snake.state === 'hunting' && dist < 8) {
        // Reached egg, return to orbit
        const memberIdx = snakesRef.current.indexOf(snake);
        const baseAngle = (memberIdx / snakesRef.current.length) * Math.PI * 2;
        snake.targetX = TRAY_CX + Math.cos(baseAngle) * 150;
        snake.targetY = TRAY_CY + Math.sin(baseAngle) * 150;
        snake.state = 'returning';
        snake.speed = 3;
      }

      if (snake.state === 'returning' && dist < 15) {
        snake.state = 'idle';
        snake.speed = 1.5;
      }

      // Move head toward target
      if (dist > 1) {
        head.x += (dx / dist) * snake.speed;
        head.y += (dy / dist) * snake.speed;
      }

      // Follow segments
      for (let i = 1; i < snake.segments.length; i++) {
        const prev = snake.segments[i - 1];
        const seg = snake.segments[i];
        const sdx = prev.x - seg.x;
        const sdy = prev.y - seg.y;
        const sd = Math.sqrt(sdx * sdx + sdy * sdy);
        if (sd > SEG_SPACING) {
          seg.x += (sdx / sd) * (sd - SEG_SPACING);
          seg.y += (sdy / sd) * (sd - SEG_SPACING);
        }
      }

      // Draw snake
      const segCount = snake.segments.length;
      
      // Body
      for (let i = segCount - 1; i >= 1; i--) {
        const seg = snake.segments[i];
        const t = 1 - i / segCount;
        const radius = 2.5 + t * 4;
        
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
        
        if (snake.pattern === 'dotted' && i % 3 === 0) {
          ctx.fillStyle = lightenColor(snake.color, 40);
        } else if (snake.pattern === 'striped' && i % 4 < 2) {
          ctx.fillStyle = lightenColor(snake.color, 25);
        } else {
          ctx.fillStyle = snake.color;
        }
        ctx.fill();
      }

      // Head
      ctx.beginPath();
      ctx.arc(head.x, head.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = snake.color;
      ctx.fill();

      // Eyes
      const nextSeg = snake.segments[1] || head;
      const eyeAngle = Math.atan2(head.y - nextSeg.y, head.x - nextSeg.x);
      const eyeOffX = Math.cos(eyeAngle);
      const eyeOffY = Math.sin(eyeAngle);
      const perpX = -eyeOffY;
      const perpY = eyeOffX;

      for (const side of [-1, 1]) {
        const ex = head.x + eyeOffX * 2 + perpX * side * 3.5;
        const ey = head.y + eyeOffY * 2 + perpY * side * 3.5;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex + eyeOffX * 0.8, ey + eyeOffY * 0.8, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#222';
        ctx.fill();
      }

      // Tongue (when hunting)
      if (snake.state === 'hunting') {
        const tongueLen = 8 + Math.sin(Date.now() * 0.02) * 3;
        ctx.beginPath();
        ctx.moveTo(head.x + eyeOffX * 7, head.y + eyeOffY * 7);
        const tx = head.x + eyeOffX * (7 + tongueLen);
        const ty = head.y + eyeOffY * (7 + tongueLen);
        ctx.lineTo(tx, ty);
        // Fork
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + perpX * 3 + eyeOffX * 3, ty + perpY * 3 + eyeOffY * 3);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - perpX * 3 + eyeOffX * 3, ty - perpY * 3 + eyeOffY * 3);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ imageRendering: 'auto' }}
    />
  );
};

function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, r + amount)}, ${Math.min(255, g + amount)}, ${Math.min(255, b + amount)})`;
}

export default SnakeCanvas;

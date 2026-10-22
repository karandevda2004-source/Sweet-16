'use client';

import { useEffect, useRef, useState } from 'react';

const TRAIL_MAX = 22;
const TRAIL_MAX_DOWN = 44;

export default function YarnCursor() {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reduce);
    if (!fine || reduce) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const pointer = { x: -100, y: -100 };
    const hook = { x: -100, y: -100 };
    const trail = [];
    let down = false;
    let hot = false;
    let frame = 0;

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      const target = e.target.closest?.('a,button,input,select,textarea,[data-cursor]');
      const nextHot = Boolean(target);
      if (nextHot !== hot) {
        hot = nextHot;
        cursorRef.current?.classList.toggle('hot', hot);
      }
    };

    const onDown = () => {
      down = true;
      cursorRef.current?.classList.add('down');
    };
    const onUp = () => {
      down = false;
      cursorRef.current?.classList.remove('down');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    const draw = () => {
      frame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      hook.x += (pointer.x - hook.x) * 0.22;
      hook.y += (pointer.y - hook.y) * 0.22;

      if (cursorRef.current) {
        const angle = Math.max(-22, Math.min(22, (pointer.x - hook.x) * 0.35));
        cursorRef.current.style.transform = `translate(${hook.x - 22}px,${
          hook.y - 22
        }px) rotate(${angle}deg)`;
      }

      trail.push({ x: pointer.x, y: pointer.y });
      const max = down ? TRAIL_MAX_DOWN : TRAIL_MAX;
      while (trail.length > max) trail.shift();
      if (trail.length < 2) return;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i += 1) {
        const a = trail[i - 1];
        const b = trail[i];
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      ctx.strokeStyle = hot ? 'rgba(255,42,133,.55)' : 'rgba(26,26,26,.30)';
      ctx.lineWidth = down ? 3.2 : 2.1;
      ctx.stroke();

      ctx.strokeStyle = hot ? 'rgba(255,42,133,.9)' : 'rgba(184,91,53,.75)';
      ctx.lineWidth = 1.2;
      const step = down ? 5 : 8;
      for (let i = 2; i < trail.length; i += step) {
        const p = trail[i];
        const q = trail[Math.max(0, i - 1)];
        const angle = Math.atan2(p.y - q.y, p.x - q.x) + Math.PI / 2;
        const len = (down ? 7 : 5) * (1 - (i / trail.length) * 0.4);
        ctx.beginPath();
        ctx.moveTo(p.x - Math.cos(angle) * len, p.y - Math.sin(angle) * len);
        ctx.lineTo(p.x + Math.cos(angle) * len, p.y + Math.sin(angle) * len);
        ctx.stroke();
      }
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9998]"
      />
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] grid h-11 w-11 place-items-center"
        style={{ transform: 'translate(-100px,-100px)' }}
      >
        <svg viewBox="0 0 24 24" className="h-[30px] w-[30px]">
          <path
            d="M8 2.5h5.5a4 4 0 0 1 0 8H10a4 4 0 0 0 0 8h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <line x1="8" y1="2.5" x2="8" y2="18.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <style>{`
        @media (pointer: fine) {
          body,
          body * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}

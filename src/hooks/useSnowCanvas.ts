import { useEffect, useRef } from "react";

interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  ph: number;
  a: number;
}

// Falling-snow particle field across the hero. Runs on requestAnimationFrame
// (the design prototype used setInterval(…, 33) because rAF was throttled in
// its preview sandbox — production should use rAF, per the handoff notes).
export function useSnowCanvas(): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let flakes: Flake[] = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(140, (w * h) / 10000));
      flakes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.8,
        vy: 8 + Math.random() * 22,
        drift: (Math.random() - 0.5) * 14,
        ph: Math.random() * Math.PI * 2,
        a: 0.16 + Math.random() * 0.45,
      }));
    };
    build();
    window.addEventListener("resize", build);

    let last = performance.now();
    let raf = 0;
    const frame = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.vy * dt;
        f.ph += dt * 0.9;
        f.x += (f.drift + Math.sin(f.ph) * 8) * dt;
        if (f.y - f.r > h) {
          f.y = -4;
          f.x = Math.random() * w;
        }
        if (f.x < -8) f.x = w + 8;
        if (f.x > w + 8) f.x = -8;
        ctx.globalAlpha = f.a;
        ctx.fillStyle = "#fdf3e7";
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", build);
      cancelAnimationFrame(raf);
    };
  }, []);

  return canvasRef;
}

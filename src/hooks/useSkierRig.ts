import { useEffect } from "react";

export interface SkierRigRefs {
  torso: React.RefObject<SVGLineElement | null>;
  head: React.RefObject<SVGCircleElement | null>;
  beanie: React.RefObject<SVGCircleElement | null>;
  pom: React.RefObject<SVGCircleElement | null>;
  upperArm: React.RefObject<SVGLineElement | null>;
  forearm: React.RefObject<SVGLineElement | null>;
  handle: React.RefObject<SVGLineElement | null>;
  cord: React.RefObject<SVGLineElement | null>;
  cordB: React.RefObject<SVGLineElement | null>;
  thigh: React.RefObject<SVGLineElement | null>;
  shin: React.RefObject<SVGLineElement | null>;
  thighB: React.RefObject<SVGLineElement | null>;
  shinB: React.RefObject<SVGLineElement | null>;
}

interface Point {
  x: number;
  y: number;
}

const ease = (u: number) => u * u * (3 - 2 * u);

function seg(el: SVGLineElement | null, a: Point, b: Point) {
  if (!el) return;
  el.setAttribute("x1", a.x.toFixed(1));
  el.setAttribute("y1", a.y.toFixed(1));
  el.setAttribute("x2", b.x.toFixed(1));
  el.setAttribute("y2", b.y.toFixed(1));
}

function at(el: SVGCircleElement | null, p: Point) {
  if (!el) return;
  el.setAttribute("cx", p.x.toFixed(1));
  el.setAttribute("cy", p.y.toFixed(1));
}

// Two-bone IK. `sign` picks the elbow/knee bend direction.
function ik(a: Point, b: Point, l1: number, l2: number, sign: number) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let d = Math.hypot(dx, dy) || 0.001;
  const max = l1 + l2 - 0.6;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  const ux = dx / d;
  const uy = dy / d;
  const a1 = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a1 * a1));
  return {
    x: a.x + ux * a1 - sign * uy * h,
    y: a.y + uy * a1 + sign * ux * h,
    end: { x: a.x + dx, y: a.y + dy },
  };
}

function bez(p: number, p0: Point, p1: Point, p2: Point): Point {
  const q = 1 - p;
  return {
    x: q * q * p0.x + 2 * q * p * p1.x + p * p * p2.x,
    y: q * q * p0.y + 2 * q * p * p1.y + p * p * p2.y,
  };
}

const PULLEY: Point = { x: 181, y: 46 };
const CATCH: Point = { x: 150, y: 60 };
const CTRL: Point = { x: 170, y: 112 };
const FINISH: Point = { x: 104, y: 146 };
const PERIOD = 1500;

// Drives every joint of the skier rig from a single authored stroke cycle
// (fast drive, slower recovery) so the cords stay attached to the hands
// every frame. Runs on requestAnimationFrame, per the handoff notes.
export function useSkierRig(r: SkierRigRefs) {
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = ((now - t0) % PERIOD) / PERIOD;
      const p = t < 0.42 ? ease(t / 0.42) : 1 - ease((t - 0.42) / 0.58);

      const hip: Point = { x: 104, y: 128 + 7 * p };
      const lean = ((8 + 46 * p) * Math.PI) / 180;
      const L = 37;
      const shoulder: Point = {
        x: hip.x + L * Math.sin(lean),
        y: hip.y - L * Math.cos(lean),
      };
      const head: Point = {
        x: shoulder.x + 13 * Math.sin(lean),
        y: shoulder.y - 13 * Math.cos(lean),
      };
      const hand = bez(p, CATCH, CTRL, FINISH);

      seg(r.torso.current, hip, shoulder);
      at(r.head.current, head);
      at(r.beanie.current, { x: head.x + 7 * Math.sin(lean), y: head.y - 7 * Math.cos(lean) });
      at(r.pom.current, { x: head.x + 18 * Math.sin(lean), y: head.y - 18 * Math.cos(lean) });

      const arm = ik(shoulder, hand, 26, 26, 1);
      seg(r.upperArm.current, shoulder, arm);
      seg(r.forearm.current, arm, arm.end);
      seg(r.handle.current, { x: arm.end.x - 1.5, y: arm.end.y - 7 }, { x: arm.end.x + 1.5, y: arm.end.y + 7 });
      seg(r.cord.current, PULLEY, { x: arm.end.x - 1, y: arm.end.y - 6 });
      seg(r.cordB.current, { x: PULLEY.x + 4, y: PULLEY.y + 2 }, { x: arm.end.x + 4, y: arm.end.y - 4 });

      const legFront = ik(hip, { x: 94, y: 182 }, 30, 30, -1);
      seg(r.thigh.current, hip, legFront);
      seg(r.shin.current, legFront, legFront.end);

      const hipBack: Point = { x: hip.x + 6, y: hip.y + 2 };
      const legBack = ik(hipBack, { x: 120, y: 182 }, 30, 30, -1);
      seg(r.thighB.current, hipBack, legBack);
      seg(r.shinB.current, legBack, legBack.end);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

import { useRef } from "react";
import { useSkierRig } from "../hooks/useSkierRig";

// The relay in one frame: a skier working a SkiErg beside a teammate asleep
// on a mattress. The ground is not drawn inside the SVG — two absolutely
// positioned divs extend past the viewport so it reads as continuous terrain
// (see the handoff notes on "Grounding").
export default function SkierScene() {
  const torso = useRef<SVGLineElement>(null);
  const head = useRef<SVGCircleElement>(null);
  const beanie = useRef<SVGCircleElement>(null);
  const pom = useRef<SVGCircleElement>(null);
  const upperArm = useRef<SVGLineElement>(null);
  const forearm = useRef<SVGLineElement>(null);
  const handle = useRef<SVGLineElement>(null);
  const cord = useRef<SVGLineElement>(null);
  const cordB = useRef<SVGLineElement>(null);
  const thigh = useRef<SVGLineElement>(null);
  const shin = useRef<SVGLineElement>(null);
  const thighB = useRef<SVGLineElement>(null);
  const shinB = useRef<SVGLineElement>(null);

  useSkierRig({
    torso,
    head,
    beanie,
    pom,
    upperArm,
    forearm,
    handle,
    cord,
    cordB,
    thigh,
    shin,
    thighB,
    shinB,
  });

  return (
    <div className="scene">
      <div className="scene__snow-plane" />
      <div className="scene__snow-fade" />
      <svg viewBox="0 0 392 208" className="scene__svg">
        <ellipse cx="112" cy="191" rx="44" ry="4" fill="#9d8494" opacity="0.38" />
        <ellipse cx="300" cy="193" rx="60" ry="4" fill="#9d8494" opacity="0.32" />

        {/* mattress */}
        <rect x="238" y="170" width="140" height="18" rx="9" fill="#b99e94" />
        <rect x="238" y="165" width="140" height="9" rx="4.5" fill="#d3bdb1" />
        <rect x="344" y="151" width="36" height="15" rx="7.5" fill="#e6d6c9" />

        {/* sleeper */}
        <g className="scene__breathe">
          <rect x="242" y="150" width="106" height="20" rx="10" fill="#6b4a63" />
          <ellipse cx="288" cy="153" rx="32" ry="9" fill="#6b4a63" />
        </g>
        <circle cx="356" cy="146" r="10" fill="#e8a06a" />
        <circle cx="353" cy="151" r="10.5" fill="#20141f" />
        <text x="370" y="130" fill="#f6e7d6" className="scene__z scene__z--1">z</text>
        <text x="370" y="130" fill="#f6e7d6" className="scene__z scene__z--2">z</text>
        <text x="370" y="130" fill="#f6e7d6" className="scene__z scene__z--3">z</text>

        {/* SkiErg frame */}
        <rect x="156" y="156" width="52" height="32" rx="7" fill="#20141f" />
        <rect x="175" y="40" width="13" height="120" rx="5" fill="#20141f" />
        <circle cx="182" cy="172" r="11" fill="#31212e" />
        <g className="scene__wheel">
          <circle cx="182" cy="165" r="2.6" fill="#e8a06a" opacity="0.8" />
        </g>
        <circle cx="181" cy="44" r="5.5" fill="#20141f" />

        {/* driven rig */}
        <line ref={cordB} stroke="#20141f" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        <line ref={thighB} stroke="#6b4a63" strokeWidth={11} strokeLinecap="round" />
        <line ref={shinB} stroke="#6b4a63" strokeWidth={9} strokeLinecap="round" />
        <rect x="108" y="180" width="26" height="8" rx="4" fill="#6b4a63" />
        <line ref={thigh} stroke="#20141f" strokeWidth={12} strokeLinecap="round" />
        <line ref={shin} stroke="#20141f" strokeWidth={10} strokeLinecap="round" />
        <rect x="84" y="180" width="26" height="8" rx="4" fill="#20141f" />
        <line ref={torso} stroke="#20141f" strokeWidth={18} strokeLinecap="round" />
        <circle ref={beanie} r={10} fill="#e8a06a" />
        <circle ref={pom} r={3.4} fill="#e8a06a" />
        <circle ref={head} r={10.5} fill="#20141f" />
        <line ref={cord} stroke="#20141f" strokeWidth={2.2} strokeLinecap="round" />
        <line ref={upperArm} stroke="#20141f" strokeWidth={8} strokeLinecap="round" />
        <line ref={forearm} stroke="#20141f" strokeWidth={7} strokeLinecap="round" />
        <line ref={handle} stroke="#20141f" strokeWidth={6} strokeLinecap="round" />
      </svg>
    </div>
  );
}

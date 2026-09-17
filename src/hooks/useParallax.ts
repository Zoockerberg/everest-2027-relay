import { useEffect, useRef } from "react";

export interface ParallaxRefs {
  back: React.RefObject<SVGSVGElement | null>;
  mid: React.RefObject<SVGSVGElement | null>;
  fore: React.RefObject<SVGSVGElement | null>;
}

// Three ridge layers drift at different rates on scroll, read directly off
// window.scrollY and written straight to the DOM (no React state) to keep
// this smooth at 60fps.
export function useParallax(): ParallaxRefs {
  const back = useRef<SVGSVGElement>(null);
  const mid = useRef<SVGSVGElement>(null);
  const fore = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (back.current) back.current.style.transform = `translate3d(0,${(y * 0.14).toFixed(1)}px,0)`;
      if (mid.current) mid.current.style.transform = `translate3d(0,${(y * -0.05).toFixed(1)}px,0)`;
      if (fore.current) fore.current.style.transform = `translate3d(0,${(y * -0.2).toFixed(1)}px,0)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { back, mid, fore };
}

"use client";

import { useRef, useId, useEffect } from "react";
import { animate, useMotionValue, AnimationPlaybackControls } from "framer-motion";

export function EtherealBackground({
  color = "rgba(255, 95, 0, 0.6)",
  scale = 40,
  speed = 50,
  className,
}: {
  color?: string;
  scale?: number;
  speed?: number;
  className?: string;
}) {
  const rawId = useId();
  const id = `eth-${rawId.replace(/:/g, "")}`;
  const feRef = useRef<SVGFEColorMatrixElement>(null);
  const hue = useMotionValue(0);
  const animRef = useRef<AnimationPlaybackControls | null>(null);

  const displace = scale * 0.8;
  const duration = Math.max(3, (100 - speed) / 8);

  useEffect(() => {
    if (!feRef.current) return;
    animRef.current = animate(hue, 360, {
      duration,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear",
      onUpdate: (v) => feRef.current?.setAttribute("values", String(v)),
    });
    return () => { animRef.current?.stop(); };
  }, [duration, hue]);

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <div style={{ position: "absolute", inset: -displace, filter: `url(#${id}) blur(6px)` }}>
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter id={id}>
              <feTurbulence
                result="undulation"
                numOctaves={2}
                baseFrequency="0.0008,0.003"
                seed={0}
                type="turbulence"
              />
              <feColorMatrix
                ref={feRef}
                in="undulation"
                type="hueRotate"
                values="0"
              />
              <feColorMatrix
                in="dist"
                result="circulation"
                type="matrix"
                values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="circulation"
                scale={displace}
                result="dist"
              />
              <feDisplacementMap
                in="dist"
                in2="undulation"
                scale={displace}
                result="output"
              />
            </filter>
          </defs>
        </svg>
        <div
          style={{
            backgroundColor: color,
            maskImage: "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
            maskSize: "cover",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskImage: "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
            WebkitMaskSize: "cover",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}

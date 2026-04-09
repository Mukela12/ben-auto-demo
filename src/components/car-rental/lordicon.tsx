"use client";

import { useRef, useEffect } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { cn } from "@/lib/utils";

interface LordiconProps {
  icon: string;
  size?: number;
  className?: string;
  trigger?: "hover" | "loop" | "click" | "morph";
  colors?: { primary?: string; secondary?: string };
}

export function Lordicon({
  icon,
  size = 32,
  className,
  trigger = "hover",
  colors,
}: LordiconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: trigger === "loop",
      autoplay: trigger === "loop",
      path: `/lordicons/${icon}.json`,
    });

    animRef.current = anim;

    anim.addEventListener("DOMLoaded", () => {
      // Apply colors if specified
      if (colors?.primary) {
        const svgEl = containerRef.current?.querySelector("svg");
        if (svgEl) {
          svgEl.querySelectorAll("path, circle, rect, ellipse").forEach((el) => {
            const fill = el.getAttribute("fill");
            if (fill && fill !== "none" && fill !== "transparent") {
              el.setAttribute("fill", colors.primary!);
            }
            const stroke = el.getAttribute("stroke");
            if (stroke && stroke !== "none" && stroke !== "transparent") {
              el.setAttribute("stroke", colors.primary!);
            }
          });
        }
      }
    });

    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, [icon, trigger, colors?.primary]);

  const handleMouseEnter = () => {
    if (trigger === "hover" && animRef.current) {
      animRef.current.goToAndPlay(0);
    }
  };

  const handleClick = () => {
    if (trigger === "click" && animRef.current) {
      animRef.current.goToAndPlay(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

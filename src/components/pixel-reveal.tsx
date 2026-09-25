"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionEnabled, onceInView } from "@/lib/motion";
import { drawPixelated, snapshot } from "@/lib/pixelate";

/** Block size (CSS px) and how long it holds (ms): ~600ms total, slowing as it sharpens. */
const STEPS: [block: number, ms: number][] = [
  [16, 90],
  [8, 120],
  [4, 170],
  [2, 220],
];
const DISSOLVE_MAX_BLOCK = 32;

/**
 * Resolves its single child from coarse pixel blocks to sharp. The child is
 * real markup, so it stays readable without JavaScript, with reduced motion,
 * and to screen readers; the canvas is only a temporary overlay.
 *
 * data-state: unset (waiting) · "animating" · "done" · "dissolving" (scrollLinked only)
 */
export function PixelReveal({
  children,
  trigger = "inView",
  scrollLinked = false,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  trigger?: "load" | "inView";
  scrollLinked?: boolean;
  delay?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const target = root?.firstElementChild;
    if (!root || !canvas || !target || !motionEnabled()) return;

    let cancelled = false;
    let frame = 0;
    const timers: number[] = [];
    const setState = (state: string) => {
      root.dataset.state = state;
    };
    const fitCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = target.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      return { width, height, dpr };
    };

    const followScroll = (source: CanvasImageSource) => {
      const onScroll = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = root.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
          if (progress < 0.05) {
            setState("done");
            return;
          }
          const { dpr } = fitCanvas();
          const block = 2 + progress * (DISSOLVE_MAX_BLOCK - 2);
          drawPixelated(canvas, source, Math.round(block * dpr));
          setState("dissolving");
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    };
    let stopFollowing = () => {};

    const reveal = async () => {
      try {
        const { width, height, dpr } = fitCanvas();
        const source = await snapshot(target, width, height);
        if (cancelled) return;
        setState("animating");
        let at = delay;
        for (const [block, ms] of STEPS) {
          timers.push(
            window.setTimeout(
              () => drawPixelated(canvas, source, block * dpr),
              at,
            ),
          );
          at += ms;
        }
        timers.push(
          window.setTimeout(() => {
            setState("done");
            if (scrollLinked) stopFollowing = followScroll(source);
          }, at),
        );
      } catch {
        // A failed image or font load must never leave content hidden.
        if (!cancelled) setState("done");
      }
    };

    let stopObserving = () => {};
    if (trigger === "load") void reveal();
    else stopObserving = onceInView(root, () => void reveal());

    return () => {
      cancelled = true;
      stopObserving();
      stopFollowing();
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
    };
  }, [trigger, scrollLinked, delay]);

  return (
    <div ref={rootRef} className={`pixel-reveal ${className}`}>
      {children}
      <canvas
        ref={canvasRef}
        className="pixel-reveal__canvas"
        aria-hidden="true"
      />
    </div>
  );
}

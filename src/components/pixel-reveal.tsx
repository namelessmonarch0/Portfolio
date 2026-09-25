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

/**
 * Resolves its single child from coarse pixel blocks to sharp the first time
 * it scrolls into view. The child is real markup, so it stays readable without
 * JavaScript, with reduced motion, and to screen readers; the canvas is only a
 * temporary overlay.
 *
 * data-state: unset (waiting) · "animating" · "done"
 */
export function PixelReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const target = root?.firstElementChild;
    if (!root || !canvas || !target || !motionEnabled()) return;
    root.dataset.armed = "";

    let cancelled = false;
    const timers: number[] = [];
    const setState = (state: string) => {
      root.dataset.state = state;
    };

    const reveal = async () => {
      try {
        const dpr = window.devicePixelRatio || 1;
        const { width, height } = target.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        const source = await snapshot(target, width, height);
        if (cancelled) return;
        setState("animating");
        let at = 0;
        for (const [block, ms] of STEPS) {
          timers.push(
            window.setTimeout(
              () => drawPixelated(canvas, source, block * dpr),
              at,
            ),
          );
          at += ms;
        }
        timers.push(window.setTimeout(() => setState("done"), at));
      } catch {
        // A failed image or font load must never leave content hidden.
        if (!cancelled) setState("done");
      }
    };

    const stopObserving = onceInView(root, () => void reveal());
    return () => {
      cancelled = true;
      stopObserving();
      timers.forEach(clearTimeout);
    };
  }, []);

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

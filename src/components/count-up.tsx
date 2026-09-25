"use client";

import { useEffect, useRef } from "react";
import { motionEnabled, onceInView } from "@/lib/motion";

const DURATION_MS = 1200;

/** Shows the final value in the HTML, then counts up from `start` the first time it scrolls into view. */
export function CountUp({
  start = 0,
  value,
  prefix = "",
  suffix = "",
}: {
  start?: number;
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = `${prefix}${value}${suffix}`;

  useEffect(() => {
    const element = ref.current;
    if (!element || !motionEnabled()) return;
    const format = (n: number) => `${prefix}${n}${suffix}`;
    let frame = 0;
    element.textContent = format(start);
    const stop = onceInView(element, () => {
      const began = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - began) / DURATION_MS);
        const eased = 1 - (1 - t) ** 3;
        element.textContent = format(
          Math.round(start + (value - start) * eased),
        );
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    return () => {
      stop();
      cancelAnimationFrame(frame);
      element.textContent = format(value);
    };
  }, [start, value, prefix, suffix]);

  return (
    <>
      <span className="sr-only">{final}</span>
      <span ref={ref} className="count-up__live" aria-hidden="true">
        {final}
      </span>
      {/* The live number may be mid-count or not started when printing. */}
      <span className="count-up__print" aria-hidden="true">
        {final}
      </span>
    </>
  );
}

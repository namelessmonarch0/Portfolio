"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionEnabled, onceInView } from "@/lib/motion";

/** Fades its children up the first time they scroll into view. */
export function RevealOnScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !motionEnabled()) return;
    return onceInView(element, () => element.classList.add("is-visible"));
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

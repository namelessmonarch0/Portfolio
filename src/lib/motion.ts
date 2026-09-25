/**
 * Motion runs only when scripts run and the visitor has not asked for reduced
 * motion. globals.css gates every motion rule on this same query, so CSS and
 * JavaScript always agree. Browsers that do not know `scripting` get no motion.
 */
export const MOTION_QUERY =
  "(scripting: enabled) and (prefers-reduced-motion: no-preference)";

export function motionEnabled(): boolean {
  return window.matchMedia(MOTION_QUERY).matches;
}

/** Calls `onEnter` once, the first time `element` scrolls into view. Returns a cleanup function. */
export function onceInView(element: Element, onEnter: () => void): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        onEnter();
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

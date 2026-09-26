"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import portraitHead from "@/assets/portrait-head.webp";

const NAV = [
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Projects", "#projects"],
  ["Contact", "#contact"],
] as const;

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const update = () => {
      header.dataset.scrolled = String(window.scrollY > 8);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });

    // The nav wraps when text is enlarged, so publish the real header height
    // for scroll-padding; otherwise anchor jumps land under a taller header.
    const root = document.documentElement;
    const resize = new ResizeObserver(([entry]) => {
      root.style.setProperty(
        "--header-height",
        `${entry.borderBoxSize[0].blockSize}px`,
      );
    });
    resize.observe(header);

    return () => {
      window.removeEventListener("scroll", update);
      resize.disconnect();
      root.style.removeProperty("--header-height");
    };
  }, []);

  return (
    <header ref={ref} className="site-header" data-scrolled="false">
      <div className="site-header__inner container">
        <a className="site-header__home" href="#top" aria-label="Back to top">
          <Image
            src={portraitHead}
            alt=""
            width={44}
            height={44}
            loading="eager"
          />
        </a>
        <nav className="site-nav" aria-label="Primary">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

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
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header ref={ref} className="site-header" data-scrolled="false">
      <div className="site-header__inner container">
        <a className="site-header__home" href="#top" aria-label="Back to top">
          <Image src={portraitHead} alt="" width={36} height={36} />
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

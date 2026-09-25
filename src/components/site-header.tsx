import Image from "next/image";
import portraitHead from "@/assets/portrait-head.webp";

const NAV = [
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Projects", "#projects"],
  ["Contact", "#contact"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
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

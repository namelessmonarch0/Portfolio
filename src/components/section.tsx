import type { ReactNode } from "react";
import { PixelReveal } from "@/components/pixel-reveal";

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="section container"
      aria-labelledby={`${id}-title`}
    >
      <p className="eyebrow">{eyebrow}</p>
      <PixelReveal className="section__title-wrap">
        <h2 id={`${id}-title`} className="section__title">
          {title}
        </h2>
      </PixelReveal>
      {children}
    </section>
  );
}

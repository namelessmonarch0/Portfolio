import type { ReactNode } from "react";
import { PixelReveal } from "@/components/pixel-reveal";

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="section container"
      aria-labelledby={`${id}-title`}
    >
      <PixelReveal className="section__title-wrap">
        <h2 id={`${id}-title`} className="section__title">
          {title}
        </h2>
      </PixelReveal>
      {children}
    </section>
  );
}

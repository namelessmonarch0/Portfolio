import type { ReactNode } from "react";

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
      <h2 id={`${id}-title`} className="section__title">
        {title}
      </h2>
      {children}
    </section>
  );
}

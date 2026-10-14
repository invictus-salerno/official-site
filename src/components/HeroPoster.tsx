import type { ReactNode } from "react";

export function HeroPoster({
  children,
  actions,
}: {
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <section className="hero hero-poster" aria-labelledby="hero-title">
      <div className="hero-stage">{children}</div>
      <div className="hero-copy-actions">{actions}</div>
    </section>
  );
}

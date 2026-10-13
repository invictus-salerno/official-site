import type { ReactNode } from "react";

export function HeroPoster({ children }: { children: ReactNode }) {
  return (
    <section className="hero hero-poster" aria-labelledby="hero-title">
      <div className="hero-stage">{children}</div>
    </section>
  );
}

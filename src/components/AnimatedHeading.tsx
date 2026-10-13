"use client";

import {
  Fragment,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

export function AnimatedHeading({
  as: Tag = "h2",
  id,
  lines,
}: {
  as?: "h1" | "h2";
  id?: string;
  lines: ReactNode[];
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    function observe() {
      observer?.disconnect();
      heading!.removeAttribute("data-revealed");
      if (query.matches) return;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            heading!.dataset.revealed = "true";
            if (Tag !== "h1") observer?.disconnect();
          } else if (Tag === "h1") {
            heading!.removeAttribute("data-revealed");
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(heading!);
    }
    observe();
    query.addEventListener("change", observe);
    return () => {
      observer?.disconnect();
      query.removeEventListener("change", observe);
      heading.removeAttribute("data-revealed");
    };
  }, [Tag]);

  return (
    <Tag ref={headingRef} id={id} className="animated-heading">
      {lines.map((line, index) => (
        <Fragment key={index}>
          <span
            className={`heading-line${Tag === "h1" ? " hero-title-line" : ""}`}
          >
            <span
              className={`heading-reveal${Tag === "h1" ? " hero-title-reveal" : ""}`}
              style={{ "--line-delay": `${index * 75}ms` } as CSSProperties}
            >
              {line}
            </span>
          </span>
          {index < lines.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

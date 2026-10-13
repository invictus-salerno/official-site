"use client";

import {
  createContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

const entranceMs = 1400;
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export const HeroPlaybackContext = createContext(true);

export function HeroEntrance({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const startedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => true,
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    let timer: number | undefined;
    // If a motion preference changed mid-intro, keep the already shown scene usable.
    if (startedRef.current) {
      timer = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startedRef.current = true;
        section.dataset.entered = "true";
        timer = window.setTimeout(() => setReady(true), entranceMs);
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  return (
    <HeroPlaybackContext.Provider value={reducedMotion || ready}>
      <section
        ref={sectionRef}
        className="hero hero-trailer"
        aria-labelledby="hero-title"
        data-ready={reducedMotion || ready}
        style={
          { "--hero-entrance-duration": `${entranceMs}ms` } as CSSProperties
        }
        onFocusCapture={(event) => {
          if ((event.target as HTMLElement).closest(".hero-copy-actions")) {
            sectionRef.current?.removeAttribute("data-entered");
            setReady(true);
          }
        }}
      >
        <div className="hero-stage">{children}</div>
      </section>
    </HeroPlaybackContext.Provider>
  );
}

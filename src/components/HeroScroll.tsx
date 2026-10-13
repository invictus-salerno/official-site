"use client";

import {
  createContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export const HeroPlaybackContext = createContext(true);

export function HeroScroll({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [foreground, setForeground] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => true,
  );

  useEffect(() => {
    const section = sectionRef.current;
    const stage = section?.querySelector<HTMLElement>(".hero-stage");
    const player = section?.querySelector<HTMLElement>(".hero-visual");
    const heading = section?.querySelector<HTMLElement>(".hero-copy-heading");
    const actions = section?.querySelector<HTMLElement>(".hero-copy-actions");
    if (!section || !stage || !player || !heading || !actions || reducedMotion)
      return;

    let frame = 0;
    let previousProgress = -1;
    let previousForeground: boolean | undefined;
    let metrics = { top: 0, distance: 1, x: 0, y: 0, scale: 1 };

    function render() {
      frame = 0;
      if (!section) return;
      const progress = Math.max(
        0,
        Math.min(1, (window.scrollY - metrics.top) / metrics.distance),
      );
      if (progress === previousProgress) return;
      previousProgress = progress;
      progressRef.current = progress;
      // Smoothstep keeps the beginning and end gentle while following native scroll.
      const eased = progress * progress * (3 - 2 * progress);
      section.style.setProperty("--hero-progress", String(eased));
      section.style.setProperty("--video-x", `${metrics.x * (1 - eased)}px`);
      section.style.setProperty("--video-y", `${metrics.y * (1 - eased)}px`);
      const videoScale = metrics.scale + (1 - metrics.scale) * eased;
      section.style.setProperty("--video-scale", String(videoScale));
      section.style.setProperty("--control-scale", String(1 / videoScale));
      const nextForeground = progress >= 0.35;
      if (nextForeground !== previousForeground) {
        previousForeground = nextForeground;
        setForeground(nextForeground);
      }
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(render);
    }

    function measure() {
      if (!section || !stage || !player || !heading || !actions) return;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const mobile = width <= 600;
      // On phones, reserve a centered preview between the heading and actions.
      // Offset measurements ignore the entrance transforms and avoid layout jumps.
      const previewTop = heading.offsetTop + heading.offsetHeight + 16;
      const previewSpace = Math.max(100, actions.offsetTop - 16 - previewTop);
      const scale = mobile
        ? Math.min(0.6, previewSpace / player.offsetHeight)
        : 0.74;
      metrics = {
        top: section.getBoundingClientRect().top + window.scrollY,
        distance: Math.max(1, section.clientHeight - height),
        x: mobile ? 0 : width * 0.25,
        y: mobile
          ? previewTop + (player.offsetHeight * scale) / 2 - height / 2
          : 0,
        scale,
      };
      previousProgress = -1;
      schedule();
    }

    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(stage);
    observer.observe(player);
    observer.observe(heading);
    observer.observe(actions);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    measure();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      observer.disconnect();
      for (const property of [
        "--hero-progress",
        "--video-x",
        "--video-y",
        "--video-scale",
        "--control-scale",
      ])
        section.style.removeProperty(property);
      progressRef.current = 0;
    };
  }, [reducedMotion]);

  return (
    <HeroPlaybackContext.Provider value={reducedMotion || foreground}>
      <section
        ref={sectionRef}
        className="hero hero-scroll"
        aria-labelledby="hero-title"
        data-foreground={reducedMotion || foreground}
        onFocusCapture={(event) => {
          // Restore readable copy before a keyboard user reaches a faded link.
          if (
            progressRef.current > 0.1 &&
            (event.target as HTMLElement).closest(".hero-copy")
          ) {
            const section = sectionRef.current;
            if (section)
              window.scrollTo({
                top: section.getBoundingClientRect().top + window.scrollY,
                behavior: "instant",
              });
          }
        }}
      >
        <div className="hero-stage">{children}</div>
      </section>
    </HeroPlaybackContext.Provider>
  );
}

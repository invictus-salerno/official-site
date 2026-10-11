"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { TeamMediaCard } from "@/components/TeamMediaCard";
import type { TeamMedia } from "@/lib/instagram";

const motionQuery = "(prefers-reduced-motion: reduce)";
// The supplied eight-card demo takes 40s at half speed: five seconds per card.
// Scale the complete loop to preserve that speed for the full 115-item archive.
const secondsPerCard = 40 / 8;
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

export function TeamCarousel({ items }: { items: TeamMedia[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(
    () => new Set(),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => true,
  );
  const pageVisible = useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => false,
  );
  const active = inView && pageVisible && !reducedMotion;
  const advancing = active && !hovered && !focused;

  const seek = useCallback(
    (position: number) => {
      if (!items.length) return;
      const next = (position + items.length) % items.length;
      const animation = trackRef.current?.getAnimations()[0];
      if (animation) animation.currentTime = next * secondsPerCard * 1000;
      setIndex(next);
    },
    [items.length],
  );
  const move = (offset: number) => {
    const time = trackRef.current?.getAnimations()[0]?.currentTime;
    const current =
      typeof time === "number"
        ? Math.floor(time / (secondsPerCard * 1000)) % items.length
        : index;
    seek(current + offset);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleCards((previous) => {
          const next = new Set(previous);
          for (const entry of entries) {
            const position = Number(
              (entry.target as HTMLElement).dataset.carouselCard,
            );
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25)
              next.add(position);
            else next.delete(position);
          }
          if (
            next.size === previous.size &&
            [...next].every((value) => previous.has(value))
          )
            return previous;
          return next;
        });
      },
      { root: viewport, threshold: [0, 0.25] },
    );
    for (const card of viewport.querySelectorAll("[data-carousel-card]"))
      observer.observe(card);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (!advancing || !items.length) return;
    const timer = window.setInterval(() => {
      const time = trackRef.current?.getAnimations()[0]?.currentTime;
      if (typeof time === "number")
        setIndex(Math.floor(time / (secondsPerCard * 1000)) % items.length);
    }, 250);
    return () => window.clearInterval(timer);
  }, [advancing, items.length]);

  if (!items.length) return null;
  const trackStyle = {
    "--carousel-duration": `${items.length * secondsPerCard}s`,
    animationPlayState: advancing ? "running" : "paused",
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className="team-carousel"
      role="region"
      aria-roledescription="carosello"
      aria-label="Foto e video del team dal 2020"
      tabIndex={0}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        setFocused(true);
        const card = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-carousel-card]",
        );
        if (card) {
          seek(Number(card.dataset.carouselCard));
          if (viewportRef.current) viewportRef.current.scrollLeft = 0;
        }
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLVideoElement) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="carousel-toolbar">
        <span>I nostri successi dal 2020</span>
      </div>
      <div
        ref={viewportRef}
        className="scroll-container"
        onTouchStart={(event) => {
          touchStart.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
        }}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start || event.target instanceof HTMLVideoElement) return;
          const x = start.x - event.changedTouches[0].clientX;
          const y = start.y - event.changedTouches[0].clientY;
          if (Math.abs(x) > 50 && Math.abs(x) > Math.abs(y))
            move(x > 0 ? 1 : -1);
        }}
      >
        <div ref={trackRef} className="infinite-scroll" style={trackStyle}>
          {[false, true].map((duplicate) => (
            <div
              key={String(duplicate)}
              className="carousel-group"
              aria-hidden={duplicate ? true : undefined}
            >
              {items.map((item, position) => {
                const cardPosition = position + (duplicate ? items.length : 0);
                const visible = inView && visibleCards.has(cardPosition);
                return (
                  <TeamMediaCard
                    key={item.id}
                    item={item}
                    position={cardPosition}
                    count={items.length}
                    duplicate={duplicate}
                    visible={visible}
                    playing={active && visible}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="carousel-counter">
        {index + 1} / {items.length}
      </p>
    </div>
  );
}

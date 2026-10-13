"use client";

import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/site";

export function LocalVideo({
  src,
  label,
  poster,
  className,
  videoClassName,
  preferAudio = false,
  keepPlayingOffscreen = false,
}: {
  src: string;
  label: string;
  poster?: string;
  className: string;
  videoClassName: string;
  preferAudio?: boolean;
  keepPlayingOffscreen?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manuallyMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let visible = false;
    let hasBeenVisible = false;
    let needsGesture = false;

    async function play() {
      if (
        cancelled ||
        !(visible || (keepPlayingOffscreen && hasBeenVisible)) ||
        document.hidden ||
        !video
      )
        return;
      try {
        await video.play();
        if (!cancelled) {
          if (!video.muted || manuallyMutedRef.current) needsGesture = false;
          setAutoplayBlocked(false);
        }
      } catch (error) {
        // Respect autoplay restrictions while preserving the chosen sound policy.
        if (
          !cancelled &&
          (visible || (keepPlayingOffscreen && hasBeenVisible)) &&
          !document.hidden &&
          error instanceof DOMException &&
          error.name === "NotAllowedError"
        ) {
          // Keep the video moving even when audible autoplay is denied.
          video.muted = true;
          setIsMuted(true);
          needsGesture = preferAudio && !manuallyMutedRef.current;
          try {
            await video.play();
            if (!cancelled) setAutoplayBlocked(false);
          } catch {
            if (!cancelled) setAutoplayBlocked(true);
          }
        }
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      hasBeenVisible ||= visible;
      if (visible || (keepPlayingOffscreen && hasBeenVisible)) void play();
      else video.pause();
    });
    observer.observe(video);
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else void play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onGesture = (event: Event) => {
      if (!event.isTrusted || !needsGesture || manuallyMutedRef.current) return;
      if ((event.target as Element | null)?.closest?.(".video-audio-toggle"))
        return;
      video.muted = false;
      setIsMuted(false);
      void play();
    };
    if (preferAudio) {
      window.addEventListener("pointerdown", onGesture, { passive: true });
      window.addEventListener("touchend", onGesture, { passive: true });
      window.addEventListener("keydown", onGesture);
    }
    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchend", onGesture);
      window.removeEventListener("keydown", onGesture);
      video.pause();
    };
  }, [src, preferAudio, keepPlayingOffscreen]);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        className={videoClassName}
        src={assetPath(src)}
        poster={poster ? assetPath(poster) : undefined}
        aria-label={label}
        playsInline
        loop
        autoPlay={keepPlayingOffscreen}
        preload={keepPlayingOffscreen ? "auto" : "metadata"}
        onVolumeChange={(event) =>
          setIsMuted(
            event.currentTarget.muted || event.currentTarget.volume === 0,
          )
        }
      >
        Il tuo browser non supporta questo video.
      </video>
      <button
        className="video-audio-toggle"
        type="button"
        aria-label={
          autoplayBlocked
            ? "Avvia video"
            : isMuted
              ? "Attiva audio"
              : "Disattiva audio"
        }
        aria-pressed={!isMuted}
        data-autoplay-blocked={autoplayBlocked}
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          if (autoplayBlocked) {
            void video
              .play()
              .then(() => setAutoplayBlocked(false))
              .catch(() => undefined);
            return;
          }
          const enableAudio = video.muted || video.volume === 0;
          manuallyMutedRef.current = !enableAudio;
          if (enableAudio && video.volume === 0) video.volume = 1;
          video.muted = !enableAudio;
          setIsMuted(!enableAudio);
          if (enableAudio)
            void video
              .play()
              .then(() => setAutoplayBlocked(false))
              .catch(() => undefined);
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          {isMuted ? (
            <path d="m16 9 5 6m0-6-5 6" />
          ) : (
            <>
              <path d="M15 8a6 6 0 0 1 0 8" />
              <path d="M18 5a10 10 0 0 1 0 14" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

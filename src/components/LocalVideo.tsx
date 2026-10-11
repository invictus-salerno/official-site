"use client";

import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/site";

export function LocalVideo({
  src,
  label,
  poster,
  className,
  videoClassName,
  startAfterMs = 0,
  enabled = true,
}: {
  src: string;
  label: string;
  poster?: string;
  className: string;
  videoClassName: string;
  startAfterMs?: number;
  enabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let started = false;
    let visible = false;

    async function play() {
      if (
        cancelled ||
        !enabled ||
        !started ||
        !visible ||
        document.hidden ||
        !video
      )
        return;
      try {
        await video.play();
      } catch (error) {
        // Browsers can reject autoplay with sound. Keep the reel playing and
        // offer an explicit sound control instead of leaving an empty player.
        if (
          !cancelled &&
          enabled &&
          visible &&
          !document.hidden &&
          error instanceof DOMException &&
          error.name === "NotAllowedError"
        ) {
          video.muted = true;
          setIsMuted(true);
          await video.play().catch(() => undefined);
        }
      }
    }

    const timer = window.setTimeout(
      () => {
        started = true;
        void play();
      },
      Math.max(0, startAfterMs - performance.now()),
    );
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) void play();
      else video.pause();
    });
    observer.observe(video);
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else void play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
    };
  }, [src, startAfterMs, enabled]);

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
        preload="metadata"
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
        aria-label={isMuted ? "Attiva audio" : "Disattiva audio"}
        aria-pressed={!isMuted}
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          const enableAudio = video.muted || video.volume === 0;
          if (enableAudio && video.volume === 0) video.volume = 1;
          video.muted = !enableAudio;
          setIsMuted(!enableAudio);
          if (enableAudio) void video.play().catch(() => undefined);
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

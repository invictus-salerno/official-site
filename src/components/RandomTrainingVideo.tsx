"use client";

import { useEffect, useState } from "react";
import { VideoCard, type VideoCardProps } from "@/components/VideoCard";

const storageKey = "invictus:last-training-video";

export function RandomTrainingVideo({ videos }: { videos: VideoCardProps[] }) {
  const [selected, setSelected] = useState<VideoCardProps | null>(null);

  useEffect(() => {
    // Keep SSR and hydration identical; pick once after mounting, never on scroll.
    const timer = window.setTimeout(() => {
      let previous: string | null = null;
      try {
        previous = window.localStorage.getItem(storageKey);
      } catch {
        // Storage can be unavailable; video selection must still work.
      }
      const alternatives = videos.filter((video) => video.src !== previous);
      const candidates = alternatives.length ? alternatives : videos;
      const choice = candidates[Math.floor(Math.random() * candidates.length)];
      if (!choice) return;
      try {
        window.localStorage.setItem(storageKey, choice.src);
      } catch {
        // A blocked storage write must not prevent playback.
      }
      setSelected(choice);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [videos]);

  const video = selected ?? videos[0];
  if (!video) return null;
  return (
    <div aria-busy={selected === null}>
      <VideoCard key={video.src} {...video} />
    </div>
  );
}

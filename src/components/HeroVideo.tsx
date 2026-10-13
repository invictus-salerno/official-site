"use client";

import { useContext } from "react";
import { HeroPlaybackContext } from "@/components/HeroEntrance";
import { LocalVideo } from "@/components/LocalVideo";

export function HeroVideo() {
  const enabled = useContext(HeroPlaybackContext);
  return (
    <LocalVideo
      src="keep-calm-and-play-spochan.mp4"
      poster="instagram/ChxGeEmOtgY-01-poster.jpg"
      label="Keep calm and play SpoChan — ASD Invictus Salerno"
      className="hero-visual"
      videoClassName="hero-video"
      startAfterMs={1000}
      enabled={enabled}
      requireAudio
    />
  );
}

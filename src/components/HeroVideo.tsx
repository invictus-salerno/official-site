import { LocalVideo } from "@/components/LocalVideo";

export function HeroVideo() {
  return (
    <LocalVideo
      src="keep-calm-and-play-spochan.mp4"
      poster="instagram/ChxGeEmOtgY-01-poster.jpg"
      label="Keep calm and play SpoChan — ASD Invictus Salerno"
      className="hero-visual"
      videoClassName="hero-video"
      preferAudio
      keepPlayingOffscreen
    />
  );
}

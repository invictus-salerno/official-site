import { LocalVideo } from "@/components/LocalVideo";

type VideoCardProps = {
  src: string;
  title: string;
  poster: string;
};

export function VideoCard({ src, title, poster }: VideoCardProps) {
  return (
    <article className="video-card">
      <LocalVideo
        src={src}
        poster={poster}
        label={title}
        className="training-player"
        videoClassName="training-video"
      />
      <div className="video-title">
        <h3>{title}</h3>
      </div>
    </article>
  );
}

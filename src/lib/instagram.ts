import archive from "@/data/instagram-media.json";

export interface TeamMedia {
  id: string;
  kind: "image" | "video";
  src: string;
  width: number;
  height: number;
  playback: "native" | "instagram";
  poster?: string;
  alt: string;
  permalink: string;
  publishedAt: string;
}

export const teamMedia: TeamMedia[] = archive.posts.flatMap((post) =>
  post.media.map((media, index) => ({
    id: media.id,
    kind: media.kind === "video" ? "video" : "image",
    src: media.src,
    width: media.width,
    height: media.height,
    poster: "poster" in media ? media.poster.src : undefined,
    playback:
      "playback" in media && media.playback === "instagram"
        ? "instagram"
        : "native",
    alt: `${post.caption.split(/\n|#/)[0].trim() || "ASD Invictus Salerno, allenamenti e gare"} — ${media.kind === "video" ? "video" : "foto"} ${index + 1} di ${post.media.length}`,
    permalink: post.permalink,
    publishedAt: post.publishedAt,
  })),
);

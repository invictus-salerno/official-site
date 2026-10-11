"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";
import type { TeamMedia } from "@/lib/instagram";
import { assetPath } from "@/lib/site";

const dateFormat = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Rome",
});

export const TeamMediaCard = memo(function TeamMediaCard({
  item,
  position,
  count,
  duplicate,
  visible,
  playing,
}: {
  item: TeamMedia;
  position: number;
  count: number;
  duplicate: boolean;
  visible: boolean;
  playing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const nativeVideo = item.kind === "video" && item.playback === "native";
  const image = nativeVideo ? item.poster : item.src;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) void video.play().catch(() => undefined);
    else video.pause();
    return () => video.pause();
  }, [playing, visible]);

  return (
    <figure
      className="image-item"
      data-carousel-card={position}
      role={duplicate ? undefined : "group"}
      aria-roledescription={duplicate ? undefined : "diapositiva"}
      aria-label={duplicate ? undefined : `${position + 1} di ${count}`}
    >
      <div className="carousel-media">
        {failed ? (
          <p>Contenuto non disponibile. Apri il post su Instagram.</p>
        ) : nativeVideo && visible ? (
          <video
            ref={videoRef}
            src={assetPath(item.src)}
            poster={item.poster ? assetPath(item.poster) : undefined}
            aria-label={item.alt}
            controls={!duplicate}
            tabIndex={duplicate ? -1 : 0}
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
          />
        ) : image ? (
          <Image
            src={assetPath(image)}
            alt={duplicate ? "" : item.alt}
            fill
            sizes="(max-width: 600px) 192px, (max-width: 1024px) 256px, 320px"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : null}
        {item.playback === "instagram" && (
          <a
            className="carousel-instagram-play"
            href={item.permalink}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={duplicate ? -1 : undefined}
          >
            <span aria-hidden="true">▷</span> Guarda il video su Instagram ↗
          </a>
        )}
      </div>
      <figcaption className="carousel-caption">
        <span>
          <time dateTime={item.publishedAt}>
            {dateFormat.format(new Date(item.publishedAt))}
          </time>{" "}
          · {item.kind === "video" ? "Video" : "Foto"}
        </span>
        <a
          href={item.permalink}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={duplicate ? -1 : undefined}
        >
          Apri post su Instagram ↗
        </a>
      </figcaption>
    </figure>
  );
});

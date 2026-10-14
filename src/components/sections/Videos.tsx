import { RandomTrainingVideo } from "@/components/RandomTrainingVideo";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { teamMedia } from "@/lib/instagram";

const trainingVideos = teamMedia.flatMap((item) =>
  item.kind === "video" &&
  item.playback === "native" &&
  item.poster &&
  !item.src.endsWith("ChxGeEmOtgY-01.mp4")
    ? [{ src: item.src, poster: item.poster, title: "Il team in azione" }]
    : [],
);

export function Videos() {
  return (
    <section className="videos section" id="video">
      <div className="section-heading">
        <div>
          <p className="eyebrow dark">03 / DENTRO L’ALLENAMENTO</p>
          <AnimatedHeading
            lines={["L’ENERGIA.", <em key="last">IN MOVIMENTO.</em>]}
          />
        </div>
        <p>
          Uno sguardo al nostro sport,
          <br />
          attraverso i video del team.
        </p>
      </div>
      <div className="video-grid">
        <RandomTrainingVideo videos={trainingVideos} />
      </div>
    </section>
  );
}

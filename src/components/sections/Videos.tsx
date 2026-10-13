import { VideoCard } from "@/components/VideoCard";
import { AnimatedHeading } from "@/components/AnimatedHeading";

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
        <VideoCard
          src="instagram/DdpO3L9sPDQ-01.mp4"
          poster="instagram/DdpO3L9sPDQ-01-poster.jpg"
          title="Ci vediamo sul tatami"
        />
      </div>
    </section>
  );
}

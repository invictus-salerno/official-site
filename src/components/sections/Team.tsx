import { TeamCarousel } from "@/components/TeamCarousel";
import { teamMedia } from "@/lib/instagram";
import { site } from "@/lib/site";

export function Team() {
  return (
    <section className="team section" id="team">
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / IL TEAM</p>
          <h2>
            NON SOLO UNA SQUADRA.
            <br />
            <em>INVICTUS.</em>
          </h2>
        </div>
        <p>
          In palestra e in gara.
          <br />
          La nostra passione, insieme.
          <br />
          <span className="tag">#notjustateam</span>
        </p>
      </div>
      <TeamCarousel items={teamMedia} />
      <p className="source">
        Foto e video dal nostro profilo{" "}
        <a href={site.instagram} target="_blank" rel="noopener noreferrer">
          @asdinvictus_salerno ↗
        </a>
      </p>
    </section>
  );
}

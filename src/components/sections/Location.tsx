export function Location() {
  return (
    <section className="location section" id="dove-siamo">
      <div>
        <p className="eyebrow dark">05 / DOVE SIAMO</p>
        <AnimatedHeading
          lines={["IL NOSTRO PUNTO", <em key="last">D’INCONTRO.</em>]}
        />
      </div>
      <div className="location-details">
        <h3>Polisportiva Linus</h3>
        <p>Ci alleniamo alla Polisportiva Linus di Salerno.</p>
        <address>
          Viale delle Querce, 1<br />
          84134 Salerno (SA)
        </address>
        <iframe
          className="location-map"
          src={site.mapEmbed}
          title="Mappa della Polisportiva Linus a Salerno"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        <a
          className="button gold"
          href={site.mapHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Apri su Google Maps <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { site } from "@/lib/site";

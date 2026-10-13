import Image from "next/image";
import { assetPath, site } from "@/lib/site";
import { AnimatedHeading } from "@/components/AnimatedHeading";

export function Contact() {
  return (
    <section className="contact section" id="contatti">
      <Image
        src={assetPath("logo.png")}
        alt="Logo ASD Invictus Spochan Team"
        width={955}
        height={857}
        loading="lazy"
      />
      <div>
        <p className="eyebrow">IL PRIMO PASSO È TUO</p>
        <AnimatedHeading
          lines={["CI VEDIAMO", <em key="last">SUL TATAMI.</em>]}
        />
        <p>
          Vuoi saperne di più sul corso per adulti?
          <br />
          Contatta il maestro Andrea Romano: chiamalo, scrivigli su WhatsApp o
          via email.
        </p>
        <p className="contact-number">
          <strong>Maestro Andrea Romano</strong>
          <br />
          <a href={site.phoneHref}>{site.phone}</a>
        </p>
        <p className="contact-email">
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <div className="contact-actions">
          <a
            className="button gold"
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Scrivi ad Andrea su WhatsApp <span aria-hidden="true">↗</span>
          </a>
          <a className="button phone-button" href={site.phoneHref}>
            Chiama Andrea <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

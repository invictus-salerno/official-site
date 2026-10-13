import { HeroVideo } from "@/components/HeroVideo";
import { HeroScroll } from "@/components/HeroScroll";

export function Hero() {
  return (
    <HeroScroll>
      <div className="hero-copy">
        <div className="hero-copy-heading">
          <h1 id="hero-title">
            <span className="hero-title-line">
              <span className="hero-title-reveal">LO SPIRITO</span>
            </span>{" "}
            <span className="hero-title-line">
              <span className="hero-title-reveal">
                DI CHI <em>NON</em>
              </span>
            </span>{" "}
            <span className="hero-title-line">
              <span className="hero-title-reveal">
                <em>SI ARRENDE.</em>
              </span>
            </span>
          </h1>
          <p className="intro">
            Sports Chanbara. Una sfida con te stesso.
            <br />
            Una passione da condividere.
          </p>
        </div>
        <div className="hero-copy-actions">
          <a className="button gold" href="#contatti">
            Entra nel mondo Invictus <span aria-hidden="true">↗</span>
          </a>
          <div className="hero-foot">
            <a href="#corso">Scopri di più ↓</a>
          </div>
        </div>
      </div>
      <HeroVideo />
    </HeroScroll>
  );
}

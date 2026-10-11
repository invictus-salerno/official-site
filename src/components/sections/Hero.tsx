import { HeroVideo } from "@/components/HeroVideo";
import { HeroScroll } from "@/components/HeroScroll";

export function Hero() {
  return (
    <HeroScroll>
      <div className="hero-copy">
        <h1 id="hero-title">
          LO SPIRITO
          <br />
          DI CHI{" "}
          <em>
            NON
            <br />
            SI ARRENDE.
          </em>
        </h1>
        <p className="intro">
          Sports Chanbara. Una sfida con te stesso.
          <br />
          Una passione da condividere.
        </p>
        <a className="button gold" href="#contatti">
          Entra nel mondo Invictus <span aria-hidden="true">↗</span>
        </a>
        <div className="hero-foot">
          <a href="#corso">Scopri di più ↓</a>
        </div>
      </div>
      <HeroVideo />
    </HeroScroll>
  );
}

import { HeroVideo } from "@/components/HeroVideo";
import { HeroEntrance } from "@/components/HeroEntrance";
import { AnimatedHeading } from "@/components/AnimatedHeading";

export function Hero() {
  return (
    <HeroEntrance>
      <div className="hero-copy">
        <div className="hero-copy-heading">
          <AnimatedHeading
            as="h1"
            id="hero-title"
            lines={[
              "LO SPIRITO",
              <>
                DI CHI <em>NON</em>
              </>,
              <em key="last">SI ARRENDE.</em>,
            ]}
          />
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
    </HeroEntrance>
  );
}

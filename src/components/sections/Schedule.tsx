import { AnimatedHeading } from "@/components/AnimatedHeading";

export function Schedule() {
  return (
    <section className="schedule section" id="orari">
      <div>
        <p className="eyebrow">04 / ALLENATI CON NOI</p>
        <AnimatedHeading
          lines={["FAI SPAZIO", "ALLA TUA", <em key="last">PASSIONE.</em>]}
        />
        <p>Sports Chanbara per adulti · Salerno</p>
      </div>
      <div className="timetable">
        <div>
          <span>Lunedì</span>
          <strong>20:00 — 21:30</strong>
        </div>
        <div>
          <span>Mercoledì</span>
          <strong>20:00 — 21:30</strong>
        </div>
        <div>
          <span>Venerdì</span>
          <strong>20:00 — 21:30</strong>
        </div>
        <p>
          <a className="schedule-contact" href="#contatti">
            Contatta il maestro prima di venire per confermare la disponibilità.
            <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </section>
  );
}

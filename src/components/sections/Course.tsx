export function Course() {
  return (
    <section className="course section" id="corso">
      <div>
        <p className="eyebrow dark">01 / IL CORSO</p>
        <h2>
          LA TUA PROSSIMA
          <br />
          SFIDA HA UN NOME.
          <br />
          <em>CHANBARA.</em>
        </h2>
      </div>
      <div className="course-text">
        <p className="large">
          Riflessi, movimento e concentrazione.
          <br />
          Entra nel nostro corso per adulti.
        </p>
        <p>
          Lo Sports Chanbara, o SpoChan, è un’arte marziale giapponese fondata
          da Tetsundo Tanabe nel 1971. Ispirata al combattimento con la spada,
          si pratica con attrezzi leggeri e imbottiti: unisce rapidità, tecnica
          e spirito del gioco.
        </p>
        <p className="course-source">
          <a
            href="https://it.wikipedia.org/wiki/Sports_Chanbara"
            target="_blank"
            rel="noopener noreferrer"
          >
            Scopri di più su Wikipedia ↗
          </a>
        </p>
        <p>
          Vuoi conoscere questa disciplina? Scrivici per informazioni sul corso
          e su come iniziare con ASD Invictus Salerno.
        </p>
        <a className="text-link" href="#orari">
          Allenati con noi <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

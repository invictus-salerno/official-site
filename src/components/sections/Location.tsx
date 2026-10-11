export function Location() {
  return (
    <section className="location section" id="dove-siamo">
      <div>
        <p className="eyebrow dark">05 / DOVE SIAMO</p>
        <h2>
          IL NOSTRO PUNTO
          <br />
          <em>D’INCONTRO.</em>
        </h2>
      </div>
      <div className="location-details">
        <h3>Polisportiva Linus</h3>
        <p>Ci alleniamo alla Polisportiva Linus di Salerno.</p>
        <address>
          Viale delle Querce, 1<br />
          84134 Salerno (SA)
        </address>
        <a
          className="button gold"
          href="https://www.google.com/maps/search/?api=1&query=Polisportiva%20Linus%2C%20Viale%20delle%20Querce%201%2C%20Salerno"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apri su Google Maps <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

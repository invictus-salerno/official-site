export default function NotFound() {
  return (
    <main className="section not-found">
      <p className="eyebrow">404 / PAGINA NON TROVATA</p>
      <h1>
        TORNA
        <br />
        <em>SUL TATAMI.</em>
      </h1>
      <p>La pagina che cerchi non è disponibile.</p>
      <a
        className="button gold"
        href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`}
      >
        Torna al sito <span aria-hidden="true">↗</span>
      </a>
    </main>
  );
}

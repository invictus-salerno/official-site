# ASD Invictus Salerno

Sito ufficiale in **React 19, Next.js 16 (App Router) e TypeScript**. Conserva palette nero/oro, font Barlow, asset e URL Instagram originali, con le modifiche richieste a navigazione, hero e testi.

L’hero riproduce il reel `ChxGeEmOtgY` da un MP4 locale. Scorrendo, il titolo si riduce e il video si ingrandisce fino al centro dello schermo; la riproduzione parte quando entra in primo piano, comunque dopo il primo secondo dall’apertura. Se il browser blocca l’audio automatico, riparte senza audio. Un pulsante a icona in basso a sinistra sul video permette di attivare o disattivare l’audio e ne mostra lo stato; il collegamento Instagram sotto l’hero è stato rimosso. La riproduzione si sospende tornando alla fase iniziale, fuori schermo o quando la scheda è nascosta.

La scena segue il modello [Scroll media expansion hero su 21st.dev](https://21st.dev/community/components/explore/hero-scroll-animation), adattato alla palette e ai media esistenti senza nuove dipendenze. `HeroScroll` usa una sola sezione sticky, scroll nativo, trasformazioni coordinate tramite `requestAnimationFrame` e misure aggiornate con `ResizeObserver`; React cambia stato soltanto alla soglia di riproduzione. Sono previsti layout per telefoni piccoli e orientamento orizzontale, comando audio sempre di 48 px quando visibile e ripristino del testo quando riceve il focus da tastiera. Con `prefers-reduced-motion` il layout rimane statico e leggibile, con l’avvio del video dopo un secondo.

Il carosello include **115 elementi di 43 post dal 1° gennaio 2020**: 95 foto e 20 video, comprese tutte le immagini degli album. Tredici video sono MP4 locali; sette sono limitati per copyright nell’embed pubblico di Instagram e conservano copertina e collegamento al post. Per riprodurre anche questi sette direttamente servono i file originali.

Il design riprende il componente fornito: schede quadrate arrotondate, sfumature laterali, effetto hover e scorrimento orizzontale continuo senza interruzioni. La velocità è dimezzata rispetto all’esempio: 40 secondi per otto schede, quindi 575 secondi per tutti i 115 elementi. Le schede misurano 192 px su telefono, 256 px su tablet e 320 px su desktop. Il carosello non mostra pulsanti di pausa o navigazione; supporta frecce della tastiera, swipe, pausa dello scorrimento su hover/focus e preferenze di movimento ridotto. I video locali visibili si riproducono senza audio in loop; caricamento e riproduzione si sospendono quando escono dall’area visibile. Il gruppo duplicato rende continuo il ciclo ed è escluso dalla navigazione con tastiera e dagli screen reader.

## Avvio locale

Richiede Node.js 22.13 o successivo e npm.

```sh
npm ci
npm run dev
```

Aprire [localhost:3000](http://localhost:3000).

## Build e verifiche

```sh
npm run lint
npm run typecheck
npm run format:check
npm run check:media
npm run build
npm run check:export
npm run preview
```

La build genera `out/`, pubblicabile su qualsiasi hosting statico. Non usare `next start`: questo progetto usa l'[esportazione statica di Next.js](https://nextjs.org/docs/app/guides/static-exports).

Per i test browser, dopo la build:

```sh
npx playwright install chromium
npm run test:e2e
```

I test verificano sezioni e URL originali, hash dei media, contatti, layout da 320 a 1920 px, menu, tastiera, contenuti senza JavaScript, avvio dell’hero e carosello. Tutti i 13 MP4 del carosello vengono realmente decodificati da Chromium desktop/mobile. Anche la sezione 03 usa un MP4 locale, con lo stesso lettore e comando audio dell’hero, senza iframe né link Instagram; i test verificano riproduzione, audio e pausa fuori schermo.

## Pubblicazione

Pubblicare **il contenuto di `out/`** dopo `npm run build`. Non pubblicare la cartella dei sorgenti. `public/.nojekyll` mantiene disponibili gli asset `_next` su GitHub Pages. La migrazione non pubblica automaticamente il sito.

Se il sito è ospitato in una sottocartella, impostare `NEXT_PUBLIC_BASE_PATH` **prima della build**. Per esempio, per `https://invictus-salerno.github.io/official-site/`:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = "/official-site"
npm run build
```

Per un dominio personalizzato o un sito alla radice lasciare la variabile vuota. Il prefisso deve iniziare con `/` e non terminarvi. Gli URL delle immagini usano lo stesso prefisso.

La workflow CI verifica lint, tipi, formattazione, build e test browser; rende disponibile `out/` come artifact senza eseguire deployment.

## Organizzazione

- `src/app/`: pagina, layout, metadati, favicon, pagina 404 e stile globale.
- `src/components/sections/`: sezioni renderizzate staticamente.
- `src/components/Header.tsx`, `LocalVideo.tsx`, `HeroVideo.tsx`, `TeamCarousel.tsx`, `TeamMediaCard.tsx`, `VideoCard.tsx`: menu, lettore locale condiviso e carosello.
- `src/lib/site.ts`: contatti, navigazione e percorsi degli asset.
- `public/assets/`: immagini originali conservate byte per byte; `instagram/` contiene i media pubblici importati.
- `src/data/instagram-media.json`: inventario dei 43 post, date, singoli media, hash e limitazioni di riproduzione.
- `assets/manifest.json`: provenienza originale dei media, non pubblicata.
- `tests/fixtures/original-site.json`: riferimenti originali usati dai test di regressione.

I contatti riportano **Maestro Andrea Romano**, telefono/WhatsApp `388 790 3344` e [invictussalerno@libero.it](mailto:invictussalerno@libero.it).

## Archivio Instagram

Lo storico pubblico è stato consultato fino al post `B6p7R2VnLbZ` del 29 dicembre 2019, oltre il limite richiesto, includendo il reel fissato in alto e i post in collaborazione. Il profilo ha 82 post complessivi; 43 ricadono nel periodo dal 2020. L’importazione è uno snapshot, non una sincronizzazione automatica dei post futuri.

`scripts/import-instagram.py` legge soltanto embed pubblici, senza cookie, credenziali o endpoint privati. Richiede Python 3.10+ e Pillow. Per reimportare i post già inventariati:

```sh
python scripts/import-instagram.py src/data/instagram-media.json --profile-posts 82 --history-through 2019-12-29
```

Per aggiungere post, verificare prima URL e date sul profilo e aggiornare l’inventario. L’importer usa `.instagram-import/` come cartella temporanea esclusa da Git: cancellarla dopo aver controllato l’esito, conservando i media pubblicati in `public/assets/instagram/` e l’inventario. `npm run check:media` verifica completezza, date, unicità, formati e hash dello snapshot; aggiornare anche la fixture numerica quando si aggiorna lo storico.

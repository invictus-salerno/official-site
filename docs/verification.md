# Verifica della migrazione

Animazione hero e footer: implementata una scena sticky breve ispirata al modello media expansion di 21st.dev, con scroll nativo, titolo che si riduce, video che si centra e avvio alla soglia del 35% dopo almeno un secondo. Verificati dimensioni del comando audio, ritorno da tastiera al testo, preferenze di movimento ridotto, telefoni da 320 × 568 px e orientamento 844 × 390 px. Controllo visivo delle fasi iniziale, intermedia e finale desktop/mobile. Firma “ASD Invictus since 2015” centrata sotto i link del footer; titolo carosello “I nostri successi dal 2020”.

La suite comprende ora 28 scenari desktop/mobile. Nell’esecuzione completa ne sono passati 25; tre fallimenti nei controlli preesistenti sono stati risolti correggendo i test: esclusione preventiva delle immagini duplicate dal controllo generale e posizione del carosello fissata dopo la pausa, senza assumere che le verifiche terminino in meno di cinque secondi. La riesecuzione mirata ha superato tutti e quattro i casi desktop/mobile interessati. Build, TypeScript, lint, formattazione ed export verificati.

Ultimo aggiornamento: “Maestro Andrea Romano” interamente in grassetto. La sezione 03 riproduce il reel da MP4 locale usando `LocalVideo`, condiviso con l’hero, con icona audio in sovraimpressione e senza iframe o link Instagram. Tutti i 24 test desktop/mobile superati, inclusa la riproduzione reale del video di allenamento, il cambio di stato audio e la pausa fuori schermo. Build, lint, formattazione, export e integrità dei media verificati. Le note precedenti sugli iframe descrivono la versione iniziale.

Carosello aggiornato al componente fornito dall’utente: scorrimento continuo senza salti, schede quadrate responsive da 192/256/320 px, bordi arrotondati e sfumature laterali. La velocità è dimezzata: otto elementi percorrono il ciclo in 40 secondi; la durata scala a 575 secondi per 115 media. I video visibili si riproducono in loop senza audio e si sospendono fuori dall’area visibile. Pulsanti di pausa e navigazione rimossi su richiesta; tastiera, swipe, pausa su hover/focus e preferenze di movimento ridotto conservati. I test aggiornati verificano durata dell’animazione, pausa, geometria del punto di ricongiungimento, swipe orizzontali e assenza di interferenze con lo scorrimento verticale mobile.

Aggiornamento dell’11 ottobre 2026: implementate tutte le modifiche a header, hero, ribbon e link del corso. Importati **43 post dal 2020**, comprendenti **115 media (95 foto e 20 video)**. Tutti i contenuti individuali degli album sono inventariati, con hash verificati. Lo storico è stato consultato oltre il limite del 2020; dettagli e video limitati sono documentati in `instagram-archive.md`.

La suite aggiornata ha superato **24 test** desktop/mobile: include avvio dell’hero dopo un secondo con simulazione del blocco audio, navigazione e pausa del carosello, preferenze di movimento ridotto, riproduzione fuori schermo sospesa, swipe a 320 px e decodifica reale di tutti i 13 MP4 locali. Gli altri sette video, limitati per copyright nell’embed pubblico, conservano copertina e link. Build, lint, TypeScript, formattazione e controlli di export con e senza `/official-site` superati. Palette e immagini originali integre; layout senza overflow alle nove larghezze previste.

Il controllo visivo ha verificato hero e carosello nelle schermate desktop/mobile. La cartella temporanea dell’importazione è stata eliminata conservando manifest e media del sito. Le note seguenti riportano la verifica della migrazione iniziale.

Verifiche eseguite il 10 ottobre 2026, con Node.js 24.18 e Chromium distribuito da Playwright.

| Requisito                        | Evidenza                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Sito interamente React / Next.js | App Router in `src/app`; nove sezioni in componenti separati; build di produzione completata.                                              |
| Grafica e palette originali      | CSS originale trasferito in `src/app/globals.css`; integrazioni responsive e menu mobile; controllo visivo delle schermate desktop/mobile. |
| Foto e asset invariati           | Sei file originali spostati in `public/assets`; hash SHA-256 verificati contro la fixture estratta prima della migrazione.                 |
| Instagram e video preservati     | Tutti gli URL originali verificati; entrambi i reel caricati su richiesta; link Instagram alternativi sempre disponibili.                  |
| Nome e contatti                  | Test sul testo “Maestro Andrea Romano”, grassetto su “Maestro Andrea”, email `mailto:`, telefono e WhatsApp.                               |
| Responsive                       | Nessun overflow orizzontale a 320, 375, 390, 600, 768, 900, 1024, 1280 e 1920 px.                                                          |
| Interazioni accessibili          | Menu con stato ARIA, chiusura con Escape, ritorno del focus, skip link e attivazione dei reel da tastiera.                                 |
| Contenuti statici                | Corso e contatti disponibili anche disabilitando JavaScript.                                                                               |
| Hosting statico                  | Build e controllo di tutti i riferimenti locali sia alla radice sia con prefisso `/official-site`; 404 e `.nojekyll` presenti.             |
| Qualità del codice               | ESLint, TypeScript strict, Prettier e `git diff --check` superati.                                                                         |
| Dipendenze                       | `npm audit`: nessuna vulnerabilità segnalata.                                                                                              |
| Regressione browser              | Suite completa: 10 test superati. I test mirati sui reel sono stati anche ripetuti tre volte per profilo con successo.                     |

Le risposte Instagram nei test sono simulate: la disponibilità e la riproduzione dei video reali dipendono dal servizio, dalle impostazioni del browser e dall'eventuale accesso del visitatore. I profili mobile sono emulati; non è stata eseguita una verifica su telefoni fisici.

Il Chrome di sistema ha mostrato un'anomalia intermittente nell'emulazione degli iframe; la suite usa il Chromium compatibile installato da Playwright. Non sono state effettuate pubblicazioni né modifiche alle impostazioni dell'hosting.

Il file QR preesistente non tracciato in `assets/qr-invictus-salerno.png` e il manifest originale dei media sono stati preservati.

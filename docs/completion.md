# Criteri di completamento

- Migrazione di tutto il sito a React e Next.js: completata; tutti i contenuti si trovano nell'App Router, senza iniezione di HTML o vecchio script DOM.
- Palette, stile e asset esistenti: preservati; verifiche visive e hash dei media documentati in `verification.md`.
- Layout mobile responsive: completato; breakpoint originali mantenuti e navigazione mobile aggiunta, con nove larghezze verificate.
- Nome richiesto: “Maestro Andrea Romano” interamente in grassetto; telefono e WhatsApp mantenuti.
- Email: `invictussalerno@libero.it` visibile e cliccabile.
- Navigazione e testi: rimosso sottotitolo del marchio, CTA nell’header, eyebrow dell’hero e “CORSO PER ADULTI”; ribbon e link del corso aggiornati.
- Hero: animazione di scroll nativo con titolo che si riduce e video che si ingrandisce al centro, avvio quando entra in primo piano dopo almeno un secondo, layout statico con movimento ridotto. MP4 locale, audio originale con ripiego muto, icona audio di 48 px in sovraimpressione; link Instagram rimosso dall’hero.
- Carosello: inventario completo dei 43 post dal 2020, con 115 media; design del componente fornito, schede responsive, scorrimento continuo a velocità dimezzata, pausa, tastiera, swipe e preferenze di movimento ridotto. Tredici video locali caricati e riprodotti nell’area visibile; sette limitati nell’embed pubblico conservano copertina e link.
- Footer: icone Instagram e WhatsApp, “Torna su” e firma “ASD Invictus since 2015” centrata in basso.
- Titolo carosello: “I nostri successi dal 2020”.
- Verifiche: build, lint, tipi, formattazione, export alla radice/sottocartella e hash dei 115 media; decodifica reale dei 13 MP4 in entrambi i profili. Verificati i 28 scenari, compresa la riesecuzione mirata dei controlli corretti; dettagli in `verification.md`.
- Consegna: sorgenti, lockfile, README, CI senza deployment e build statica in `out/`.
- Sezione 03: MP4 locale con lettore condiviso con l’hero, icona audio e nessuna interfaccia o link Instagram.
- Limiti: sette video del carosello richiedono gli originali per essere riprodotti localmente. Telefoni fisici e hosting remoto non verificati. Nessun deployment eseguito.

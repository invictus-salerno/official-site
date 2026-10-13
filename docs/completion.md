# Criteri di completamento

- Migrazione di tutto il sito a React e Next.js: completata; tutti i contenuti si trovano nell'App Router, senza iniezione di HTML o vecchio script DOM.
- Palette, stile e asset esistenti: preservati; verifiche visive e hash dei media documentati in `verification.md`.
- Layout mobile responsive: completato; breakpoint originali mantenuti e navigazione mobile aggiunta, con nove larghezze verificate.
- Nome richiesto: “Maestro Andrea Romano” interamente in grassetto; telefono e WhatsApp mantenuti.
- Email: `invictussalerno@libero.it` visibile e cliccabile.
- Navigazione e testi: rimosso sottotitolo del marchio, CTA nell’header, eyebrow dell’hero e “CORSO PER ADULTI”; ribbon e link del corso aggiornati.
- Hero: direzione “Sipario da trailer”, titolo a sinistra, apertura del video in 1,4 secondi e avvio al termine dell’ingresso. Video immersivo su mobile, layout statico con movimento ridotto. Audio inizialmente ON, senza passaggio automatico al muto; icona di 48 px e gestione delle regole di autoplay.
- Sottotesto hero: spostato nella sezione del corso con la frase “Sports Chanbara. Una passione da condividere.”.
- Carosello: inventario completo dei 43 post dal 2020, con 115 media; design del componente fornito, schede responsive, scorrimento continuo a velocità dimezzata, pausa, tastiera, swipe e preferenze di movimento ridotto. Tredici video locali caricati e riprodotti nell’area visibile; sette limitati nell’embed pubblico conservano copertina e link.
- Footer: icone Instagram e WhatsApp, “Torna su” e firma “ASD Invictus since 2015” centrata in basso.
- Titolo carosello: “I nostri successi dal 2020”.
- Titoli e posizione: ingresso d’impatto condiviso tra hero e sei sezioni; minimappa interattiva Google Maps sotto l’indirizzo.
- Verifiche: build, lint, tipi, formattazione, export alla radice/sottocartella e hash dei 115 media; decodifica reale dei 13 MP4 in entrambi i profili. Suite completa **30/30 test superati**, compresi video mobile centrato, audio ON, titoli e minimappa; dettagli in `verification.md`.
- Consegna: sorgenti, lockfile, README, CI senza deployment e build statica in `out/`.
- Sezione 03: MP4 locale con lettore condiviso con l’hero, icona audio e nessuna interfaccia o link Instagram.
- Limiti: sette video del carosello richiedono gli originali per essere riprodotti localmente. Telefoni fisici e hosting remoto non verificati. Nessun deployment eseguito.

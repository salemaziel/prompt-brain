---
model: gemma-3
vendor: Google
family: Gemma
aliases: [gemma3, gemma-3-27b, gemma-3-27b-it, gemma-3-12b-it, gemma-3-4b-it, gemma-3-1b-it, gemma3-27b, gemma_3]
last_verified: 2026-10-13
status: legacy
successor: gemma-4
---

# Gemma 3

## Reasoning / Thinking
- Typ: **keins** (kein dediziertes „Thinking"- oder Reasoning-Modus). Gemma 3 ist ein open-weight Modell (frei verfügbare Gewichte, pre-trained und instruction-tuned) und besitzt keinen eingebauten Chain-of-Thought-/Thinking-Schalter wie neuere „thinking"-Modelle.
- Schritt-für-Schritt-Denken muss klassisch über das Prompting angestoßen werden: explizite Anweisungen wie „Denke Schritt für Schritt" / „Begründe deine Antwort vor dem Ergebnis" bzw. Few-shot-Beispiele. Die offizielle Prompt-Formatting-Dokumentation erwähnt **weder** Chain-of-Thought **noch** Zero-/Few-shot-Techniken ausdrücklich (unbelegt, ob ein spezielles CoT-Format empfohlen wird).
- Verfügbare Größen: 270M (seit 2025-08-14), 1B, 4B, 12B, 27B. Als Referenzvariante dient hier **gemma-3-27b-it** (größtes instruction-tuned Modell); das Prompt-/Turn-Format ist über alle Größen hinweg identisch.

## Prompting-Stil
- **Mäßig präskriptiv, aber formatgebunden.** Das instruction-tuned Modell ist auf ein festes Turn-Format feinjustiert; die Control-Tokens sind „reserved in and specific to our tokenizer" und müssen exakt verwendet werden.
- Offizielles Chat-/Prompt-Format (Turn-Tokens):
  - `<start_of_turn>` leitet einen Turn ein, `<end_of_turn>` beendet ihn.
  - Rollen-Marker direkt nach `<start_of_turn>`: `user` bzw. `model`.
  - Aufbau:
    ```
    <start_of_turn>user
    [Inhalt]<end_of_turn>
    <start_of_turn>model
    ```
  - Der letzte Turn endet mit `<start_of_turn>model` **ohne** schließendes Tag, damit das Modell generiert.
- **System-Prompt-Handhabung:** Es gibt **keine** dedizierte `system`-Rolle / keinen System-Turn — „the `system` role or a system turn is not supported." System-/Persona-Anweisungen werden stattdessen **an den Anfang der ersten User-Nachricht** gesetzt (offizielles Beispiel: „Only reply like a pirate. What is the answer to life the universe and everything?"). Manche HuggingFace-Chat-Templates akzeptieren technisch ein `system`-Feld, das aber intern in die erste User-Nachricht eingefügt wird; die Google-Doku bleibt maßgeblich.
- **Instruktionsbefolgung:** gut genug, dass System-Level-Anweisungen direkt im User-Prompt zuverlässig interpretiert werden — eine separate System-Rolle ist deshalb nicht nötig.
- **Bekannte Eigenheit (BOS-Token):** Die Tokenizer-Pipeline fügt typischerweise ein `<bos>`-Token am Sequenzanfang hinzu; die offizielle Formatting-Seite zeigt `<bos>` in ihren Beispielen jedoch **nicht** explizit. Bei Roh-Inferenz (ohne `apply_chat_template`) darauf achten, das BOS-Token nicht doppelt einzufügen (unbelegt im Detail).

## Stärken & Schwächen (prompt-relevant)
- **Stärken:**
  - Multimodal: Verarbeitet Text **und** Bild als Eingabe, erzeugt Text als Ausgabe (Bilder werden auf 896×896 normalisiert und zu je 256 Tokens kodiert) — gilt für 4B/12B/27B.
  - Mehrsprachig: Unterstützung für über 140 Sprachen → Prompts müssen nicht zwingend auf Englisch sein.
  - Langer Kontext: 128K Tokens (4B/12B/27B), 32K Tokens bei 1B und 270M; der Output teilt sich dieses Limit mit dem Input.
  - Starke Leistung bei multilingualen, STEM- und multimodalen Benchmarks.
- **Schwächen:**
  - Kann subtile Nuancen, Sarkasmus oder bildhafte Sprache schlecht erfassen → für solche Fälle im Prompt explizit machen.
  - Kann faktisch falsche oder veraltete Aussagen erzeugen (Halluzinationen) → kritische Fakten extern verifizieren / im Prompt Quellenbindung verlangen.
  - Kein eingebautes Reasoning → bei komplexen Aufgaben CoT/Few-shot manuell vorgeben.
  - Trainingsdaten-Cutoff laut Model Card **August 2024** → zeitkritische Fakten im Prompt mitliefern.

## Output- & Format-Konventionen
- Reines Text-Output; das Modell schließt seinen Turn mit `<end_of_turn>` ab.
- Strukturierte Ausgabe (JSON, Tabellen, Markdown) zuverlässig über explizite Format-Anweisungen im User-Prompt erreichbar (allgemeine Instruktionsbefolgung; spezielles JSON-Schema-/Structured-Output-Feature in den primären Quellen nicht dokumentiert — unbelegt).
- Sampling-/Generierungsparameter: Zahlenwerte für Sampling nennt die offizielle Doku nicht (unbelegt) — die Gemma-3-Model-Card enthält keine Empfehlung für temperature, top_k oder top_p.

## Migrations-Hinweise
- **Lebenszyklus:** Google führt Gemma 3 auf der Gemma-Übersicht unter „Previous Gemma models", die Gemma-3-Prompt-Doku läuft in der Navigation als „Legacy"; Gemma 4 ist die aktuelle Generation. Eine Deprecation oder ein Support-Ende für Gemma 3 kündigt die Release-Seite nicht an — als Ziel bleibt Gemma 3 nutzbar, ist aber nicht mehr die aktuelle Generation.
- **Typische Änderungen, wenn man VON Gemma 3 wegmigriert:**
  - Zu Modellen mit dediziertem `system`-Feld (z. B. OpenAI/Anthropic): Die in die erste User-Nachricht eingebetteten System-Anweisungen wieder in ein echtes System-Prompt-Feld auslagern.
  - Gemma-spezifische Control-Tokens (`<start_of_turn>`, `<end_of_turn>`) entfernen — sie sind laut Google „reserved in and specific to our tokenizer"; andere Modelle nutzen eigene Templates.
  - Sampling-Werte nicht übernehmen: die Gemma-Werte sind Gemma-spezifisch; ob und welche Sampling-Parameter das Ziel akzeptiert, bestimmt der Ziel-Guide.
- **Typische Änderungen, wenn man ZU Gemma 3 migriert:**
  - Separate `system`-Messages auflösen und an den **Anfang der ersten User-Nachricht** verschieben (keine System-Rolle verfügbar).
  - Auf das exakte Turn-Token-Format umstellen bzw. `apply_chat_template()` der Transformers-Bibliothek nutzen, statt Tokens manuell zu setzen (vermeidet u. a. doppeltes `<bos>`).
  - Kein Thinking-Modus erwarten — explizites CoT-/Few-shot-Prompting für Reasoning-Aufgaben ergänzen.
  - Sampling: offizielle Zahlenwerte nicht publiziert (unbelegt) — keine Werte erzwingen.
  - Bild-Eingaben sind möglich (4B/12B/27B), aber 1B ist textonly; für 270M weist die Model Card keine Bild-Eingabe aus (unbelegt).

## Quellen
- https://ai.google.dev/gemma/docs/core/prompt-structure — offizielle Turn-Token-Struktur (`<start_of_turn>`/`<end_of_turn>`, `user`/`model`), fehlende `system`-Rolle, Einbettung der System-Anweisung in die erste User-Nachricht, Tokenizer-spezifische Control-Tokens.
- https://huggingface.co/google/gemma-3-27b-it — Model Card: Größen 1B/4B/12B/27B, 128K Kontext, multimodal (896×896 / 256 Tokens), 140+ Sprachen, kein dokumentierter Thinking-Modus, Schwächen (Sarkasmus/bildhafte Sprache, Faktenfehler), bfloat16/`device_map="auto"`.
- https://ai.google.dev/gemma/docs/core/model_card_3 — offizielle Model Card: Kontext 128K (4B/12B/27B) bzw. 32K (1B/270M), Output innerhalb desselben Limits, Größen inkl. 270M, 896×896-Bilder à 256 Tokens, 140+ Sprachen, Trainingsdaten-Cutoff August 2024, keine Sampling-Zahlenwerte.
- https://ai.google.dev/gemma/docs/releases — Release-Daten (Gemma 3 1B/4B/12B/27B am 2025-03-10, 270M am 2025-08-14, Gemma 4 ab 2026-03-31); keine Deprecation- oder Support-Ende-Ankündigung für Gemma 3.
- https://ai.google.dev/gemma/docs/core — Gemma-Übersicht (Gemma 4): Gemma 3 unter „Previous Gemma models", Navigation „Legacy Prompt and system instructions [Gemma 1, 2, and 3]".

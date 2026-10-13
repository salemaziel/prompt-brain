---
model: doubao-seed-2-1-lite
vendor: ByteDance
family: Doubao
aliases: [doubao-seed-2-1-lite-260915, doubao-seed-2.1-lite, seed-2.1-lite]
last_verified: 2026-10-13
status: current
---

# Doubao Seed 2.1 Lite

## Reasoning / Thinking
- Typ: **Deep Thinking per Default an**. `thinking.type` kennt plattformweit `enabled | disabled | auto`, doubao-seed-2-1-lite-260915 steht in der Support-Liste aber nur mit `enabled` (Default) und `disabled` — **kein `auto`**. Ein Request ohne `thinking`-Feld denkt.
- Tiefe über `reasoning_effort` (Chat API) bzw. `reasoning.effort` (Responses API). Alle sieben Stufen werden angenommen (`none | minimal | low | medium | high | xhigh | max`), **Default `high`**; `minimal` schaltet das Denken ab, `none` wird auf `minimal` gemappt, **`xhigh`/`max` landen still auf `high`**. Die 2.0-Modelle, die Lite ablöst, laufen dagegen mit Default `medium`.
- **Thinking Summary per Default aktiv**: zurück kommen `reasoning_content` (Zusammenfassung) und `encrypted_content` (verschlüsseltes Original). `reasoning_effort` wirkt nur auf den Roh-Gedankengang; abgerechnet werden die Roh-Tokens (`usage.completion_tokens_details.reasoning_tokens`). Die Summary erhöht laut Doku die Paket-Latenz — `timeout` hochsetzen.
- Tool-Calling: **`encrypted_content` unverändert zurückspielen** — es hat Vorrang vor `reasoning_content`; nur die Zusammenfassung zurückzugeben senkt laut Doku die Qualität in Multi-Turn-/Agent-Läufen, gar nichts zurückzugeben wirft keinen Fehler. Die Responses API erledigt das über `previous_response_id`.
- Max. Denkkette 256k Tokens; sie zählt gegen dasselbe Output-Budget wie die Antwort.

## Prompting-Stil
- Es gelten die Ark-"Prompt-Optimierungsempfehlungen" für Deep-Thinking-Modelle: **Ziel, Szenario und Adressat** ergänzen (Sprache/Werkzeug, Leserkreis, Anlass, Ziel), statt nur die Aufgabe zu nennen.
- **Zerlegung und Beispiele reduzieren oder vermeiden** — Schritt-für-Schritt-Vorgaben und Few-Shot engen laut Doku die Reasoning-Logik ein.
- **System-Prompts reduzieren**: alle Prompt-Informationen direkt in den User-Prompt (`role: user`) legen.
- Structured Output (附3 der Doku): im Prompt nicht "gib JSON aus" betonen und die Schema-Struktur nicht wiederholen, sondern den fachlichen Inhalt der Aufgabe beschreiben; das Format gehört in `response_format`.
- Bilder gehen als `image_url`-Content-Teil neben dem Text in dieselbe User-Nachricht (Beispiel auf der Ark-Seite der Schwester Turbo); Audio-Eingabeformat und Audio-spezifische Prompt-Regeln sind hier nicht geprüft (unbelegt).

## Stärken & Schwächen (prompt-relevant)
- **Omni-modal**: laut Release-Notiz und Modellseite native, einheitliche Verarbeitung von Text, Bild/Video und Audio (Input Text, Bild, Video, Audio → Output Text). In der Ark-Modellliste ist Lite das einzige 2.1-Modell in der Tabelle für Audio-Verständnis.
- **1M Kontext** (1024k Kontext / 1024k Input) und **30.000 RPM / 5.000.000 TPM** — 60× die RPM-Decke von 2.1 Pro und Turbo (je 500 RPM).
- Laut Ark-Modellseite gegenüber Doubao-Seed-2.0-lite/260428 verbessert in Coding, Agent, allgemeinem Reasoning, Langtext- und multimodalem Verständnis; genannte Szenarien: Bildung, Büro, Inhaltsanalyse, Entwicklungsassistenz. Konkrete Benchmarkwerte für Lite stehen auf den geprüften Seiten nicht (unbelegt).
- Fähigkeitstags: Deep Thinking, Textgenerierung, multimodales Verstehen, GUI-Aufgaben, Tool-Calling, Structured Output; Tool-Matrix komplett (Function Calling, Knowledge Base, MCP, Web-Search, Image Processing, Doubao-Assistant — außer Function Calling nur über die Responses API).
- Schwächen/Eigenheiten: **Default-Antwortlänge 4k** trotz 256k Decke; Structured Output ist **beta** und mit TPM-Garantiepaketen nicht nutzbar; kein `auto`-Thinking, keine echte Stufe über `high`. Kein Knowledge Cutoff publiziert (unbelegt).
- Verfügbarkeit: nur Volcengine Ark (China); die BytePlus-ModelArk-Liste (international) führt keine Lite-Variante.

## Output- & Format-Konventionen
- Model ID: `doubao-seed-2-1-lite-260915` (Ark: 推荐模型, 首推). Kontextfenster 1024k, max. Input 1024k, max. Antwort 256k bei **Default 4k**, max. Denkkette 256k. `doubao-seed-2.1-lite` erscheint nur als Abrechnungsname auf der Preisseite; als aufrufbare Model ID ist es nicht belegt (unbelegt).
- Ausgabelänge über `max_completion_tokens` (Chat API) bzw. `max_output_tokens` (Responses API) — deckt Denkkette **plus** Antwort ab.
- Structured Output: `json_schema` mit `strict: true` empfohlen; `json_object` verlangt den String `json` im Input; Feldreihenfolge folgt dem Schema; `$ref` nur lokal (`#`), `oneOf`/`allOf` ohne Semantikgarantie; nicht unterstützte Keywords werfen einen Fehler; `frequency_penalty`/`presence_penalty` nicht kombinieren.
- Betrieb: Streaming empfohlen, sonst `timeout` über 30 Minuten. APIs: Chat Completions, Responses, Batch (`/v3/batch/chat/completions`), Tokenization. Caching: implizit über Responses + Chat API, explizit über Responses API (Prefix-, Session-Cache).
- Preise Volcengine je Mio. Tokens, flat über 0–1024k: Online 0,80 ¥ Input / 12,00 ¥ Audio-Input / 0,16 ¥ Cache-Hit / 2,40 ¥ Audio-Cache-Hit / 2,70 ¥ Output, Cache-Speicher 0,017 ¥ je Mio. Tokens/Stunde. Low-Latency (Fast): 1,60 / 24,00 / 0,32 / 4,80 / 5,40 ¥. Low-Priority (Flex) und Batch: 0,40 / 6,00 / 0,16 / 2,40 / 1,35 ¥. Audio-Input kostet 15× Text-Input.

## Migrations-Hinweise
- **ZU doubao-seed-2.1-lite migrieren** (Ark nennt Lite als empfohlenes Ziel für doubao-seed-2-0-pro-260215 und doubao-seed-2-0-lite-260215; EOS 2026-11-24 bzw. 2026-10-22, jeweils 14:00 UTC+8; nicht migrierte Endpunkte werden laut Ark automatisch auf das empfohlene Modell umgestellt oder abgeschaltet): (1) `reasoning_effort` explizit setzen — die 2.0-Modelle standen per Default auf `medium`, Lite auf `high`; ohne Angabe steigen Denk-Tokens, Kosten und Latenz. (2) Längenannahmen anheben: 2.0 hatte 224k Input und 128k Antwort/Denkkette, Lite hat 1024k bzw. 256k; Chunking-Gerüste können entfallen. (3) Thinking Summary ist jetzt Default (bei 2.0-pro-260215/-lite-260215 nicht gelistet): `reasoning_content` ist nur noch eine Zusammenfassung, in Tool-Ketten `encrypted_content` durchreichen. (4) Preise neu rechnen — 2.0-lite war nach Input-Länge gestaffelt, Lite ist flat. (5) Prompt-Regeln wie bei allen Ark-Deep-Thinking-Modellen: Reasoning-Scaffolding und Few-Shot streichen, Ziel/Szenario ergänzen, Format in `response_format`.
- **Pro ↔ Lite**: identische Parameterfläche (dieselben `thinking.type`-, Effort- und Summary-Regeln, gleiche Längen bei Pro 260915) — Prompt-Rewrite meist unnötig; neu bewerten: Qualität bei hochkomplexen Aufgaben (Pro ist laut Release-Notiz dafür positioniert; ein direkter Pro-vs-Lite-Vergleich ist unbelegt), Preis (Output 2,70 ¥ statt 30,00 ¥), Durchsatz (30.000 statt 500 RPM) und Audio, das nur Lite annimmt.
- **VON doubao-seed-2.1-lite weg**: Audio-Inhalte nur übernehmen, wenn das Ziel Audio-Input dokumentiert (Pro und Turbo nehmen laut Ark-Modellseiten nur Text/Bild/Video). Bei Lite → Turbo den Kontext auf 256k herunterplanen. `thinking.type`, `reasoning_effort` und `encrypted_content` sind Ark-spezifisch ausgeprägt — Denksteuerung anhand des Ziel-Guides neu abbilden; gestrichenes CoT-Scaffolding, Beispiele und Rollentrennung wieder ergänzen, wenn das Ziel kein Always-On-Reasoner ist; Durchsatz gegen die Limits des Ziels prüfen.

## Quellen
- https://docs.volcengine.com/docs/ark/model-list?lang=zh — Ark-Modellliste (Stand 2026.10.09): `doubao-seed-2-1-lite-260915` unter 推荐模型 mit Fähigkeitstags, 1024k Kontext / 1024k Input / 256k Antwort bei Default 4k / 256k Denkkette, 30000 RPM / 5000000 TPM; Lite in der Audio-Verständnis-Tabelle; Tool- und Caching-Matrix; 2.0-Grenzen (224k Input, 128k Antwort) und 500 RPM von 2.1 Pro/Turbo als Vergleich.
- https://docs.volcengine.com/docs/ark/deep-thinking?lang=zh — Deep-Thinking-Seite (Stand 2026.10.09): `thinking.type`-Support (Lite nur `enabled`/`disabled`), Effort-Tabelle (2.1-Modelle Default `high`, 2.0-Modelle Default `medium`, Mapping `minimal`/`none`/`xhigh`/`max`), Thinking-Summary-Modellliste mit `reasoning_content`/`encrypted_content` und Rückgaberegeln, Latenz- und Timeout-Hinweise, Prompt-Optimierungsempfehlungen.
- https://docs.volcengine.com/docs/ark/structured-output-beta?lang=zh — Structured Output (beta, Stand 2026.09.22): `json_schema`/`json_object`, Schema-Einschränkungen, Beta- und TPM-Paket-Vorbehalt, Penalty-Warnung, Prompt-Empfehlungen (附3).
- https://docs.volcengine.com/docs/ark/model-pricing?lang=zh — Preisseite (Stand 2026.10.10): `doubao-seed-2.1-lite` in Online-, Low-Latency-, Low-Priority- und Batch-Tabellen inkl. Audio-Spalten; gestaffelte 2.0-lite-Preise als Kontrast.
- https://docs.volcengine.com/docs/ark/model-release-announcement?lang=zh — Release-Ankündigungen (Stand 2026.10.13): `doubao-seed-2-1-lite-260915` als 新发布 unter 202609, omni-modal (Text, Vision, Audio) mit 1M Kontext, verbesserte Coding-/Agent-Aufgaben; `doubao-seed-2-1-pro-260628` unter 202606 für hochkomplexe Coding-/Agent-Aufgaben positioniert.
- https://docs.volcengine.com/docs/ark/model-deprecation-notice?lang=zh — Abkündigungen (Stand 2026.10.09): 10. Batch, Lite als empfohlenes Ziel für doubao-seed-2-0-pro-260215 und -lite-260215, EOS-Termine und automatische Umstellung bzw. Abschaltung.
- https://ark.volcengine.com/region:cn-beijing/model/detail?Id=doubao-seed-2-1-lite — Ark-Modellseite: 260915 als 首推, Input Text/Bild/Video/Audio → Text, Preise inkl. Fast-Tarif, unterstützte APIs (inkl. Batch), Verbesserung gegenüber Doubao-Seed-2.0-lite/260428 und Einsatzszenarien.
- https://ark.volcengine.com/region:cn-beijing/model/detail?Id=doubao-seed-2-1-pro — Ark-Modellseite Pro: Input Text/Bild/Video → Text (kein Audio).
- https://ark.volcengine.com/region:cn-beijing/model/detail?Id=doubao-seed-2-1-turbo — Ark-Modellseite Turbo: Input Text/Bild/Video → Text (kein Audio); Request-Beispiel mit `image_url`- und `text`-Content-Teilen in einer User-Nachricht.
- https://docs.byteplus.com/en/docs/modelark/model-list — BytePlus-ModelArk-Modellliste (Stand 2026-10-13): aus der 2.1-Reihe nur `dola-seed-2-1-turbo-260628`, keine Lite-Variante.

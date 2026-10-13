---
model: grok-4.3
vendor: xAI
family: Grok
aliases: [grok4.3, grok-4.3-latest, grok43, grok-4-3, grok4-3]
last_verified: 2026-10-13
status: current
---

# Grok 4.3

## Reasoning / Thinking
- Typ: **abschaltbar** — grok-4.3 wird laut Retirement-Tabelle auch mit `reasoning_effort: none` betrieben (bei grok-4.5/4.6/4.7 ist Reasoning laut Doku nicht abschaltbar). Modellseite: unterstützt `none | low | medium | high | xhigh`, **Default `low`**. Die Retirement-Seite nennt nur vier Stufen (none/low/medium/high), die Reasoning-Seite führt grok-4.3 nicht und nennt `xhigh` erst ab grok-4.6 — `xhigh` auf 4.3 daher (unbelegt) als echte Tiefenstufe. Laut Retirement-Seite landen die non-reasoning-Slugs auf `none`, die reasoning-Slugs auf `low`, mit ausdrücklichem Hinweis, `medium`/`high` explizit zu setzen, wenn die Aufgabe tiefer denken soll.
- **`reasoning_effort` immer explizit setzen.** Default laut Modellseite und Best-Practices-Guide `low` („`grok-4.3` defaults to `"low"` and also accepts `"none"`"); der Guide verlangt, den Effort bei jedem Request zu setzen, damit kein Default das Ergebnis entscheidet.
- Klassenregeln für xAI-Reasoning-Modelle (Reasoning-Tokens werden mitabgerechnet und als `reasoning_tokens` in der Usage ausgewiesen; `presence_penalty`/`frequency_penalty`/`stop` führen zu einem Fehler) dürften greifen, sind für grok-4.3 aber nicht belegt (unbelegt) — die Reasoning-Seite führt das Modell nicht auf. Defensiv behandeln: diese Parameter weglassen.

## Prompting-Stil
- xAI beschreibt das Modell als „Fast, reliable model with strong tool calling and instruction following capabilities" — also **direktiv und schema-getrieben** prompten: klare Anweisungen, saubere Tool-/Function-Definitionen, kein defensives Nacherklären der Tools in Prosa.
- Weil der Effort bis auf `none` fallen kann und der Default nur `low` ist, trägt der Prompt mehr Last: Ziel, Output-Form und Tool-Policy explizit ausformulieren, statt das Modell sich den Weg selbst planen zu lassen.
- Format über **Structured Outputs** erzwingen statt über Freitext-Konventionen (Structured Outputs sind für grok-4.3 ausdrücklich belegt) — nicht auf `stop`-Sequenzen bauen, die für xAI-Reasoning-Modelle generell ausgeschlossen sind (für grok-4.3 selbst unbelegt).
- Positionierung laut offiziellem Listing: für Code und Chat empfiehlt xAI grok-4.7, nicht 4.3. grok-4.3 ist der günstige Long-Context-Durchsatz-Arbeiter, nicht die Reasoning-Spitze.
- Eine eigene Developer-/Prompting-Seite für grok-4.3 existiert nicht; jede darüber hinausgehende Stilaussage ist unbelegt.

## Stärken & Schwächen (prompt-relevant)
- Stärken: **1M Tokens Kontext** (doppelt so viel wie grok-4.6/4.7 mit 500k); günstiger als grok-4.6/4.7 ($1.25/$2.50 vs. $2.00/$6.00 pro 1M — Input −37,5 %, Output −58 %); zusätzliche **EU-Region** (eu-west-1 neben us-east-1/us-west-2) für Data-Residency-Anforderungen; weitere 20 % Rabatt über die Batch API; xAIs eigenes Migrationsziel für die abgekündigten Grok-4-Fast- und Legacy-Text-Slugs (`grok-4-fast-*`, `grok-4-1-fast-*`, `grok-3`) inkl. `grok-4-0709` (Ausnahme: `grok-code-fast-1` → `grok-build-0.1`); dokumentierter Effort-Pfad bis hinunter zu `none`, den grok-4.5/4.6/4.7 nicht haben.
- Schwächen/Eigenheiten: deutlich niedrigere Durchsatzdecke als das Flaggschiff (37 Requests/s, 10M Tokens/min vs. 150 rps / 50M tpm); **Preisklippe bei 200k Prompt-Tokens** — ab da gilt der doppelte Satz für ALLE Tokens des Requests; nicht das für Code/Chat empfohlene Modell; kein publizierter Knowledge Cutoff, kein publiziertes Output-Limit, keine offiziellen Benchmark-Angaben.

## Output- & Format-Konventionen
- 1.000.000 Tokens Kontextfenster; Input Text + Bild, Output nur Text. Max. Output-Tokens: nicht publiziert (unbelegt). Knowledge Cutoff: nicht publiziert (unbelegt).
- Function Calling: ja; Structured Outputs: ja; Reasoning: ja.
- Preise pro 1M Tokens: Input $1.25 (<200k Prompt) / $2.50 (≥200k), Cached Input $0.20 / $0.40, Output $2.50 / $5.00; Batch API zusätzlich −20 %. Rate Limits: 37 Requests/s, 10M Tokens/min; Regionen us-east-1, eu-west-1, us-west-2.
- Dokumentierter Alias `grok-4.3-latest` neben der blanken id `grok-4.3`.

## Migrations-Hinweise
- **VON grok-4.3 weg** (zu grok-4.7, von xAI für Code und Chat empfohlen, oder zu grok-4.6): `none` fällt weg — Reasoning ist dort nicht abschaltbar, jeder Zero-Thinking-Schnellpfad muss auf `low` re-tuned und neu kalkuliert werden; der Default springt von `low` (4.3) auf `high` (4.5/4.6/4.7) — ohne explizites `reasoning_effort` steigen Latenz und Reasoning-Kosten; `xhigh` ist ab grok-4.6 laut Reasoning-Seite echte Denktiefe; Kontext schrumpft von 1M auf 500k; die EU-Region entfällt (grok-4.6/4.7: us-east-1/us-west-2/us-central-1); die Batch API (bei 4.3 mit 20 % Rabatt) wird von grok-4.6 und grok-4.7 nicht bedient — Batch-Jobs umplanen; `prompt_cache_key` bzw. `x-grok-conv-id` für Cache-Hit-Routing ergänzen; Preis steigt auf $2.00/$6.00. Bei grok-4.7 kommt `reasoning.encrypted_content` auf der Responses API bei jeder Antwort zurück — Reasoning-Items unverändert zurückschicken.
- **ZU grok-4.3 migrieren** (von grok-4): dies ist xAIs **eigenes vorgeschriebenes Ziel** — `grok-4-0709` wurde am 15. Mai 2026, 12:00 PT abgeschaltet und wird seitdem automatisch auf `grok-4.3` mit `low` Effort geroutet; eine unangetastete grok-4-Integration läuft also still auf flacherem Reasoning. Konkret: (1) `reasoning_effort` explizit setzen — grok-4 kannte den Parameter nicht und dachte immer tief (unbelegt — die grok-4-Modellseiten sind offline); hing die Qualität daran, `medium`/`high` setzen statt das geroutete `low` zu akzeptieren. (2) `none` ist neu verfügbar — latenzkritische Extraktions-/Klassifikations-Prompts auf einen Single-Pass-Call umstellen. (3) Kontext wächst von 256k (laut Grok-4-Ankündigung) auf 1M, aber die 200k-Preisklippe verdoppelt Input **und** Output des ganzen Requests — Chunking-Strategie wiegt schwerer als reine Kapazität. (4) Kosten fallen deutlich, Durchsatz ist auf 37 rps / 10M tpm gedeckelt — Concurrency-Annahmen neu austarieren. (5) eu-west-1 wird verfügbar. (6) `presence_penalty`/`frequency_penalty`/`stop` weiterhin weglassen, Formatkontrolle über Structured Outputs.

## Quellen
- https://docs.x.ai/developers/models/grok-4.3 — Modellseite: id `grok-4.3` + Alias `grok-4.3-latest`, Blurb „Fast, reliable model with strong tool calling and instruction following capabilities", 1M Kontext, Text+Bild→Text, Function Calling/Structured Outputs/Reasoning ja, Efforts `none`/`low`/`medium`/`high`/`xhigh` mit Default `low`, volle Preistabelle inkl. Cached Input und 20 % Batch-Rabatt, 37 rps / 10M tpm, Regionen us-east-1/eu-west-1/us-west-2; ohne Prompting-Guidance, ohne Cutoff, ohne Output-Limit.
- https://docs.x.ai/developers/migration/may-15-retirement — Retirement-Tabelle: `grok-4-0709`, `grok-4-fast-reasoning`, `grok-4-1-fast-reasoning` → `grok-4.3` mit `low`; `grok-3` und die non-reasoning-Slugs → `grok-4.3` mit `none`; Abschaltung 15. Mai 2026 12:00 PT; „4 reasoning effort levels (none, low, medium, and high)"; Hinweis auf explizites `medium`/`high`; $1.25/$2.50 pro 1M.
- https://docs.x.ai/developers/model-capabilities/text/best-practices — Effort bei jedem Request explizit setzen; „`grok-4.3` defaults to `"low"` and also accepts `"none"`".
- https://docs.x.ai/developers/model-capabilities/text/reasoning — Klassenregeln für Reasoning-Modelle (`reasoning_tokens`-Abrechnung; `presencePenalty`/`frequencyPenalty`/`stop` → Fehler); enumeriert nur `grok-4.7`, `grok-4.6` (je `low`/`medium`/`high` Default/`xhigh`), `grok-4.5` und `grok-4.20-multi-agent`, **nicht** grok-4.3; `xhigh` „available on `grok-4.6` and later" — daher sind die Klassenregeln, die `xhigh`-Semantik und die dortige Aussage „Reasoning cannot be disabled" nicht auf grok-4.3 übertragbar.
- https://docs.x.ai/developers/models — Alias-Konvention (`<modelname>`, `<modelname>-latest`, `<modelname>-<date>`) und aktuelles Roster mit grok-4.3 (1M) neben grok-4.7/4.6/4.5 (500k), aber ohne grok-4/grok-4-0709; für Code und Chat wird grok-4.7 empfohlen; Cutoff nur für grok-4.7 gelistet.
- https://docs.x.ai/developers/models/grok-4.6 — Vergleichswerte für die Migrationsrichtung: 500k Kontext, $2.00/$6.00 pro 1M (≥200k: $4.00/$12.00), 150 rps / 50M tpm, Regionen us-east-1/us-west-2/us-central-1 (kein eu-west-1), Batch API „Not supported".
- https://docs.x.ai/developers/models/grok-4.7 — Vergleichswerte des empfohlenen Flaggschiffs: 500k Kontext, gleiche Preise wie grok-4.6, Efforts `low`–`xhigh` mit Default `high`, Batch API „Not supported", Regionen us-east-1/us-west-2/us-central-1.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching/maximizing-cache-hits — Cache-Hit-Routing über `prompt_cache_key` (Responses API) bzw. Header `x-grok-conv-id` (Chat Completions).
- https://x.ai/news/grok-4 — Grok-4-Ankündigung: „a 256,000 context window" für die Grok-4-API.

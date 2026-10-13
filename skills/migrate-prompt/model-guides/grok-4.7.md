---
model: grok-4.7
vendor: xAI
family: Grok
aliases: [grok, grok4.7, grok-4.7-latest, grok47, grok-4-7, grok4-7]
last_verified: 2026-10-13
status: current
---

# Grok 4.7

## Reasoning / Thinking
- Typ: **immer an**. Die Reasoning-Seite führt grok-4.7 mit „Reasoning cannot be disabled" — es gibt kein `none` (anders als bei grok-4.3).
- Leiter: `reasoning.effort` (Responses API) bzw. `reasoning_effort` = `low | medium | high | xhigh`, **Default `high`**. `xhigh` steuert hier echte Denktiefe („available on `grok-4.6` and later") — „Maximum reasoning depth, with correspondingly higher latency".
- Einsatz laut Doku: `low` für latenzsensitive Agentic-Loops und einfaches Tool-Calling, `medium` für Datenanalyse und Long-Context-Reasoning, `high` für schwere Mathe-/Multi-Step-Probleme, `xhigh` für die härtesten Fälle. Der Best-Practices-Guide verlangt, den Effort **bei jedem Request explizit** zu setzen, statt einen Default entscheiden zu lassen.
- **Lesbare Reasoning-Summaries** dokumentiert xAI ausschließlich für grok-4.7 (Streaming-Deltas `response.reasoning_summary_text.delta`).
- **Verschlüsseltes Reasoning kommt immer zurück:** Auf der Responses API liefert grok-4.7 `reasoning.encrypted_content` bei jeder Antwort, auch ohne `include`. Die Reasoning-Items müssen unverändert im `input` des nächsten Requests zurückgeschickt werden, sonst verliert das Modell seinen Denkweg und der Prompt-Cache bricht. Chat Completions hat dafür kein Feld.
- Reasoning-Tokens werden mitabgerechnet (`reasoning_tokens` in `usage`). `presencePenalty`, `frequencyPenalty` und `stop` liefern einen Fehler.

## Prompting-Stil
- Positionierung: „frontier model for coding, agentic tasks, and knowledge work"; xAI empfiehlt grok-4.7 für Code **und** Chat („It is the most capable model we've built").
- Best-Practices-Guide: Aufgabe, Constraints und Output-Format **direkt benennen** („state the task, constraints, and output format directly"); einen für ein anderes Modell getunten Prompt gezielt für Grok nachtunen.
- **Responses API verwenden** — Chat Completions gilt laut Guide als „deprecated" und verwirft über Turns hinweg das verschlüsselte Reasoning.
- Sampling: `temperature` 0.7 und `top_p` 0.95 explizit setzen und kaum davon abweichen („Grok models don't respond well to other sampling settings").
- Caching: `prompt_cache_key` (Responses API) bzw. `x-grok-conv-id` (Chat Completions) pro Konversation setzen; statische Inhalte (System-Prompt, Few-Shots, Referenzdokumente) nach vorn, die Konversation nur anhängen statt umzuordnen. Für lange Agent-Loops zusätzlich Context Compaction.
- Laut Ankündigung arbeitet das Modell länger an schweren Aufgaben und prüft seine Arbeit sorgfältiger — Planung und Selbstprüfung dürfen dem Modell überlassen werden. Eine modellspezifische Prompting-Anleitung über den Best-Practices-Guide hinaus gibt es nicht; weitergehende Stilregeln sind (unbelegt).

## Stärken & Schwächen (prompt-relevant)
- Stärken: laut Ankündigung neues, größeres Basismodell als grok-4.6 mit längerem RL-Lauf auf Aufgaben über viele Stunden; besser im Verifizieren eigener Arbeit und im Umgang mit langem Kontext; bessere Dokument- und Präsentationserstellung; gleicher Preis und gleiche Geschwindigkeit wie grok-4.6; volle Flaggschiff-Durchsatzdecke (150 rps / 50M tpm).
- Vom Hersteller genannte Benchmarks (nicht unabhängig verifiziert, `xhigh`): CursorBench 4.0 46,3 %, Terminal-Bench 4.0 37,6 %, Harvey Legal Agent Benchmark 19,6 %; DeepSWE v1.1 71,0 % (bei `high`).
- Schwächen/Eigenheiten: Reasoning nicht abschaltbar (feste Latenz-/Kostenuntergrenze); **Preisklippe bei 200k Prompt-Tokens** — ab da gilt der doppelte Satz für alle Tokens des Requests; **Batch API „Not supported"**; keine EU-Region.

## Output- & Format-Konventionen
- 500.000 Tokens Kontext; Input Text + Bild, Output nur Text; „No text output limit". Knowledge Cutoff Mai 2026.
- `max_output_tokens` begrenzt nur die sichtbare Antwort (Reasoning zählt nicht), Default 128.000; Responses mit `status: "incomplete"` als abgeschnitten behandeln. Länge nicht über `stop` steuern.
- Function Calling, Structured Outputs und Reasoning: jeweils ja; server-seitige Tools Web Search, X Search und Code Execution. Echtzeitwissen nur mit aktivierten Such-Tools.
- Preise pro 1M Tokens: Input $2.00 (<200k) / $4.00 (≥200k), Cached Input $0.50 / $1.00, Output $6.00 / $12.00. Rate Limits 150 rps / 50M tpm. Regionen us-east-1, us-west-2, us-central-1; zusätzlich US-Regional-Endpoint `https://us.api.x.ai/v1` (+10 % Tokenpreis).
- „Grok 4.7 Fast" (gleiches Modell, doppelter Preis) gibt es nur in Cursor und Grok Build, **nicht** auf der öffentlichen xAI-API.
- Die Modellseite listet keine Aliase; `grok-4.7-latest` ist nur Repo-Komfort nach xAIs `<modelname>-latest`-Konvention, die blanke ID `grok-4.7` ist die belegte Adresse.

## Migrations-Hinweise
- **VON grok-4.6 zu grok-4.7**: Preis, Kontext (500k), Effort-Leiter und Default (`high`) sind identisch — Effort-Werte können übernommen werden. Neu: Reasoning-Summaries beim Streaming und auf der Responses API immer mitgeliefertes `reasoning.encrypted_content`; Clients, die History selbst führen, müssen die Reasoning-Items unverändert zurückspielen. Wissensstand ist neu dokumentiert (Mai 2026).
- **VON grok-4.3 / grok-4.5 zu grok-4.7**: (1) `none` existiert nicht — Zero-Thinking-Pfade auf `low` heben und Latenz/Kosten neu rechnen. (2) Default springt bei grok-4.3 von `low` auf `high`; ohne explizites `reasoning_effort` steigen Kosten und Latenz. (3) Von grok-4.3 kommend: Kontext schrumpft von 1M auf 500k, eu-west-1 und der 20-%-Batch-Rabatt entfallen, Preis steigt auf $2.00/$6.00. (4) Von grok-4.5 kommend: `xhigh` wird jetzt real ausgeführt — Kosten neu messen.
- **ZU grok-4.7 allgemein**: `presence_penalty`/`frequency_penalty`/`stop` entfernen, Formatkontrolle über Structured Outputs; auf die Responses API umstellen; `temperature` 0.7 / `top_p` 0.95 setzen; `prompt_cache_key` ergänzen; Prompts unter der 200k-Klippe halten.
- **VON grok-4.7 weg**: Pipelines, die Summaries oder das automatisch gelieferte verschlüsselte Reasoning auswerten, umbauen; bei grok-4.5 wird `xhigh` laut Reasoning-Seite still als `high` behandelt.

## Quellen
- https://docs.x.ai/developers/models/grok-4.7 — Modellseite: id `grok-4.7` ohne Aliase, 500k Kontext, Text+Bild→Text, Function Calling/Structured Outputs/Reasoning ja, Efforts `low`/`medium`/`high`/`xhigh` mit Default `high`, Batch API „Not supported", Preistabelle mit 200k-Staffel, 150 rps / 50M tpm, Regionen us-east-1/us-west-2/us-central-1.
- https://docs.x.ai/developers/grok-4-7 — Entwicklerseite: Knowledge Cutoff Mai 2026, „No text output limit", Tools, `prompt_cache_key`-Empfehlung, Context Compaction, immer zurückgegebenes `reasoning.encrypted_content`, Fast-Variante nur in Cursor/Grok Build, US-Endpoint +10 %, Default-Modell von Grok Build.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — „Reasoning cannot be disabled", Effort-Tabelle und Einsatzempfehlungen, `xhigh` ab grok-4.6, Summaries nur für grok-4.7, „Always returned for grok-4.7", Fehler bei `presencePenalty`/`frequencyPenalty`/`stop`, Abrechnung der Reasoning-Tokens.
- https://docs.x.ai/developers/model-capabilities/text/best-practices — Responses API statt (deprecated) Chat Completions, Reasoning-Items zurückspielen, Effort explizit setzen, `temperature` 0.7 / `top_p` 0.95, `max_output_tokens`-Default 128.000, Task/Constraints/Format direkt benennen, Caching-Regeln.
- https://docs.x.ai/developers/models — Empfehlung „Code: Grok 4.7 / Chat: Grok 4.7", Cutoff Mai 2026, Preistabelle, Alias-Konvention, Echtzeitwissen nur mit Such-Tools.
- https://docs.x.ai/developers/release-notes — Eintrag „Grok 4.7" (September): Verfügbarkeit als `grok-4.7`, Preise, Effort-Leiter, immer zurückgegebenes verschlüsseltes Reasoning, US-Endpoint, Fast-Variante.
- https://x.ai/news/grok-4-7 — Ankündigung vom 21.09.2026: größeres Basismodell, längerer RL-Lauf, bessere Selbstprüfung und Long-Context-Handhabung, gleicher Preis/Speed wie grok-4.6, Herstellerbenchmarks.
- https://docs.x.ai/developers/advanced-api-usage/regions — US-Endpoint `https://us.api.x.ai/v1` bedient grok-4.7 und grok-4.6, Tokenpreis +10 %.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching/maximizing-cache-hits — `x-grok-conv-id` bzw. `prompt_cache_key` routen eine Konversation auf denselben Server.
- https://docs.x.ai/developers/advanced-api-usage/context-compaction — Context Compaction für lange Agent-Loops.

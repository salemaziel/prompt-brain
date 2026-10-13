---
model: grok-4.6
vendor: xAI
family: Grok
aliases: [grok4.6, grok-4.6-latest, grok46, grok-4-6, grok4-6]
last_verified: 2026-10-13
status: current
---

# Grok 4.6

## Reasoning / Thinking
- Typ: **immer an**. Für `grok-4.6` (wie für `grok-4.5` und `grok-4.7`) gilt laut Doku „Reasoning cannot be disabled" — es gibt kein `none`. Tiefe ausschließlich über `reasoning_effort` (Chat Completions) bzw. `reasoning.effort` (Responses API): `low | medium | high | xhigh`, Default `high`.
- Einsatz laut Doku: `low` für latenzsensitive Agentic-Loops und einfaches Tool-Calling, `medium` für komplexe Datenanalyse und Long-Context-Reasoning, `high` für sehr schwere Probleme/Mathe/Multi-Step-Logik, `xhigh` für die härtesten Fälle, wenn Qualität vor Antwortzeit geht.
- `xhigh` steuert laut Reasoning-Seite echte Denktiefe auf „`grok-4.6` and later" (also auch `grok-4.7`); `grok-4.20-multi-agent` regelt damit die Agentenzahl. Auf `grok-4.5` wird `xhigh` laut Reasoning-Seite **still als `high` behandelt** — kein Fehler, nur weniger Denkzeit.
- Reasoning-Tokens werden mitberechnet und erscheinen als `reasoning_tokens` in `usage`. Lesbare Reasoning-Summaries dokumentiert xAI nur noch für `grok-4.7`; für grok-4.6 (unbelegt). Belegt ist der verschlüsselte Carry-over über `include: ["reasoning.encrypted_content"]` (Responses API); eine Rückgabe der rohen Chain-of-Thought ist nirgends dokumentiert (unbelegt).
- `presence_penalty`, `frequency_penalty` und `stop` sind mit Reasoning-Modellen **nicht kombinierbar** — Requests damit liefern einen Fehler (Doku schreibt sie als `presencePenalty`/`frequencyPenalty`).

## Prompting-Stil
- Positionierung: „frontier model for coding, agentic tasks, and knowledge work"; xAI empfiehlt für Code und Chat inzwischen `grok-4.7`. Trainiert auf agentischen RL-Tasks (Knowledge Work, allgemeines Coding, Kernel-Optimierung, Web-Entwicklung, CAD).
- Auf **Zielebene** prompten statt Schritt für Schritt: laut Ankündigung stark darin, eine grobe Produktidee in eine erste lauffähige Version zu überführen (unbekannte Domäne recherchieren, App strukturieren, Kernfeatures bauen) und über lange Task-Ketten „more self-testing and verification" zu betreiben — Planung und Selbstprüfung also dem Modell überlassen.
- **Caching ist die zentrale operative Prompt-Regel**: `prompt_cache_key` (Responses API) oder Header `x-grok-conv-id` (Chat Completions) setzen, damit Requests einer Konversation auf denselben Server routen — Cache-Einträge liegen pro Server. Prompt-Präfix daher stabil halten.
- Für lange Agent-Loops zusätzlich Context Compaction einplanen; server-seitige Such-Tools (Web Search, X Search) müssen explizit aktiviert werden, sonst hat das Modell kein Echtzeitwissen.
- Über diese dokumentierten Punkte hinaus veröffentlicht xAI keinen Prompt-Engineering-Leitfaden für dieses Modell — weitergehende Stilregeln sind (unbelegt).

## Stärken & Schwächen (prompt-relevant)
- Stärken: agentisches Coding und Knowledge Work in der Spitzengruppe; Artificial Analysis Intelligence Index 61 (Fable 5 Max führt die Tabelle der Ankündigung mit 62 an); bester gelisteter Wert auf Harvey LAB (15,8 %); Recherche in unbekannten Domänen; sehr hoher Durchsatz (150 rps / 50 Mio. Tokens pro Minute).
- Schwächen/Eigenheiten: Reasoning nicht abschaltbar → feste Latenz- und Kostenuntergrenze; auf den Coding-Benchmarks der Ankündigung führen andere Modelle (DeepSWE v1.1 65,9 % vs. GPT-5.6 Sol Max 73 %; FrontierCode v1.1 61,3 % vs. Fable 5 Max 63,6 %; CursorBench v3.2 69,9 % vs. Fable 5 Max 70,5 %).
- **200k-Preisklippe**: sobald der Prompt 200k Tokens erreicht, wird der gesamte Request (Input *und* Output) zum doppelten Satz abgerechnet — Kontext bewusst unter der Grenze halten.
- 500k Kontext ist nur die Hälfte von `grok-4.3` (1M); Regionen `us-east-1`, `us-west-2` und `us-central-1` — keine EU-Region (die hat `grok-4.3` mit `eu-west-1`); zusätzlich US-Regional-Endpoint `https://us.api.x.ai/v1` (+10 % Tokenpreis).

## Output- & Format-Konventionen
- Kontextfenster 500.000 Tokens; Input Text + Bild, Output nur Text. Wissensstand: nicht mehr publiziert (unbelegt). Function Calling, Structured Outputs und Reasoning: jeweils ja.
- Batch API: „Not supported" laut Modellseite — Batch-Jobs müssen über Echtzeit-Requests laufen.
- Output-Limit: die Release Notes nennen ausdrücklich „no text output limit"; eine Max-Output-Zahl wird nicht publiziert. Länge daher über Max-Tokens begrenzen — `stop`-Sequenzen sind hier nicht erlaubt.
- Preise pro 1M Tokens: Input $2,00 (<200k) / $4,00 (≥200k), Cached Input $0,50 / $1,00, Output $6,00 / $12,00. Die Ankündigung nennt zusätzlich eine „fast variant" zum doppelten Preis.
- Alias-Konvention: `<modelname>` = neueste stabile Version, `<modelname>-latest` = neueste Version, `<modelname>-<date>` = fixierte Release. Für Grok 4.6 ist weder eine datierte ID noch ein `-latest`-Alias publiziert; die blanke ID `grok-4.6` ist die einzige belegte Adresse. `grok-4.6-latest` steht im Registry nur als Komfort-Alias nach xAIs `<modelname>-latest`-Konvention.

## Migrations-Hinweise
- **VON Grok 4.6 weg**: Ziel `grok-4.7` (von xAI für Code und Chat empfohlen) hat identischen Preis, Kontext und dieselbe Effort-Leiter mit Default `high`; dort kommt `reasoning.encrypted_content` auf der Responses API bei jeder Antwort zurück — Reasoning-Items unverändert im nächsten `input` zurückschicken. Ziel `grok-4.5`: `xhigh` entfernen, es wird laut Reasoning-Seite kommentarlos zu `high` degradiert. Ziel `grok-4.3` bringt 1M Kontext, ein `none`-Effort-Level (Default dort `low`), `eu-west-1` und Batch-Rabatt, verlässt aber die Frontier-Coding-Stufe. In allen Fällen `prompt_cache_key`/`x-grok-conv-id`-Annahmen prüfen.
- **ZU Grok 4.6 migrieren** (typisch von `grok-4`, das seit 15.05.2026 12:00 PT abgekündigt ist und auf `grok-4.3` mit `low` Effort umgeleitet wird): (1) `reasoning_effort` explizit setzen statt Denktiefe indirekt über max_tokens zu budgetieren — Default ist `high`, `low` für Tool-Loops, `xhigh` für Maximaltiefe. (2) Lange Prompts um die 200k-Preisklippe herum strukturieren, obwohl 500k Kontext verfügbar sind. (3) `prompt_cache_key` bzw. `x-grok-conv-id` sowie Context Compaction für lange Agent-Läufe ergänzen — neue operative Fläche. (4) Verschlüsseltes Reasoning lässt sich per `include` über Turns mitführen. (5) `presence_penalty`/`frequency_penalty`/`stop` aus den Requests halten. (6) Web/X-Search sind server-seitige Tools, die weiterhin explizit angefordert werden müssen. (7) Über-präskriptive Schrittlisten abbauen; stattdessen Ziel + Constraints, das Modell verifiziert selbst. (8) Batch-Jobs umplanen — die Batch API bedient grok-4.6 nicht.

## Quellen
- https://docs.x.ai/developers/models/grok-4.6 — Modell-Spec: ID `grok-4.6` ohne Aliase, Blurb „frontier model for coding, agentic tasks, and knowledge work", 500k Kontext, Text+Bild→Text, Function Calling/Structured Outputs/Reasoning, Efforts `low`–`xhigh` mit Default `high`, Batch API „Not supported", vollständige Preistabelle inkl. 200k-Klippe, 150 rps / 50M tpm, Regionen us-east-1, us-west-2 und us-central-1.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — Reasoning-Vertrag: nicht abschaltbar, Effort-Tabelle für grok-4.7/4.6/4.5/4.20-multi-agent, `xhigh` „available on `grok-4.6` and later" und auf grok-4.5 still zu `high` degradiert, Summaries nur für grok-4.7, `include: ["reasoning.encrypted_content"]`, `reasoning_tokens`, nicht unterstützte Sampling-Parameter (`presencePenalty`/`frequencyPenalty`/`stop`).
- https://docs.x.ai/developers/release-notes — Eintrag „Grok 4.6" (August): 500k Kontext, „no text output limit", Preise, Effort low/medium/high (Default)/xhigh.
- https://docs.x.ai/developers/models — Empfehlung „Code: Grok 4.7 / Chat: Grok 4.7", Cutoff nur für Grok 4.7 genannt, Alias-Konvention (`-latest`, `-<date>`), Echtzeitwissen nur mit aktivierten Such-Tools.
- https://docs.x.ai/developers/advanced-api-usage/regions — US-Endpoint `https://us.api.x.ai/v1` bedient grok-4.7 und grok-4.6, Tokenpreis +10 %.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching/maximizing-cache-hits — `x-grok-conv-id` (Chat Completions) bzw. `prompt_cache_key` (Responses API) routen eine Konversation auf denselben Server; Cache-Einträge liegen pro Server.
- https://docs.x.ai/developers/advanced-api-usage/context-compaction — Context Compaction für lange Agent-Loops.
- https://docs.x.ai/developers/models/grok-4.7 — Vergleichsmodell: identischer Preis, 500k Kontext, gleiche Effort-Leiter mit Default `high`.
- https://docs.x.ai/developers/models/grok-4.3 — Vergleichsmodell: `grok-4.3` mit 1M Kontext, Region `eu-west-1`, Batch API unterstützt, Default-Effort `low`.
- https://x.ai/news/grok-4-6 — Ankündigung (12.08.2026): agentisches RL-Training (Knowledge Work, Coding, Kernel-Optimierung, Web, CAD), „more self-testing and verification" über lange Task-Ketten, Produktidee→erste Version, Intelligence Index 61 (Fable 5 Max 62), Harvey LAB 15,8 % (bester Wert), DeepSWE/FrontierCode/CursorBench-Vergleich, $2/$6 pro 1M Tokens plus „fast variant" zum doppelten Preis.
- https://docs.x.ai/developers/migration/may-15-retirement — Retirement-Tabelle: `grok-4-0709` am 15.05.2026 12:00 PT abgekündigt, Routing auf `grok-4.3` mit `low` Effort; `none`-Effort für andere Umleitungsziele belegt.

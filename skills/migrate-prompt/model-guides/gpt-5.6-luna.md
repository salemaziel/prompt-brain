---
model: gpt-5.6-luna
vendor: OpenAI
family: GPT
aliases: [gpt5.6-luna, 5.6-luna]
last_verified: 2026-10-13
status: current
---

# GPT-5.6 Luna

## Reasoning / Thinking
- `reasoning.effort`: `none | low | medium (Default) | high | xhigh | max` — dieselbe Leiter wie `gpt-5.6-sol` und `gpt-5.6-terra`. Familien-Leitlinie: `medium` als ausgewogener Start, `low` für latenzkritische Workloads; wer `none` nutzt, behält es als Latenz-Baseline und testet zusätzlich `low`, wenn Reasoning oder Tool-Nutzung hilft.
- `reasoning.mode` = `standard` (Default) | `pro`, unabhängig vom Effort; „Pro mode works with any GPT-5.6 model“ (nur Responses API). Die Doku rät für „routine, latency-sensitive, or high-volume work“ ausdrücklich zu `standard` — passt zum Einsatzprofil von Luna.
- `reasoning.context` = `auto | current_turn | all_turns`, Default bei GPT-5.6-Modellen `all_turns`. Reasoning-Items sind zwischen `gpt-5.6-sol`, `gpt-5.6-terra` und `gpt-5.6-luna` wiederverwendbar, nicht aber über Familiengrenzen (z. B. GPT-5.5).
- `configuration_update` (Effort-Wechsel mitten in der Konversation) ist nur für die GPT-6-Familie dokumentiert, nicht für GPT-5.6.

## Prompting-Stil
- Eigene Luna-Guidance gibt es nicht; die GPT-5.6-Prompt-Regeln gelten laut OpenAI für die Familie (Familienübertragung, die Messwerte stammen aus internen Coding-Agent-Evals, nicht aus Luna-spezifischen Tests).
- **Schlanke Prompts**: jede Anweisung einmal, redundante Beispiele und Tool-Beschreibungen kürzen, nur relevante Tools exponieren. OpenAI berichtet ~10–15 % bessere Eval-Scores bei 41–66 % weniger Tokens und nennt die Spannen „directional“.
- Länge: GPT-5.6 ist von Haus aus knapper als GPT-5.5; pauschales „Be concise“ neu prüfen. Default-Detailgrad über `text.verbosity`, im Prompt festlegen, was eine kurze Antwort enthalten muss („Keep all required facts, decisions, caveats, and next steps.“).
- Autonomie- und Freigabegrenzen an einer Stelle festlegen: sichere lokale Aktionen namentlich erlauben, Bestätigung verlangen für „external writes, destructive actions, purchases, or a material expansion of scope“.

## Stärken & Schwächen (prompt-relevant)
- Positionierung: „designed for cost-sensitive, high-volume workloads“ und „roughly corresponds to the nano model tier used in earlier GPT-5 families“; im Reasoning-Guide die Wahl „for the lowest cost and latency“.
- Familienstärken: GPT-5.6 erreicht laut Doku Flaggschiff-Niveau mit weniger Output-Tokens und leitet Nutzerziel und Arbeitsumfang besser aus dem Kontext ab. Wie stark das auf der Nano-Stufe greift, ist nicht belegt (unbelegt).
- Volles Responses-Tool-Set (`web_search`, `file_search`, `image_generation`, `code_interpreter`, `hosted_shell`, `apply_patch`, `skills`, `computer_use`, `mcp`, `tool_search`); Bilder in Originalauflösung über `original`/`auto` Detail.
- Schwächen: kleinste Stufe der Familie — bei gemessener Qualitätslücke `gpt-5.6-terra` (Mini-Stufe) bzw. `gpt-5.6-sol`. Familienweite Safeguards können die Generierung mid-stream für mehrere Sekunden pausieren oder Anfragen blockieren; Timeouts und Streaming entsprechend auslegen.

## Output- & Format-Konventionen
- Kontextfenster 1.050.000 Tokens, max. 922.000 Input und 128.000 Output; Knowledge Cutoff 16. Feb. 2026. Input Text + Bild, Output Text. Einziger Snapshot `gpt-5.6-luna`, kein datierter Snapshot.
- Preise je 1M Tokens: Input $0,20, Cached Input $0,02, Output $1,20; Cache Writes 1,25× Input-Rate; über 272K Input-Tokens 2× Input und 1,5× Output für den ganzen Request.
- Endpoints: Chat Completions, Responses, Batch. Features: Streaming, Structured Outputs, Function Calling, File Search, Bild-Input, Web Search, Prompt Caching. Für Reasoning, Tool Calling und Multi-Turn empfiehlt OpenAI die Responses API.
- `text.verbosity` = `low | medium | high` als Default-Detailgrad.
- Prompt Caching (GPT-5.6 und neuer): `prompt_cache_options.ttl` (`"30m"`) statt `prompt_cache_retention`, explizite Breakpoints möglich, Mindestpräfix 1.024 sichtbare Input-Tokens.

## Migrations-Hinweise
- **VON gpt-5.6-luna weg**: `reasoning.effort`/`mode`/`context` und `text.verbosity` entfernen, wenn das Ziel sie nicht kennt; Kürze- und Formatregeln, die `text.verbosity` getragen hat, wieder ausformulieren; Kontextannahmen (1,05M) auf das Ziel zurückschneiden. Persistierte Reasoning-Items wandern nicht in andere Familien.
- **ZU gpt-5.6-luna migrieren**: offizieller Ersatz für `gpt-4.1-nano`/`gpt-4.1-nano-2025-04-14` (Shutdown 23.10.2026) und `gpt-5-nano-2025-08-07` (Shutdown 11.12.2026). (1) Effort-Baseline: Von GPT-5.5/5.4 aktuellen Effort behalten und eine Stufe tiefer gegentesten; dass das für Nano-Quellen ebenso gilt, ist eine Übertragung (unbelegt). (2) Prompt entschlacken, Few-Shot-Stapel und lange Tool-Beschreibungen kürzen. (3) Pauschale Kürze-Zeilen neu testen, Default über `text.verbosity`. (4) Responses API für Reasoning und Tools. (5) `prompt_cache_retention` → `prompt_cache_options.ttl`. (6) Autonomie-/Freigabegrenzen ergänzen.
- Einordnung: Aufstieg innerhalb der Familie über `gpt-5.6-terra` (Ersatz für `gpt-5-mini`) zu `gpt-5.6-sol`. OpenAI listet inzwischen GPT-6 Luna (`gpt-6-luna`) als Featured Model für kostensensible Volumen-Workloads; ein offizielles Nachfolger-Mapping für `gpt-5.6-luna` gibt es nicht (Stand 2026-10-13).

## Quellen
- https://developers.openai.com/api/docs/models/gpt-5.6-luna — Modellseite: id `gpt-5.6-luna`, Positionierung („cost-sensitive, high-volume workloads“, Nano-Stufe), effort `none`–`max` (Default `medium`), 1.050.000/922.000/128.000 Tokens, Cutoff 16.02.2026, Preise $0,2/$0,02/$1,2, 272K-Regel, Cache Writes, Endpoints, Features, Tools, einziger Snapshot.
- https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.6-sol — GPT-5.6-Abschnitt (gilt für die Familie): schlanke Prompts (10–15 % / 41–66 %), Kürze-Regeln, `text.verbosity`, Autonomiegrenzen, Effort-Migration, `reasoning.context`-Default `all_turns`, Pro mode „works with any GPT-5.6 model“ und Standard für Volumen-Arbeit, Safeguard-Pausen, Familienstärken.
- https://developers.openai.com/api/docs/guides/reasoning — `gpt-5.6-luna` „for the lowest cost and latency“, `reasoning.mode` standard/pro für GPT-5.6, Default `medium`, Reasoning-Wiederverwendung zwischen sol/terra/luna, `configuration_update` nur GPT-6.
- https://developers.openai.com/api/docs/guides/prompt-caching — Unterschiede ab GPT-5.6: `prompt_cache_options.ttl` `"30m"`, Breakpoints, 1,25× Cache Writes, 1.024-Token-Mindestpräfix.
- https://developers.openai.com/api/docs/deprecations — `gpt-4.1-nano`/`gpt-4.1-nano-2025-04-14` → `gpt-5.6-luna` (23.10.2026), `gpt-5-nano-2025-08-07` → `gpt-5.6-luna` (11.12.2026), `gpt-5-mini-2025-08-07` → `gpt-5.6-terra`; kein Eintrag für `gpt-5.6-luna` selbst.
- https://developers.openai.com/api/docs/models.md — Katalog: GPT-6 Luna als Featured Model, GPT-5.6 Luna weiterhin im Gesamtkatalog.
- https://developers.openai.com/api/docs/changelog.md — Release der GPT-5.6-Familie am 09.07.2026 mit „GPT-5.6 Luna for efficient, high-volume workloads“.

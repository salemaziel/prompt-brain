---
model: gpt-5.5
vendor: OpenAI
family: GPT
aliases: [gpt5.5, gpt-5.5-2026-04-23]
last_verified: 2026-10-13
status: current
---

# GPT-5.5

## Reasoning / Thinking
- Tiefe über `reasoning.effort`: `none | low | medium (Default) | high | xhigh`. **`max` gibt es auf GPT-5.5 nicht** — beim Migrieren von oder zu einem Modell mit `max` (z. B. GPT-5.6 Sol) muss die Stufe bewusst gemappt werden.
- Offizielle Empfehlung: „Treat `medium` as the recommended balanced starting point for quality, reliability, latency, and cost." `high`/`xhigh` nur, wenn Evals einen messbaren Qualitätsgewinn zeigen; höhere Stufen können laut Guide zu Overthinking, unnötigem Suchen oder Qualitätsrückschritten führen. Für latenzkritische Fälle erst `low` testen, `none` nur für Aufgaben ohne Reasoning-Bedarf.
- Interleaved Thinking: GPT-5.5 kann sichtbaren Output vor und zwischen Denkphasen sowie Denken zwischen Tool-Calls erzeugen.
- **`phase`-Feld (Responses API)**: bei langen oder tool-lastigen Flows das `phase`-Feld zurückgegebener Assistant-Items unverändert zurückreichen („preserve the `phase` parameter on returned assistant output items and pass it back unchanged") — `commentary` für Zwischenstände, `final_answer` für die fertige Antwort; nie auf User-Nachrichten setzen. Mit `previous_response_id` übernimmt die API das automatisch.
- `reasoning.context` defaultet bei Modellen vor GPT-5.6 auf `current_turn`; `all_turns` ist GPT-5.6 und GPT-6.1 Sol vorbehalten. `reasoning.mode: "pro"` ist laut Reasoning-Guide nur für GPT-5.6- und GPT-6-Modelle dokumentiert.

## Prompting-Stil
- **Outcome-first statt Prozess-Choreografie**: erwartetes Ergebnis, Erfolgskriterien, Grenzen für Seiteneffekte, Evidenzregeln und Output-Form beschreiben; schwere Schritt-für-Schritt-Anleitungen streichen. Vorgeschlagene, kurz gehaltene Abschnitte: Role, Personality, Goal, Success criteria, Constraints, Output, Stop rules.
- **Absolute Wörter sparsam**: `ALWAYS`/`NEVER`/`must`/`only` nur für echte Invarianten; für Ermessensfragen Entscheidungsregeln formulieren.
- **Tool-Guidance gehört in die Tool-Beschreibung**: „Put most tool-specific guidance in the tool descriptions themselves" — was das Tool tut, wann es zu nutzen ist, Pflicht-Inputs, Seiteneffekte, Retry-Sicherheit, typische Fehler. Der System-Prompt nur für tool-übergreifenden Kontext; für große Kataloge Tool Search.
- **Autonomie**: Fortschritt vor Rückfragen; nur nachfragen, wenn die fehlende Information das Ergebnis wesentlich ändert. Stopp-Regeln explizit setzen (Doku-Beispiel: „Use the minimum evidence sufficient to answer correctly, cite it precisely, then stop.").
- **Preambles**: kurze sichtbare Statusmeldung vor Tool-Calls, „Keep it to one or two sentences."
- **Default-Ton**: „GPT-5.5 tends to be efficient, direct, and task-oriented by default." Für kundennahe Produkte Persönlichkeit und Kollaborationsstil explizit, aber knapp definieren.
- Das aktuelle Datum muss nicht in den Prompt: „The model is already aware of the current UTC date."

## Stärken & Schwächen (prompt-relevant)
- Positionierung laut Modellseite: „A new class of intelligence for coding and professional work". Im Changelog vom 5. Mai, 28. Mai und 24. Juni 2026 als Produktionsempfehlung genannt („We recommend leveraging GPT-5.5 for production API usage"); seit 9. Juli 2026 gibt es die GPT-5.6-Familie.
- Weder Modellseite noch Deprecations-Seite nennen eine Abkündigung oder einen Nachfolger — das Modell ist weiter regulär verfügbar.
- Eigenheit: höherer Effort ist kein Qualitätsgarant (siehe oben); Länge der Antwort und Reasoning-Qualität getrennt steuern.
- Nicht unterstützt: Realtime, Assistants, Fine-tuning, Embeddings, Bild-/Video-/Audio-Generierung, Transkription/Übersetzung, Moderation, Legacy-Completions.

## Output- & Format-Konventionen
- Kontextfenster **1.050.000** Tokens, max. Output **128.000**; Knowledge-Cutoff **1. Dez 2025**; Input Text + Bild, Output nur Text. Endpunkte: Chat Completions, Responses, Batch.
- **Länge**: `text.verbosity` (`low | medium | high`, Default `medium`); „`low` is often a better starting point for concise responses." Konkrete Längen über Wortbudgets, Abschnittszahl oder JSON-only-Vorgabe im Prompt.
- **Formatierung**: „Let formatting serve comprehension" — standardmäßig schlichte Absätze, Überschriften/Fettdruck/Listen sparsam; Formatwünsche des Users respektieren.
- **Strukturierte Ausgabe**: „Remove output schema definitions from the prompt where possible" — Schemas über Structured Outputs statt Prosa im Prompt.
- **Prompt-Caching**: „Caching for GPT-5.5 only works with extended prompt caching" — `prompt_cache_retention` unterstützt nur `"24h"`; implizite Breakpoints alle 2.048 Tokens, explizite Breakpoints nicht unterstützt. Statische Teile zuerst, dynamische zuletzt; stabiler `prompt_cache_key` für gemeinsame Präfixe.
- Preise pro 1 Mio. Tokens: Input $5, Cached Input $0.50, Output $30; Prompts über 272K Input-Tokens kosten 2x Input und 1,5x Output. Snapshot `gpt-5.5-2026-04-23`.

## Migrations-Hinweise
- **ZU GPT-5.5 migrieren**: laut Guide „treat it as a new model family to tune for, not a drop-in replacement" — mit dem kleinsten Prompt starten, der den Produktvertrag erhält; Prozess-Choreografie, eingebettete Output-Schemas und Datumsangaben streichen; Tool-Hinweise in die Tool-Beschreibungen verlagern; `phase` in Responses-Flows durchreichen. `max` aus Quellmodellen auf `xhigh` (oder niedriger, per Eval) mappen.
- **VON GPT-5.5 zu GPT-5.6 Sol/Terra**: aktuelle Effort-Stufe als Baseline behalten und zusätzlich **eine Stufe darunter** testen. „GPT-5.6 tends to be more concise by default than GPT-5.5" — pauschale „Be concise"-Zeilen prüfen, sonst werden Antworten zu kurz. Persistiertes Reasoning wandert nicht mit: „reasoning does not carry between the GPT-5.6 and GPT-5.5 families."
- **VON GPT-5.5 zur GPT-6-Familie** (`gpt-6-astra`, `gpt-6.1-sol`, `gpt-6-luna`): „When migrating from GPT-5.5 or earlier, replace `prompt_cache_retention` with `prompt_cache_options.ttl`" (einziger Wert `"30m"`). Effektive Effort-Stufe beibehalten, wo unterstützt — GPT-6 Astra kennt kein `none`, GPT-6.1 Sol weder `none` noch `minimal`.
- **VON GPT-5.5 zu anderen Anbietern**: `reasoning.effort`, `text.verbosity`, `phase` und Structured Outputs als Prosa- bzw. Schema-Vorgaben des Zielanbieters nachbauen; ggf. entfernte Längen- und Formatvorgaben wieder explizit ergänzen; die 1,05-Mio.-Token-Kontextannahme prüfen.

## Quellen
- https://developers.openai.com/api/docs/models/gpt-5.5 — Positionierungssatz, Snapshot `gpt-5.5-2026-04-23`, Effort `none`–`xhigh` (Default `medium`, kein `max`), 1.050.000 Kontext / 128.000 Output, Cutoff 1. Dez 2025, Modalitäten, Endpunkte, Nicht-Unterstütztes, Preise und 272K-Regel, kein Deprecation-Hinweis.
- https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5 — „Using GPT-5.5": Effort-Empfehlung, `text.verbosity`, Tool-Beschreibungen, „Let formatting serve comprehension", Outcome-first-Struktur, ALWAYS/NEVER, Autonomie, Preambles, `phase`, Caching-Reihenfolge, UTC-Datum, Schemas über Structured Outputs, „not a drop-in replacement".
- https://developers.openai.com/api/docs/guides/reasoning — `gpt-5.5` Default `medium`, „try `low`" vor `none`, Interleaved Thinking, `phase` für GPT-5.5/5.4, `reasoning.context`-Default `current_turn` vor GPT-5.6, `pro`-Mode nur GPT-5.6/GPT-6, kein Reasoning-Transfer zwischen GPT-5.6- und GPT-5.5-Familie; GPT-6 Astra ohne `none`, GPT-6.1 Sol ohne `none`/`minimal`.
- https://developers.openai.com/api/docs/guides/prompt-caching — GPT-5.5: Retention nur `"24h"`, implizite Breakpoints alle 2.048 Tokens, keine expliziten Breakpoints; `prompt_cache_options.ttl` ab GPT-5.6.
- https://developers.openai.com/api/docs/changelog — Release 24. Apr 2026, „Caching for GPT-5.5 only works with extended prompt caching", Produktionsempfehlung (5. Mai, 28. Mai, 24. Juni 2026), GPT-5.6-Release 9. Juli 2026.
- https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.6-sol — „GPT-5.6 tends to be more concise by default than GPT-5.5", Effort-Baseline plus eine Stufe darunter beim Wechsel von GPT-5.5; GPT-6-Caching-Hinweis.
- https://developers.openai.com/api/docs/guides/latest-model — GPT-6-Migration: `prompt_cache_options.ttl` `"30m"` ab GPT-5.5 oder älter, effektive Effort-Stufe beibehalten.
- https://developers.openai.com/api/docs/deprecations — GPT-5.5 ist weder abgekündigt noch als Ersatzmodell gelistet.

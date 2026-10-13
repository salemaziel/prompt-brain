---
model: gpt-6.1-sol
vendor: OpenAI
family: GPT
aliases: [sol, gpt6.1-sol, 6.1-sol, gpt-6-1-sol]
last_verified: 2026-10-13
status: current
---

# GPT-6.1 Sol

## Reasoning / Thinking
- `reasoning.effort` (Responses) bzw. `reasoning_effort` (Chat Completions) akzeptiert `low | medium (Default) | high | xhigh | max`. **„The `none` and `minimal` reasoning efforts are not supported"** — Doku-Anweisung für Umsteiger: `none` durch `low` ersetzen, bei `minimal` mit `low` starten und Ergebnisse vergleichen.
- `reasoning.mode`: `standard` (Default) oder `pro` — GPT-5.6- und GPT-6-Modelle unterstützen beide Modi in der Responses API; Mode und Effort sind unabhängig, Pro-Tokens werden zu den Standard-Raten abgerechnet.
- `reasoning.context`: `auto | current_turn | all_turns`; GPT-6.1 Sol unterstützt laut Doku `all_turns` (rendert kompatible Reasoning-Items früherer Turns). Ob `auto` hier auf `all_turns` oder `current_turn` fällt, ist nicht ausgewiesen (unbelegt) — den effektiven Modus im `reasoning.context`-Feld der Response prüfen. Persistiertes Reasoning wird nur innerhalb derselben Modellfamilie wiederverwendet.
- Effort lässt sich mitten in der Konversation per `configuration_update`-Item ändern, ohne das Prompt-Präfix (und damit den Cache) umzuschreiben — unterstützt für die GPT-6-Familie nur im Standard-, Single-Agent-Modus; nicht mit automatischer Kompaktierung/Truncation kombinieren.

## Prompting-Stil
- OpenAI liefert keinen eigenen Sol-Prompting-Guide; die GPT-6-Prompts sind ausdrücklich „a starting point across the GPT-6 model family", adressieren aber „behavior observed with GPT-6 Astra". Jede Übertragung der folgenden Astra-Eigenheiten auf 6.1 Sol ist daher (unbelegt) und muss per Eval bestätigt werden.
- Bausteine aus dem GPT-6-Guide: Autonomie explizit gewähren („bias towards action and carry the user's intended task to completion"); Freigaben erst nach „a concrete, reviewable result" einholen; Präzedenz gegenüber Skills/Dateien ausschreiben („The user's instructions take precedence over guidelines provided in a skill."); Prosa ausdrücklich anfordern, wenn kein Markdown gewünscht ist; Slop-Wörter und kontrastive Rahmung verbieten; Delegation an Subagents aktiv steuern; Testumfang bei kleinen, reversiblen Änderungen begrenzen.
- Tool-Calling nur über die Responses API — Tool-Anweisungen im Prompt setzen einen Responses-Request voraus.

## Stärken & Schwächen (prompt-relevant)
- Positionierung: „Near-Astra performance for complex work at a lower cost" — in OpenAIs Flagship-Gruppe die Mittelstufe „Balanced speed, cost, and intelligence" zwischen GPT-6 Astra und GPT-6 Luna; Einsatz für „complex coding, computer use, and professional work". OpenAI empfiehlt, auf den eigenen Aufgaben gegen Astra zu vergleichen. Achtung: Bei GPT-5.6 war „Sol" das Spitzen-Tier, bei GPT-6 ist es die Mittelstufe.
- Laut Model-Selection-Guide: Medium für „Complex technical work and coordinated deliverables you expect to revise", Extra high für „Polished deliverables, connected visual systems, and decisions built from conflicting evidence".
- Multi-Agent (Delegation an Subagents innerhalb eines Responses-Requests) in **Beta** verfügbar.
- Ultrafast mode: `service_tier: "ultrafast"` nur in der Responses API, mit US- und EU-Data-Residency sowie globalem Processing; 6x Standard-Preis. Fast mode ebenfalls mit EU-Data-Residency.
- Einschränkungen: kein `none`/`minimal`-Effort; Chat Completions ohne Tool-Calling; nicht unterstützt sind u. a. Realtime, Assistants, Fine-tuning, Embeddings, Bild-/Video-/Audio-Endpunkte, Moderation, Legacy-Completions sowie `predicted_outputs`.

## Output- & Format-Konventionen
- Kontextfenster **1.050.000** Tokens, max. Input **922.000**, max. Output **128.000**; Knowledge-Cutoff **30. Apr 2026**; Input Text + Bild, Output nur Text. Einziger Snapshot: `gpt-6.1-sol`.
- Endpunkte: `v1/chat/completions` (ohne Tools), `v1/responses`, `v1/batch`. Features: streaming, structured_outputs, function_calling, file_search, image_input, web_search, prompt_caching. Hosted Tools (Responses): web_search, file_search, image_generation, code_interpreter, hosted_shell, apply_patch, skills, computer_use, mcp, tool_search.
- Preise pro 1 Mio. Tokens: Input $2, Cached Input $0.1 (5 % der Input-Rate), Cache Writes $2.5 (1,25x), Output $10. Über 272K Input-Tokens: 2x Input-/Cache-Raten und 1,5x Output für den gesamten Request. Fast 2x, Batch/Flex −50 %, Ultrafast 6x.
- Prompt-Caching: Lebensdauer über `prompt_cache_options.ttl` (einziger Wert `"30m"`, zugleich Default) statt `prompt_cache_retention`.
- Formatvertrag über Structured Outputs oder ausdrückliche Format-Anweisung fixieren; der GPT-6-Guide beschreibt für Astra eine Neigung zu Listen, Tabellen und Markdown — für 6.1 Sol (unbelegt).

## Migrations-Hinweise
- **VON gpt-6.1-sol weg**: Effort auf die Leiter des Ziel-Guides abbilden (`xhigh`/`max` nur übernehmen, wenn das Ziel sie dokumentiert); `reasoning.mode`, `reasoning.context`, `configuration_update`, Multi-Agent-Beta und `service_tier: "ultrafast"` entfernen oder auf Ziel-Äquivalente umschreiben; `prompt_cache_options.ttl` in die Cache-Syntax des Ziels übersetzen; aus dem GPT-6-Guide übernommene Autonomie-/Präzedenz-/Prosa-Bausteine auf Bedarf prüfen; das 1,05-Mio.-Kontextbudget auf das Zielfenster zurückschneiden.
- **ZU gpt-6.1-sol migrieren**: (1) `model` auf `gpt-6.1-sol`. (2) Bisherigen effektiven Effort beibehalten, wo unterstützt; `none` → `low`, `minimal` → mit `low` starten und vergleichen. (3) Tool-Calling auf die Responses API umstellen. (4) Wenn der Effort nicht `none` ist: `temperature`, `top_p`, `top_logprobs` entfernen, bei Chat Completions zusätzlich `logprobs`, bei Responses `message.output_text.logprobs` aus `include`. (5) Von GPT-5.5 oder früher kommend: `prompt_cache_retention` → `prompt_cache_options.ttl: "30m"`. (6) Wechselnden Effort per `configuration_update` statt per Request-Parameter umsetzen. (7) Bei Freigabe-Pausen die Autonomie-Bausteine des GPT-6-Guides ergänzen.
- **Von gpt-6-sol**: OpenAI verlangt ausdrücklich, „review the migration guidance before switching to GPT-6.1 Sol" — v. a. weil 6-Sol `none` und Chat-Completions-Function-Calling (nur mit `none`) erlaubt, 6.1 Sol beides nicht.
- **Von gpt-5.6-sol**: der Alias-Name „Sol" bleibt, das Tier sinkt von Flagship auf Mittelstufe; für maximale Qualität stattdessen gegen gpt-6-astra testen.

## Quellen
- https://developers.openai.com/api/docs/models/gpt-6.1-sol — Modellseite: id/Snapshot `gpt-6.1-sol`, „Near-Astra performance for complex work at a lower cost", Effort-Stufen inkl. „The `none` and `minimal` reasoning efforts are not supported", Chat Completions ohne Tool-Calling, Ultrafast/Data-Residency, 1.050.000 / 922.000 / 128.000, Cutoff 30.04.2026, Preise und Faktoren, Endpunkte, Features, Tools, `predicted_outputs` nicht unterstützt.
- https://developers.openai.com/api/docs/guides/latest-model — „Using GPT-6" (rollierende Seite, Stand 2026-10-13): Tier-Labels, GPT-6.1-Sol-Abschnitt, Prompting best practices „across the GPT-6 model family" mit Astra-Bezug, Limitations, Migration quickstart (Effort, Tool-Calling, unsupported parameters, Data Residency, `configuration_update`, `prompt_cache_options.ttl`), Hinweis zu `gpt-6-sol`.
- https://developers.openai.com/api/docs/guides/reasoning — Effort-Tabelle, 6.1-Sol-Default `medium` und fehlendes `none`/`minimal`, `reasoning.mode` für GPT-5.6/GPT-6, `reasoning.context` mit `all_turns`-Support für GPT-6.1 Sol, `configuration_update` (Standard-, Single-Agent-Modus).
- https://developers.openai.com/api/docs/guides/model-selection — „When to consider GPT-6.1 Sol" und Effort-Empfehlungen Medium / Extra high.
- https://developers.openai.com/api/docs/guides/responses-multi-agent — Multi-Agent als Beta „with GPT-6.1 Sol and all GPT-5.6 models".
- https://developers.openai.com/api/docs/guides/ultrafast-mode — Ultrafast für GPT-6 Astra und GPT-6.1 Sol, `service_tier: "ultrafast"`.
- https://developers.openai.com/api/docs/guides/prompt-caching — `prompt_cache_options.ttl` (`"30m"`) für GPT-5.6 und später, Cache-Read 0,05x für GPT-6.1 Sol, Cache-Write 1,25x.
- https://developers.openai.com/api/docs/changelog — 29.09.2026: Release `gpt-6.1-sol` „for complex coding and professional work at a lower cost than GPT-6 Astra", Multi-Agent-Beta; 08.10.2026: Ultrafast für GPT-6.1 Sol (Responses API, global sowie US-/EU-Residency).

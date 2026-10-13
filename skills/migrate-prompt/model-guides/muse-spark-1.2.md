---
model: muse-spark-1.2
vendor: Meta
family: Muse
aliases: [muse-spark-1.2-contributor, spark-1.2, muse-spark-1-2]
last_verified: 2026-10-13
status: legacy
successor: muse-spark-1.3
---

# Muse Spark 1.2

## Reasoning / Thinking
- Typ: **immer an, nicht abschaltbar**. `reasoning_effort: "none"` ist für Muse Spark nicht unterstützt und liefert HTTP 400 („Not supported by Muse Wonder or Muse Spark"); auf der Messages API gilt dasselbe für `thinking: {type: "disabled"}`. Jeder Zero-Thinking-Pfad muss auf `minimal` oder `low` abgebildet werden.
- Parameter protokollabhängig: `reasoning_effort` (Chat Completions) bzw. `reasoning.effort` (Responses API), auf der Messages API `output_config.effort` (`low`–`xhigh`). Stufen für 1.2: `minimal | low | medium | high | xhigh` — **kein `max`**, das ist laut Reasoning-Doku nur für `muse-wonder-1.0` und `muse-spark-1.3` freigegeben.
- **Kein publizierter Default**: Ohne Parameter „the model still reasons at a model-determined level" — welche Stufe das ist, steht nirgends (unbelegt). Effort im Prompt-Vertrag explizit setzen.
- Chain of Thought ist privat; Reasoning-Tokens zählen gegen `max_tokens` bzw. `max_output_tokens` und werden zum Output-Satz abgerechnet. Reasoning-Erhalt über Turns nur auf Responses (`previous_response_id` oder `include: ["reasoning.encrypted_content"]`) und Messages (`thinking`-/`redacted_thinking`-Replay); Chat Completions „reasons from scratch". Die Protokoll-Doku gilt für alle Modelle der Model API, 1.2-spezifische Abweichungen sind nicht dokumentiert (unbelegt).
- `logprobs` wird nicht unterstützt (HTTP 400) — „Muse Spark is a reasoning model".

## Prompting-Stil
- **`developer`-Rolle statt `system`**: Metas Build-Blog empfiehlt „Prefer a `developer` message over the `system` to set tone, format, and standing rules". Der Blog bezieht sich auf Muse Spark 1.1 und ist älter als 1.2 — die Empfehlung gilt hier familienweit, eine 1.2-spezifische Bestätigung fehlt (unbelegt).
- **Effort an die Aufgabe koppeln**: „match effort to the task"; laut demselben Blog kann `reasoning_effort=xhigh` bei sauber abgegrenzten Aufgaben ein ganzes Artefakt in einem Durchlauf liefern (ebenfalls 1.1-Kontext).
- **Komplexe Instruktionen sind tragfähig**: 1.2 folgt laut Launch-Blog „complex instructions more precisely than its predecessor" und nutzt Planung, Goal Conditioning und Context Compaction für lange Aufgaben.
- **Tool-Beschreibungen tragen die Last**: „Write clear, specific descriptions for the tool and for each parameter. The model uses them to decide when and how to call the tool."
- **Caching über Reihenfolge**: Prefix-Caching ist automatisch; „put stable content first … and put variable content last".

## Stärken & Schwächen (prompt-relevant)
- Einordnung: laut Modellübersicht „the previous version" der Muse-Spark-Reihe; `muse-spark-1.3` ist „the latest version" und „Recommended for new work". Eine Deprecation nennt Meta nicht.
- Stärken: Coding-Fokus — „a coding-focused update to Muse Spark 1.1" mit Verbesserungen bei Codegenerierung, Debugging, Codebase-Verständnis und End-to-End-Workflows; die Modellseite verspricht „higher first-attempt accuracy and more reliable tool calling". Agentische Langläufe (Kernel-Fallstudie mit 1.000+ Tool-Calls über bis zu 24 Stunden).
- Stärken: „robust audio-visual understanding to enable video-heavy workflows" (Multimodal-Blog). **Audio**: Meta verweist Audio-Workloads ausdrücklich auf 1.2 („For audio, use Muse Spark 1.2"), weil Audio in 1.3 nicht voll unterstützt ist.
- Schwäche: `tool_choice` akzeptiert auf der Model API nur `"auto"` — `"required"`, `"none"` und benannte Funktionen enden in HTTP 400; Tool-Zwang sprachlich im Prompt formulieren.
- Gegenüber 1.3 ausführlicher: 1.3 nutzt laut Meta „~20% fewer tool calls and ~25% fewer tokens" und ist „less verbose" — 1.2-Prompts enthalten deshalb oft Knappheits- und Turn-Spar-Anweisungen.
- Kein publizierter Knowledge Cutoff und kein publiziertes Output-Token-Limit (unbelegt).

## Output- & Format-Konventionen
- Kontextfenster **1.048.576 Tokens**; Input Text, Bild, Video, Audio und PDF, Output nur Text.
- Structured Output über `response_format` (`json_schema`, Chat Completions) bzw. `text.format` (Responses); Decoding ist schema-beschränkt. Schema-Limits wie bei 1.3: Tiefe 10, 5.000 Properties, 120.000 Zeichen, 1.000 Enum-Werte (Default, pro App anhebbar), keine rekursiven Schemas. Function-Tool-Argumente sind auch mit `strict: true` nur schema-geleitet — serverseitig validieren.
- Tool Calling: `parallel_tool_calls` Default `true`; Tool-Namen `^[a-zA-Z0-9_.-]+$` mit höchstens einem Punkt.
- Drei Protokolle (Responses, Chat Completions, Messages) mit denselben Modellen, derselben Auth und demselben Preis; Search Grounding nur auf der Responses API.
- Preise pro 1M Tokens identisch mit 1.3: Standard $1.25 / $0.15 (cached) / $4.25, Contributor (`muse-spark-1.2-contributor`) $0.10 / $0.002 / $0.20 — der Contributor-Modus erlaubt Meta, die Inhalte zum Training zu nutzen.

## Migrations-Hinweise
- **Status**: Meta führt 1.2 als „the previous version" und empfiehlt 1.3 für neue Arbeit; 1.2 bleibt auf Model API und in Muse Code verfügbar, ein Retirement-Datum ist nicht genannt. Ausnahme: Für Audio empfiehlt Meta weiterhin 1.2 (oder Muse Voice Transcribe) — Audio-Workloads nicht ungeprüft auf 1.3 verschieben.
- **ZU Muse Spark 1.3 (VON 1.2 weg)**: Knappheits-, Verbosity- und Turn-Spar-Instruktionen streichen (1.3 ist knapper); Effort-Stufen 1:1 übernehmbar, `max` nur auf Standard-Tier-1.3 ergänzen; Audio-Pfade auf 1.2 oder Muse Voice Transcribe belassen; Prompts mit vielen Einzelschritten können entschlackt werden, weil 1.3 lange Instruktionen zuverlässiger befolgt.
- **ZU Muse Spark 1.2 migrieren**: `max` auf `xhigh` abbilden; `reasoning_effort: "none"`, erzwungene `tool_choice`-Werte und `logprobs` entfernen (jeweils HTTP 400); Token-Budgets für Reasoning großzügig setzen; System-Prompt-Schicht als `developer`-Nachricht führen; bei 1.3-Quellen ggf. Knappheitsanweisungen ergänzen.
- **VON Muse Spark 1.2 zu Fremdmodellen**: Meta-spezifische Felder (`reasoning.summary`, `include: ["reasoning.encrypted_content"]`, `previous_response_id`) entfernen, `developer` auf `system` zurückdrehen, falls das Ziel keine Developer-Rolle kennt, und Audio-Fähigkeiten des Ziels prüfen.

## Quellen
- https://dev.meta.ai/docs/models.md — belegt `muse-spark-1.2` als „the previous version" und `muse-spark-1.3` als „the latest version"/„Recommended for new work", 1.048.576 Tokens Kontext, Input-Modalitäten und Text-Output, die Verfügbarkeit von `muse-spark-1.2`/`muse-spark-1.2-contributor` auf Model API und in Muse Code sowie den Audio-Hinweis „For audio, use Muse Spark 1.2".
- https://dev.meta.ai/docs/reasoning.md — belegt die Effort-Stufen, `max` nur für `muse-wonder-1.0` und `muse-spark-1.3`, HTTP 400 für `none` und `logprobs`, den „model-determined level"-Default, private Chain of Thought, Token-Abrechnung und Reasoning-Erhalt pro Protokoll.
- https://dev.meta.ai/docs/protocols.md — belegt die drei Protokolle mit denselben Modellen, derselben Auth und demselben Preis, Reasoning-Erhalt auf Responses und Messages (nicht auf Chat Completions) und Search Grounding nur auf Responses.
- https://dev.meta.ai/docs/protocols/messages.md — belegt `thinking`/`output_config.effort` (`low`–`xhigh`), HTTP 400 für `thinking: {type: "disabled"}` und `redacted_thinking`-Replay.
- https://dev.meta.ai/models/muse-spark-1-2 — offizielle Modellseite: „optimized for real coding workflows, with higher first-attempt accuracy and more reliable tool calling", 1M Kontext, Preistabelle beider Tiers.
- https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2 — Launch-Blog vom 2026-08-05: „coding-focused update to Muse Spark 1.1", präziseres Befolgen komplexer Instruktionen, Planung/Goal Conditioning/Context Compaction, Kernel-Fallstudie, Verfügbarkeit in Muse Code und Model API.
- https://research.meta.ai/blog/multimodal-intelligence-of-muse-spark-1-2 — Blog vom 2026-08-20: „robust audio-visual understanding" und Video-Workflows; nennt keine Prompting-Regeln und keine 1.2-spezifischen Limitierungen.
- https://research.meta.ai/blog/introducing-muse-spark-1-3 — belegt die Unterschiede von 1.3 gegenüber 1.2 (~20 % weniger Tool-Calls, ~25 % weniger Tokens, „less verbose", zuverlässigeres Befolgen langer Instruktionen).
- https://dev.meta.ai/resources/blog/build-with-muse-spark — Build-Blog vom 2026-07-08 (Muse Spark 1.1): `developer`-statt-`system`-Empfehlung, Effort an Aufgabe koppeln, `xhigh`-Einzeldurchlauf.
- https://dev.meta.ai/docs/tool-calling.md — belegt `tool_choice` nur `"auto"` (sonst HTTP 400), `parallel_tool_calls`-Default `true`, Namensregeln, die Beschreibungs-Empfehlung und schema-geleitete, nicht garantierte Argumente.
- https://dev.meta.ai/docs/structured-output.md — belegt `response_format`/`text.format`, schema-beschränktes Decoding, keine rekursiven Schemas und die Schema-Limits.
- https://dev.meta.ai/docs/prompt-caching.md — belegt automatisches Prefix-Caching und „stable content first".
- https://dev.meta.ai/docs/pricing-rate-limits — belegt die identischen Preise von 1.2 und 1.3 in Standard- und Contributor-Modus und die Trainings-Gegenleistung des Contributor-Modus.

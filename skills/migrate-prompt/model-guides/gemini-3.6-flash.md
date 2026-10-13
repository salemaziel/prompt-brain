---
model: gemini-3.6-flash
vendor: Google
family: Gemini
aliases: [gemini-3.6, gemini-3-6-flash, 3.6-flash, gemini-flash-3.6, gemini3.6flash, gemini-3.5-flash]
last_verified: 2026-10-13
status: legacy
successor: gemini-3.8-flash
---

# Gemini 3.6 Flash

## Reasoning / Thinking
- Typ: **dynamisches Thinking, standardmäßig an**. Steuerung über das String-Enum `thinking_level` mit `minimal | low | medium | high`, Default **`medium`** (Thinking-Tabelle: „On (medium)"). Anders als `gemini-3.8-flash` kennt 3.6 Flash die Stufe `minimal`.
- `minimal` entspricht laut Doku für die meisten Anfragen der „no thinking"-Einstellung, schaltet Thinking aber nicht garantiert ab („`minimal` does not guarantee that thinking is off"). Einen echten Zero-Thinking-Pfad wie `thinkingBudget = 0` bei Gemini 2.5 Flash gibt es nicht.
- `thinking_budget` ist abgelöst: „Replace `thinking_budget` with `thinking_level`". Beide Parameter im selben Request liefern einen 400-Fehler. Die Stufen sind „relative allowances for thinking rather than strict token guarantees".
- `max_output_tokens` zählt Thought-Tokens mit und schneidet hart ab, auch mitten im Reasoning. Für weniger Kosten oder Latenz empfiehlt Google, `thinking_level` zu senken statt ein kleines `max_output_tokens` zu setzen.
- Thought Signatures tragen die Reasoning-Kontinuität über Turns. Im stateful-Betrieb (`store: true` + `previous_interaction_id`) verwaltet der Server sie; stateless müssen alle `thought`-Blöcke unverändert zurückgeschickt werden. Abrechnung: „response pricing is the sum of output tokens and thinking tokens".

## Prompting-Stil
- **Knapp und direkt**: „Be concise. Gemini 3.x responds best to direct, clear instructions." Verbose Prompt-Engineering-Techniken für ältere Modelle können das Modell laut Doku „over-analyze" lassen; handgeschriebene CoT-Ketten durch `thinking_level` ersetzen.
- **Gesprächigkeit anfordern**: Gemini 3.x antwortet per Default wenig verbose und direkt; einen konversationellen Ton explizit im Prompt verlangen.
- **Long Context**: Daten zuerst, die konkrete Frage oder Anweisung ans Ende, eingeleitet mit einem Anker wie „Based on the preceding information...".
- **Keine Sampling-Steuerung**: `temperature`, `top_p` und `top_k` sind „deprecated and ignored"; künftige Modellgenerationen antworten darauf mit HTTP 400. Für mehr Determinismus nennt Google stattdessen eine System-Instruction mit expliziten Regeln.
- **Kein Assistant-Prefill**: Endet der Request mit einem nicht-leeren `model`-Turn, kommt ein 400-Fehler. Ausgabeform über `system_instruction` oder Structured Outputs erzwingen.
- **UI-Arbeit**: Menschliche Bewerter bevorzugten bei visuellem Layout und Styling frühere Modelle; Google rät, das durch „explicit design guidelines" im Prompt auszugleichen.

## Stärken & Schwächen (prompt-relevant)
- Stärken laut Google: weniger Reasoning-Schritte, Turns und Tool-Calls als Gemini 3.5 und weniger „execution loop spiraling"; Code mit weniger ungewollten Edits und Debugging-Schleifen; bessere Instruktionsbefolgung (weniger ungewollte Dateiänderungen bei Diagnoseaufgaben); starkes multimodales und räumliches Reasoning (Charts, Blueprints, Web-Layouts). Die Modellseite nennt Code-Generierung, agentische Ausführung und räumliches Reasoning als Schwerpunkte.
- Eigenheit „Upfront programmatic inspection": führt vor Änderungen häufiger Diagnose-Skripte aus als 3.5 Flash. Das verbessert die Genauigkeit bei komplexen Aufgaben, kann aber bei Routine-Frontend-Arbeit zusätzliche explorative Schritte kosten. Eine offizielle Gegenmaßnahme per Prompt nennt Google nicht.
- Model Card: „workhorse model" mit besserer Token-Effizienz als 3.5 Flash, basiert auf Gemini 3.5 Flash; Einsatzfelder agentische Workflows, komplexes Video-Reasoning, Coding, Enterprise-Workflows.
- Schwächen laut Model Card: übliche Halluzinationen, Jailbreak-Resistenz noch in Arbeit, gelegentliche Langsamkeit bzw. Timeouts, leichte Regression im Ton von Ablehnungen gegenüber 3.5 Flash. Knowledge Cutoff **März 2026**, in manchen Domänen nur bis Januar 2025 — zeitkritische Fakten in den Prompt legen.
- Bild-Segmentierung (Pixel-Masken) ist laut Google in Gemini 3.x nicht unterstützt.

## Output- & Format-Konventionen
- 1.048.576 Input-Tokens / 65.536 Output-Tokens. Input: Text, Bild, Video, Audio, PDF → Output nur Text.
- Unterstützt: Structured Outputs, Function Calling, Caching, Code Execution, Search Grounding, URL Context, File Search, Grounding with Google Maps, Computer Use (Preview), Batch-, Flex- und Priority-Inference. **Nicht** unterstützt: Audio-Generierung, Bild-Generierung, Live API.
- Function Calling: multimodale Assets gehören in die Response-Payload, Inline-Anweisungen in Function-Responses werden mit `\n\n` formatiert. `Malformed_Function_Call`-Fehler im Zusammenhang mit Text vor dem Tool-Call sind ein dokumentiertes Fehlerbild.
- Preis pro 1M Tokens (Paid Tier): Input $0.75 / Output $3.75 bis 31.12.2026, ab 01.01.2027 $1.50 / $7.50; Batch $0.375 / $1.875 bis 31.12.2026, danach $0.75 / $3.75 — dieselbe Staffel wie `gemini-3.8-flash`.

## Migrations-Hinweise
- **Status-Caveat**: Google führt 3.6 Flash als „Our previous-generation Flash model"; die neueste Flash-Version ist `gemini-3.8-flash`. 3.6 Flash ist **nicht** deprecated, bleibt „available for production use", ein Shutdown-Datum ist nicht angekündigt. Google nennt es ausdrücklich als Alternative, wenn der höhere Tokenverbrauch von 3.8 Flash nicht gebraucht wird („Alternatively, Gemini 3.6 Flash remains supported"). Beim Wechsel auf 3.8 Flash beachten: `minimal` wirft dort einen Fehler.
- **`gemini-3.5-flash` löst auf diesen Guide auf**: 3.5 Flash ist seit 08.10.2026 deprecated, API-Requests werden automatisch auf `gemini-3.6-flash` geroutet; Google nennt 3.6 Flash den „Direct replacement for `gemini-3.5-flash`". Ein auf 3.5 Flash getunter Prompt läuft also bereits auf 3.6 Flash; der `medium`-Default ist gleich geblieben, nur der Model-String ist nachzuziehen.
- **ZU gemini-3.6-flash migrieren**: id tauschen; `temperature`/`top_p`/`top_k`, `candidate_count` und vorgefüllte Model-Turns entfernen; `thinking_budget` durch `thinking_level` ersetzen (die Checkliste nennt `"medium"` oder `"high"`); Function Calling prüfen (multimodale Assets in die Response-Payload, Inline-Anweisungen in Function-Responses mit `\n\n`); Thought Signatures erhalten oder auf `previous_interaction_id` umstellen; verbose Prompt-Engineering-Reste und CoT-Scaffolding entfernen; bei UI-Aufgaben explizite Design-Guidelines ergänzen. Die Auswahltabelle ordnet 3.6 Flash den Workloads von Gemini 3.5 Flash, Gemini 3 Flash (Preview) und Gemini 3.1 Pro zu; die Deprecation-Liste nennt es als Ersatz für `gemini-3-flash-preview`. Segmentierungs-Workloads nicht hierher migrieren.
- **VON gemini-3.6-flash weg**: `thinking_level` in die Steuerung des Ziels übersetzen (zu 3.8 Flash: `minimal` → `low`, Tokenverbrauch neu messen); `previous_interaction_id`- und Thought-Signature-Logik entfernen, wenn das Ziel sie nicht kennt; Sampling-Parameter nur setzen, wenn der Ziel-Guide es verlangt; knappe Prompts nur dann wieder anreichern, wenn das Ziel explizites Scaffolding braucht.

## Quellen
- https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash — Modellseite: id `gemini-3.6-flash` (Stable), 1.048.576 Input / 65.536 Output, Input Text/Bild/Video/Audio/PDF → Text, vollständige Capability-Liste inkl. Computer Use (Preview) und der nicht unterstützten Features, Schwerpunkte „code generation, agentic execution, and spatial reasoning".
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6 — „What's new in Gemini 3.6 Flash and 3.5 Flash-Lite": „previous-generation releases … remain available for production use", Default `medium`, Token- und Turn-Reduktion, Code- und Instruktionsverbesserungen, „Upfront programmatic inspection", UI-Styling-Hinweis mit „explicit design guidelines", Sampling-Deprecation („deprecated and ignored", künftig HTTP 400), Prefill → 400 mit `system_instruction`/Structured Outputs als Ersatz, Migrations-Checkliste, Auswahltabelle (3.5 Flash, 3 Flash Preview, 3.1 Pro).
- https://ai.google.dev/gemini-api/docs/thinking — Thinking-Tabelle (`gemini-3.6-flash`: „On (medium)", `minimal, low, medium, high`), `max_output_tokens` inkl. Thought-Tokens, stateful vs. stateless Thought-Signature-Handling, „response pricing is the sum of output tokens and thinking tokens".
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — `thinkingLevel`-Tabelle (3.6 Flash: `minimal` unterstützt, `medium` Default), „`minimal` does not guarantee that thinking is off", Default-Level 3.6 Flash `medium`.
- https://ai.google.dev/gemini-api/docs/gemini-3 — Gemini-3-Familie: „relative allowances for thinking rather than strict token guarantees", 400-Fehler bei `thinking_level` + `thinking_budget` im selben Request.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5 — Best Practices für alle Gemini 3.x („Be concise…", geringe Default-Verbosität, Long-Context-Regel mit „Based on the preceding information..."), „Image segmentation is not supported in Gemini 3.x", 3.5 Flash deprecated und auf 3.6 Flash geroutet, 3.6 Flash als „Direct replacement for `gemini-3.5-flash`".
- https://ai.google.dev/gemini-api/docs/latest-model — Gemini-3.8-Flash-Guide: „can use more tokens on longer running and complex tasks, by design", „Alternatively, Gemini 3.6 Flash remains supported", `minimal` auf 3.8 Flash nicht unterstützt.
- https://ai.google.dev/gemini-api/docs/models — Modellliste: Gemini 3.6 Flash „Our previous-generation Flash model" (Stable), Gemini 3.8 Flash als neueste Flash-Version.
- https://ai.google.dev/gemini-api/docs/deprecations — `gemini-3.6-flash` (21.07.2026, kein Shutdown-Datum angekündigt); `gemini-3.5-flash` mit Auto-Routing auf `gemini-3.6-flash`; `gemini-3.6-flash` als empfohlener Ersatz für `gemini-3-flash-preview`.
- https://ai.google.dev/gemini-api/docs/changelog — 21.07.2026 GA von 3.6 Flash und Deprecation der Sampling-Parameter; 08.10.2026 Deprecation von `gemini-3.5-flash` mit automatischem Routing auf `gemini-3.6-flash`.
- https://ai.google.dev/gemini-api/docs/pricing — Preisstaffel 3.6 Flash: $0.75 / $3.75 bis 31.12.2026, danach $1.50 / $7.50; Batch $0.375 / $1.875 → $0.75 / $3.75.
- https://deepmind.google/models/model-cards/gemini-3-6-flash/ — Model Card (21.07.2026): „workhorse model", Token-Effizienz gegenüber 3.5 Flash, basiert auf Gemini 3.5 Flash, Einsatzfelder, Limitationen (Halluzinationen, Jailbreak, Langsamkeit/Timeouts), Knowledge Cutoff März 2026 (teils Januar 2025), leichte Ton-Regression.

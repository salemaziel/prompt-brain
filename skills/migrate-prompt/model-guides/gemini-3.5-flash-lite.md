---
model: gemini-3.5-flash-lite
vendor: Google
family: Gemini
aliases: [gemini-flash-lite, gemini-3-5-flash-lite, 3.5-flash-lite, gemini-flash-lite-3.5, gemini3.5flashlite]
last_verified: 2026-10-13
status: current
---

# Gemini 3.5 Flash-Lite

## Reasoning / Thinking
- Typ: **dynamisches Thinking mit minimalem Default**. Steuerung über das String-Enum `thinking_level` mit `minimal | low | medium | high`, Default **`minimal`** (Thinking-Tabelle: „On (minimal)").
- `minimal` entspricht laut Doku für die meisten Anfragen der „no thinking"-Einstellung, schaltet Thinking aber nicht garantiert ab („`minimal` does not guarantee that thinking is off").
- Stufenwahl laut Migrations-Checkliste: für Extraktion, Routing und Klassifikation in hohem Volumen `minimal` belassen; für autonome Subagenten mit Tool-Calls, Code Execution oder mehrstufigem Reasoning `medium` oder `high` setzen, „to prevent premature tool termination". Bei Dokument-Parsing rät Google, `minimal` und `high` je nach Dokumentkomplexität gegeneinander zu testen.
- `thinking_budget` ist abgelöst; `thinking_level` und `thinking_budget` im selben Request liefern einen 400-Fehler. Die Stufen sind „relative allowances for thinking rather than strict token guarantees".
- Thought Signatures: im stateful-Betrieb (`store: true` + `previous_interaction_id`) verwaltet der Server sie; stateless müssen alle `thought`-Blöcke unverändert zurückgeschickt werden. Thinking-Tokens werden als Output abgerechnet, und `max_output_tokens` zählt sie mit.

## Prompting-Stil
- **Knapp und direkt**: „Be concise. Gemini 3.x responds best to direct, clear instructions." Verbose Prompt-Engineering-Techniken älterer Modelle können laut Doku zu „over-analyze" führen.
- **Gesprächigkeit anfordern**: Gemini 3.x antwortet per Default wenig verbose; konversationellen Ton explizit verlangen.
- **Long Context**: Daten zuerst, Frage oder Anweisung ans Ende, eingeleitet mit „Based on the preceding information...".
- **Keine Sampling-Steuerung**: `temperature`, `top_p` und `top_k` sind „deprecated and ignored"; künftige Modellgenerationen antworten mit HTTP 400. Für mehr Determinismus nennt Google eine System-Instruction mit expliziten Regeln.
- **Kein Assistant-Prefill**: Ein Request, der mit einem nicht-leeren `model`-Turn endet, liefert 400. Ausgabeform über `system_instruction` oder Structured Outputs erzwingen.
- **Subagent-Prompts**: Weil der Default `minimal` ist, muss die Denktiefe für Planungs- und Tool-Aufgaben aktiv per `thinking_level` angehoben werden; Google nennt das ausdrücklich für „autonomous planning and complex subagent tasks".

## Stärken & Schwächen (prompt-relevant)
- Stärken laut Google: höchster Durchsatz der 3.5-Familie für Datenparsing und Dokumentextraktion; zuverlässigere Tool-Ausführung bei Code Execution, Search und MCP; genaueres Dokument-Parsing und strukturierte Datenextraktion; Frontend-JavaScript und Tabellenverarbeitung über leichtgewichtige Code Execution; stabilere Multi-Turn-Instruktionsbefolgung und Persona-Konsistenz als Gemini 3.1 Flash-Lite; Computer Use als Built-in-Tool.
- Gegenüber Gemini 2.5 Flash nennt Google einen „Strong migration path" mit höheren Werten auf HLE (18,0 % vs. 11,0 %) und CharXIV (74,5 % vs. 63,7 %).
- Model Card: basiert auf Gemini 3.1 Flash-Lite; optimiert für latenzkritische Aufgaben in hohem Volumen wie Übersetzung und Klassifikation sowie agentische Workflows.
- Schwächen laut Model Card: übliche Halluzinationen, Jailbreak-Resistenz noch in Arbeit, gelegentliche Langsamkeit bzw. Timeouts. Knowledge Cutoff **März 2026**, in manchen Domänen nur bis Januar 2025.
- Bild-Segmentierung (Pixel-Masken) ist laut Google in Gemini 3.x nicht unterstützt.

## Output- & Format-Konventionen
- 1.048.576 Input-Tokens / 65.536 Output-Tokens. Input: Text, Bild, Video, Audio, PDF → Output nur Text.
- Unterstützt: Structured Outputs, Function Calling, Caching, Code Execution, Search Grounding, URL Context, File Search, Grounding with Google Maps, Computer Use (Preview), Batch-, Flex- und Priority-Inference. **Nicht** unterstützt: Audio-Generierung, Bild-Generierung, Live API.
- Function Calling: dieselben Regeln wie bei 3.6 Flash — multimodale Assets in die Response-Payload, Inline-Anweisungen in Function-Responses mit `\n\n` formatieren.
- Preis pro 1M Tokens (Paid Tier): Input $0.30, Output $2.50 (inkl. Thinking-Tokens); Batch $0.15 / $1.25; Context Caching $0.03 plus $1.00 Storage pro 1M Tokens/Stunde.

## Migrations-Hinweise
- **Status**: GA seit 21.07.2026, kein Shutdown-Datum angekündigt. Für neue Projekte nennt Google „3.5 Flash-Lite or 3.8 Flash" als „latest models". Es gibt kein neueres Flash-Lite-Textmodell; `gemini-3.1-flash-lite` (Shutdown frühestens 07.05.2027) nennt `gemini-3.5-flash-lite` als Ersatz.
- **ZU gemini-3.5-flash-lite migrieren**: id tauschen; `thinking_level` bewusst wählen (`minimal` für Durchsatz, `medium`/`high` für Subagenten mit Tools); `temperature`/`top_p`/`top_k`, `candidate_count` und vorgefüllte Model-Turns entfernen; Function Calling nach denselben Regeln wie 3.6 Flash prüfen; Thought Signatures erhalten oder auf `previous_interaction_id` umstellen; verbose Prompt-Engineering und CoT-Scaffolding entfernen.
- Speziell **von `gemini-2.5-flash`**: `thinkingBudget` durch `thinking_level` ersetzen; ein Budget von `0` wird am ehesten `minimal`, das Thinking aber nicht garantiert abschaltet; explizit gesetzte Temperature entfernen. Segmentierungs-Workloads nicht migrieren — Google empfiehlt dafür weiter Gemini 2.5 Flash mit abgeschaltetem Thinking.
- Speziell **von `gemini-3.1-flash-lite`**: gleicher `minimal`-Default; Google nennt bessere Persona-Konsistenz und Instruktionsbefolgung über mehrere Turns.
- **VON gemini-3.5-flash-lite weg**: `thinking_level` in die Steuerung des Ziels übersetzen — zu `gemini-3.8-flash` hebt `minimal` auf `low`, weil `minimal` dort einen Fehler wirft; Thought-Signature- und `previous_interaction_id`-Logik entfernen, wenn das Ziel sie nicht kennt; Sampling-Parameter nur setzen, wenn der Ziel-Guide es verlangt; Kosten und Latenz neu bewerten.

## Quellen
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite — Modellseite: id `gemini-3.5-flash-lite` (Stable, Juli 2026), 1.048.576 Input / 65.536 Output, Input Text/Bild/Video/Audio/PDF → Text, Capability-Liste inkl. Computer Use (Preview), nicht unterstützte Features, Ausrichtung auf Subagenten und Dokument-Parsing.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6 — „What's new in Gemini 3.6 Flash and 3.5 Flash-Lite": Default `minimal`, Preis $0.30 / $2.50, Stärken (Durchsatz, Tool-Zuverlässigkeit, Dokument-Parsing, Persona-Konsistenz), „Strong migration path from Gemini 2.5 Flash" mit HLE- und CharXIV-Werten, Sampling-Deprecation und Prefill-400, Checkliste „Migrate to gemini-3.5-flash-lite" (`minimal` für Durchsatz, `medium`/`high` „to prevent premature tool termination").
- https://ai.google.dev/gemini-api/docs/thinking — Thinking-Tabelle (`gemini-3.5-flash-lite`: „On (minimal)", `minimal, low, medium, high`), Thought-Signature-Handling stateful/stateless, Thinking-Tokens in der Abrechnung, `max_output_tokens` inkl. Thought-Tokens.
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — `thinkingLevel`-Tabelle (3.5 & 3.1 Flash-Lite: `minimal` Default), „`minimal` does not guarantee that thinking is off", 2.5-Flash-Budget 0 bis 24576.
- https://ai.google.dev/gemini-api/docs/gemini-3 — „relative allowances for thinking rather than strict token guarantees", 400-Fehler bei `thinking_level` + `thinking_budget`.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5 — Best Practices für alle Gemini 3.x (Kürze, Verbosität, Long-Context-Regel), „Image segmentation is not supported in Gemini 3.x" mit Empfehlung, dafür Gemini 2.5 Flash mit abgeschaltetem Thinking zu nutzen.
- https://ai.google.dev/gemini-api/docs/models — Modellliste: Gemini 3.5 Flash-Lite (Stable) und der Hinweis „For any new projects, use our latest models: 3.5 Flash-Lite or 3.8 Flash".
- https://ai.google.dev/gemini-api/docs/deprecations — `gemini-3.5-flash-lite` (21.07.2026, kein Shutdown-Datum angekündigt); `gemini-3.1-flash-lite` mit Shutdown 07.05.2027 und Ersatz `gemini-3.5-flash-lite`.
- https://ai.google.dev/gemini-api/docs/changelog — 21.07.2026: GA von Gemini 3.5 Flash-Lite als „low-latency, highly cost-effective subagent option".
- https://ai.google.dev/gemini-api/docs/pricing — Preise 3.5 Flash-Lite: $0.30 / $2.50, Batch $0.15 / $1.25, Caching $0.03 plus $1.00 Storage pro 1M Tokens/Stunde.
- https://deepmind.google/models/model-cards/gemini-3-5-flash-lite/ — Model Card: basiert auf Gemini 3.1 Flash-Lite, Ausrichtung auf Übersetzung, Klassifikation und agentische Workflows, Limitationen (Halluzinationen, Jailbreak, Langsamkeit/Timeouts), Knowledge Cutoff März 2026 (teils Januar 2025).

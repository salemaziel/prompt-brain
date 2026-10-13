---
model: gemini-3.7-flash
vendor: Google
family: Gemini
aliases: [gemini-3.7, gemini-3-7-flash, 3.7-flash, gemini-flash-3.7]
last_verified: 2026-10-13
status: legacy
successor: gemini-3.8-flash
---

# Gemini 3.7 Flash

## Reasoning / Thinking
- Typ: **String-Enum, kein Token-Budget**. `thinking_level` mit `low | medium | high`; Default ist `medium`. `minimal` ist hier ungültig („`minimal` is not supported and returns an error"). Bedeutung laut Doku: `low` = kürzere Time-to-Answer für latenzkritische Fälle, `medium` = beste Qualität für die meisten Aufgaben, `high` = maximales Denken und maximale Tool-Nutzung, mit höherem Tokenverbrauch und höheren Kosten.
- Familien-Bruch beachten: Der `medium`-Default für 3.7 Flash steht in „What's new in Gemini 3.7 Flash" und auf der Model Card. Die Formulierung „The default thinking effort is now `medium`, changed from `high` in Gemini 3 Flash Preview" stammt aus dem Gemini-3.5-Flash-Guide und nennt 3.7 Flash nicht selbst. Andere 3.x-Modelle defaulten weiter auf `high` (Gemini 3.1 Pro, Gemini 3 Flash) bzw. `minimal` (Gemini 3.1 Flash-Lite).
- `thinking_budget` ist Legacy: Die Gemini-3-Checklisten ersetzen es durch das String-Enum `thinking_level`. Es wird in Gemini 3 aus Rückwärtskompatibilität noch akzeptiert, darf aber nicht zusammen mit `thinking_level` im selben Request stehen (400-Fehler); Level sind relative Allowances, keine Token-Garantien.
- Reasoning-State läuft über **Thought Signatures** (verschlüsselte Repräsentationen des internen Reasonings). Auf dem Legacy-`generateContent` muss die vollständige, unveränderte History inklusive Thought Signatures zurückgeschickt werden; die Interactions API erledigt das automatisch (`previous_interaction_id`).

## Prompting-Stil
- **Kurz und direkt**: „Be concise. Gemini 3.x responds best to direct, clear instructions." Ausdrückliche Warnung: „Verbose or complex prompt engineering techniques designed for older models may cause the model to over-analyze."
- Kein handgeschriebenes Chain-of-Thought — stattdessen `thinking_level: "medium"`/`"high"` mit einfacherem Prompt.
- Bei Long-Context/großen Datenmengen die konkrete Frage bzw. Instruktion **ans Ende nach dem Datenblock** stellen (Anker wie „Based on the preceding information...").
- Function Calling: Inline-Anweisungen in Function-Responses mit `\n\n` formatieren — die Doku führt diese Regel unter „Audit function calling", nicht als allgemeine Prompt-Regel.
- Sampling: Für Gemini 3 empfiehlt Google den Temperature-Default `1.0` („may lead to unexpected behavior, such as looping or degraded performance"). Seit Gemini 3.6 Flash gelten `temperature`, `top_p` und `top_k` für diese und alle folgenden Modelle als „deprecated and ignored" — also aus der Generation-Config entfernen.
- Ton: „By default, Gemini 3 and 3.1 is less verbose and prefers direct, efficient answers." — konversationellen Stil explizit anfordern (Familien-Aussage; für 3.7 Flash nicht separat bestätigt). Für dichte Dokumente `media_resolution` pro Item setzen (`low|medium|high|ultra_high`); die Doku rät, bei PDFs `media_resolution_high` gegenzutesten („test the new `media_resolution_high` setting to ensure continued accuracy").

## Stärken & Schwächen (prompt-relevant)
- Stärken: „Significantly higher quality on real-world software engineering and agentic benchmarks, improving issue resolution and reducing failed agent loops"; „higher-fidelity desktop and web application code directly from design mocks, with strong gains in design adherence". Model Card: 43,6 % auf FrontierCode 1.1, 97,0 % auf GDM-MRCR v2 (8-needle) bei 128k Kontext; Zielprofil agentische Workflows, Coding, Enterprise-Automation. Knowledge Cutoff: März 2026.
- Schwächen/Eigenheiten: allgemeine Foundation-Model-Limits inkl. Halluzinationen; „occasional slowness or timeout issues"; einzelne Domänen nur bis Januar 2025 abgedeckt; Jailbreak-Resistenz laut Google noch in Arbeit.
- Modalitäts-Lücken: keine Bildgenerierung, keine Audiogenerierung, Live API „Not supported". Bild-Segmentierung (Pixel-Masken) ist laut Google „not supported in Gemini 3.x" — Segmentierungs-Workloads nicht auf Gemini 3.x migrieren (Gemini 2.5 ist hier legacy; Segmentierungsunterstützung des Ziels vorab prüfen). Google selbst empfiehlt dafür weiter Gemini 2.5 Flash mit abgeschaltetem Thinking, das seit 18.09.2026 aber nur noch Bestandsnutzern offensteht.

## Output- & Format-Konventionen
- **Deprecated seit 08.10.2026** (GA war 13.08.2026): „API requests to `gemini-3.7-flash` are automatically routed to `gemini-3.8-flash`"; der Endpoint wird nicht abgeschaltet, ist in Google AI Studio aber nicht mehr auswählbar. Ein Prompt mit Ziel `gemini-3.7-flash` wird faktisch von 3.8 Flash ausgeführt. Kontext: **1.048.576 Input-Tokens**, **65.536 Output-Tokens** (Doku-Kurzform: „a 1M token context window, 64k max output tokens").
- Input: Text, Bild, Video, Audio, PDF — Output: nur Text. Unterstützt: Structured Outputs, Function Calling, Caching, Code Execution, Search Grounding, URL Context, File Search, Maps-Grounding, Computer Use (Preview), Batch/Flex/Priority. Nicht unterstützt: Live API, Image-Gen, Audio-Gen.
- Structured Outputs lassen sich mit Built-in-Tools kombinieren: „Gemini 3 models allow you to combine Structured Outputs with built-in tools, including Grounding with Google Search, URL Context, Code Execution, and Function Calling." (Familien-Aussage für Gemini 3, nicht 3.7-Flash-spezifisch formuliert).
- **Kein Assistant-Prefill**: Seit Gemini 3.6 Flash liefert ein Request, der mit einem nicht-leeren `model`-Turn endet, einen 400-Fehler; `candidate_count` ist ab Gemini 3 nicht unterstützt. Gewünschte Ausgabeform über Response-Schema oder System-Instruktion erzwingen.
- Historisch (die Preisseite listet 3.7 Flash nicht mehr): Start laut Changelog mit Einführungspreis bis 31.12.2026; die konkreten Werte (Input $0.75 / Output $3.75 pro 1 Mio. Tokens, danach $1.50 / $7.50) sind offiziell nicht mehr nachprüfbar (unbelegt).

## Migrations-Hinweise
- **Status-Caveat**: deprecated seit 08.10.2026, ersetzt durch `gemini-3.8-flash`; alle API-Requests auf `gemini-3.7-flash` werden automatisch dorthin geroutet. Kein Shutdown-Datum, der Endpoint bleibt erreichbar.
- **VON gemini-3.7-flash weg**: explizites Step-by-step-/CoT-Scaffolding wieder ergänzen; `thinking_level` in den Effort-/Budget-Knopf des Zielmodells übersetzen; Temperature wieder explizit setzen (der 1.0-Default ist keine portable Annahme); Thought-Signature-Plumbing entfernen; Konversationsverlauf client-seitig materialisieren, da `previous_interaction_id` keine Entsprechung hat; Prefill ist anderswo wieder erlaubt. Zu `gemini-3.8-flash` ist es im Kern nur der Model-String, weil 3.7-Requests bereits dort laufen.
- **ZU gemini-3.7-flash migrieren**: Nicht mehr als Ziel wählen — Requests landen auf `gemini-3.8-flash`; direkt dorthin migrieren. Für Bestandsprompts gilt: `temperature`/`top_p`/`top_k` entfernen; `thinking_budget` → `thinking_level` (ein 2.5-Nullbudget wird `low`, **nicht** `minimal`); `candidate_count` entfernen; Prefill-Turns in Instruktion oder Response-Schema umschreiben; Multi-Turn auf `previous_interaction_id` (Interactions API, `store=true`) standardisieren; verbose Prompts entschlacken und CoT in `thinking_level` auflösen; dichte PDFs mit `media_resolution_high` nachtesten; Function Calling prüfen — multimodale Inhalte gehören *in* die Function-Response-Parts, Inline-Anweisungen dort mit `\n\n` formatieren, und Thought Signatures aus dem Tool-Turn müssen zurückgegeben werden. Bild-Segmentierungs-Prompts nicht hierher migrieren.

## Quellen
- https://ai.google.dev/gemini-api/docs/models — offizielle Modellliste; listet 3.7 Flash seit der Deprecation nicht mehr, 3.8 Flash als neueste Flash-Version.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.7 — „What's new in Gemini 3.7 Flash" (als Referenz erhalten, mit Deprecation-Hinweis): thinking_level-Werte + `medium`-Default, Bedeutung der Stufen, Coding-/Agentic-/Web-Design-Verbesserungen, „a 1M token context window, 64k max output tokens".
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6#api-changes-and-parameter-updates — API-Änderungen ab 3.6 Flash „and all future Gemini model releases": Sampling-Parameter „deprecated and ignored", Prefill-Turn → 400, `candidate_count` „unsupported in Gemini 3 and later".
- https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash — Modellseite: trägt seit 10/2026 den Deprecated-Hinweis mit Auto-Routing auf `gemini-3.8-flash`; 1.048.576 Input / 65.536 Output, Modalitäten, Capability-Liste, Live API nicht, „`minimal` is not supported and returns an error".
- https://deepmind.google/models/model-cards/gemini-3-7-flash/ — DeepMind Model Card: veröffentlicht 13.08.2026; Knowledge Cutoff März 2026 (einzelne Domänen Januar 2025), 1M in / 64K out, FrontierCode 1.1 43,6 %, GDM-MRCR v2 (8-needle) @128k 97,0 %, dokumentierte Limitationen (Halluzinationen, „occasional slowness or timeout issues", „we are continually working to improve jailbreak resistance").
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5 — Gemini-3.5-Flash-Guide (Familienebene, nennt 3.7 Flash nicht namentlich): „The default thinking effort is now `medium`, changed from `high` in Gemini 3 Flash Preview", Kürze-Guidance („Be concise. Gemini 3.x responds best to direct, clear instructions."), Verbositäts- und Long-Context-Regel, media_resolution-Stufen, vollständige unveränderte History inkl. Thought Signatures auf `generateContent`, „Image segmentation is not supported in Gemini 3.x".
- https://ai.google.dev/gemini-api/docs/latest-model — Gemini-3.8-Flash-Guide: Migrations-Checkliste mit `thinking_budget` → `thinking_level` und der `\n\n`-Regel unter „Audit function calling".
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — `thinkingBudget` „accepted for backwards compatibility" in Gemini 3, Default-Level je Modell (3.1 Pro `high`, 3 Flash `high`, 3.1 Flash-Lite `minimal`).
- https://ai.google.dev/gemini-api/docs/migrate-to-interactions — Interactions API als empfohlene Oberfläche („we recommend the Interactions API for all new development"), `previous_interaction_id` und `store=true`-Semantik.
- https://ai.google.dev/gemini-api/docs/gemini-3 — Familien-Guidance: Temperature-Default 1.0, 400-Fehler bei `thinking_level` + `thinking_budget`, Gemini-2.5-Migrationspunkte inkl. `media_resolution_high`-Gegentest, Structured Outputs kombinierbar mit Built-in-Tools, fehlende Bild-Segmentierung („not supported in Gemini 3 Pro or Gemini 3 Flash").
- https://ai.google.dev/gemini-api/docs/changelog — 13.08.2026 GA von 3.7 Flash mit Einführungspreis bis 31.12.2026; 08.10.2026 Deprecation mit automatischem Routing auf `gemini-3.8-flash`; 18.09.2026 Zugangsbeschränkung der 2.5-Modelle auf Bestandsnutzer.
- https://ai.google.dev/gemini-api/docs/deprecations — `gemini-3.7-flash` (Release 13.08.2026), Ersatz `gemini-3.8-flash`, „the endpoint is not shutting down and automatically routes API requests to `gemini-3.8-flash`".

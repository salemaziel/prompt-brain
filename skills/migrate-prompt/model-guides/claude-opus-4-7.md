---
model: claude-opus-4-7
vendor: Anthropic
family: Claude
aliases: [opus-4.7, claude-opus-4.7, opus4.7]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 4.7

## Reasoning / Thinking
- Typ: **adaptiv, per Default aus**. Ein Request ohne `thinking`-Feld läuft ohne Thinking; eingeschaltet wird es mit `thinking: {type: "adaptive"}`. `{type: "disabled"}` ist erlaubt. `thinking: {type: "enabled", budget_tokens: N}` ist entfernt und liefert 400.
- Tiefensteuerung über `output_config.effort`: `low | medium | high | xhigh | max`, Default `high`. Empfehlung des Herstellers: Start bei `xhigh` für Coding/Agentic, `high` als Minimum für die meisten intelligenzkritischen Workloads, `medium` für kostensensitive Routen, `max` nur bei messbarem Headroom (kann bei Structured-Output-Aufgaben zu Overthinking führen).
- Opus 4.7 hält sich strenger an effort als Opus 4.6, besonders bei `low`/`medium`: Es beschränkt die Arbeit auf das Verlangte. Bei flachem Reasoning effort erhöhen statt per Prompt gegenzusteuern; muss effort niedrig bleiben, gezielt ergänzen: „This task involves multistep reasoning. Think carefully before responding."
- `thinking.display` ist standardmäßig `"omitted"` (leere Thinking-Felder, nur `signature`) — eine stille Änderung gegenüber Opus 4.6, wo zusammengefasstes Thinking der Default war. Für lesbare Zusammenfassungen `display: "summarized"` setzen.
- Interleaved Thinking ist mit adaptivem Thinking automatisch (kein Beta-Header); Reasoning zwischen Tool-Calls erscheint immer in Thinking-Blöcken.
- Sampling-Parameter: nicht-default `temperature`/`top_p`/`top_k` liefern auf jedem Request 400, auch ohne Thinking (`top_p: 1` ebenso, und `temperature` plus `top_p` zusammen selbst auf Default-Werten).
- Bei `xhigh`/`max` ein großes `max_tokens` setzen (Startwert 64k); es begrenzt Thinking plus Antworttext.

## Prompting-Stil
- **effort vor Prompt-Tricks**: Tiefe primär über effort regeln; Prompt-Anweisungen nur ergänzend, wenn effort aus Latenzgründen niedrig bleiben muss.
- **Progress-Scaffolding streichen**: Opus 4.7 liefert in langen Agentic-Traces von sich aus regelmäßigere, bessere Zwischenstände. Erzwungene Status-Choreografie („After every 3 tool calls, summarize progress") entfernen.
- **Kein Assistant-Prefill** (400 seit Opus 4.6) — stattdessen Structured Outputs oder System-Prompt-Anweisung.
- **Forced Tool Use** (`tool_choice` `any`/`tool`) wird akzeptiert, die Antwort beginnt dann aber ohne Thinking-Block mit dem Tool-Call. Soll das Modell vorher nachdenken: `tool_choice: {type: "auto"}` und im Prompt sagen, wann das Tool zu nutzen ist.
- **Keine Mid-Conversation-System-Messages**: `role: "system"` im `messages`-Array liefert auf Opus 4.7 400. Anweisungen gehören in den Top-Level-`system`-Prompt oder in einen User-Turn.
- **Cyber-Safeguards**: Seit Opus 4.7 können Anfragen zu verbotenen oder hochriskanten Security-Themen abgelehnt werden. Für legitime Security-Arbeit (Pentesting, Red-Teaming) verweist Anthropic auf das Cyber Verification Program.
- Eine modellspezifische Prompting-Seite für Opus 4.7 führt Anthropic nicht; Aussagen zu Verbosity oder Tool-Triggering speziell von 4.7 sind daher (unbelegt). Es gelten die allgemeinen Best Practices, die Opus 4.7 ausdrücklich abdecken.

## Stärken & Schwächen (prompt-relevant)
- Stärken: erstes Claude-Modell mit High-Resolution-Bildern (max. 2.576 px lange Kante statt 1.568 px) — Gewinne bei Computer Use, Screenshot-Verständnis und Dokumentanalyse; Pointing-/Bounding-Box-Koordinaten sind 1:1 Bildpixel (keine Skalierungsumrechnung).
- Strikte effort-Treue: bei `low`/`medium` präzise auf den Auftrag begrenzt (gut für Latenz/Kosten), bei komplexen Aufgaben auf niedrigem effort aber Risiko von zu flachem Reasoning.
- Grenzen: kein Fast Mode (`speed: "fast"` → Fehler); weder `computer_toolset_20260801` noch das Browser-Use-Tool, wohl aber `computer_20251124`. Reliable Knowledge Cutoff Januar 2026.

## Output- & Format-Konventionen
- 1M Kontextfenster, 128K Output-Tokens synchron; über die Message-Batches-API bis 300K mit Beta-Header `output-300k-2026-03-24`. Input Text und Bilder, Output Text.
- **Neuer Tokenizer** (eingeführt mit Opus 4.7): gegenüber älteren Modellen etwa 1×–1,35× so viele Tokens für denselben Text (inhaltsabhängig); 1M Tokens entsprechen rund 555k Wörtern statt rund 750k.
- Volle Bildauflösung kostet bis zu etwa 3× mehr Bild-Tokens (bis 4.784 statt rund 1.600 pro Bild) — `max_tokens` und Kosten budgetieren oder vorher herunterskalieren.
- Kein Prefill; feste Formate über Structured Outputs (`output_config.format`) oder System-Prompt.
- Ablehnungen kommen als `stop_reason: "refusal"` mit `stop_details`-Objekt (Kategorie); Stop-Reason-Handling sollte `stop_details` lesen.

## Migrations-Hinweise
- **Lifecycle**: Legacy, Status Active; Retirement nicht vor dem 16. April 2027. Anthropic empfiehlt die Migration zu Claude Opus 5.5.
- **VON Opus 4.7 zu Opus 5.5**: Modell-ID tauschen; Thinking ist dort immer an (`disabled` und `budget_tokens` → 400), `max_tokens` deckt Thinking plus Text — bei bisher thinking-freien Routen neu bemessen; effort-Default sinkt auf `medium`, Stufen sind neu kalibriert → frischen effort-Sweep fahren; `tool_choice` `any`/`tool` wird abgelehnt → `auto` plus Strict Tool Use oder Structured Outputs; Context-Window-Beta-Header entfernen; History-Rebuilds für Anweisungsänderungen durch Mid-Conversation-System-Messages ersetzen; Text zwischen Tool-Calls kommt in Thinking-Blöcken; `refusal`-Handling für zusätzliche Kategorien (u. a. `reasoning_extraction`) erweitern.
- **VON Opus 4.7 zu älteren Modellen** (4.6/4.5): auf Opus 4.6 ist `budget_tokens` noch funktionsfähig, aber deprecated; Opus 4.5 kennt nur Extended Thinking (`adaptive` → 400), hat 200K Kontext/64K Output und kein `xhigh`. Prefill ist erst vor Opus 4.6 wieder möglich (dann nur ohne aktives Thinking).
- **ZU Opus 4.7 migrieren** (von 4.6 oder älter): `budget_tokens` → `thinking: {type: "adaptive"}` plus effort (effort-Sweep statt Budget-Übersetzung); `temperature`/`top_p`/`top_k` entfernen; bei UI-Anzeige von Thinking `display: "summarized"` setzen; `max_tokens`, Compaction-Trigger und clientseitige Token-Schätzungen für den neuen Tokenizer anpassen; Bild-Token-Budget erhöhen, Koordinaten-Skalierung entfernen; Progress-Scaffolding streichen. Von 4.5 zusätzlich: Prefills entfernen, Tool-Call-`input` nur per JSON-Parser lesen.

## Quellen
- https://platform.claude.com/docs/en/models/opus-4-7/overview — Legacy-Status, Model-ID `claude-opus-4-7`, 1M Kontext, 128K Output (300K Batch-Beta), Thinking „Adaptive", effort-Default `high`, Knowledge Cutoff Jan 2026, Retirement nicht vor 16.04.2027, Migrationsempfehlung zu Opus 5.5.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-47 — was sich nach Opus 4.7 ändert (effort-Rekalibrierung, 1M ohne Beta-Header, Mid-Conversation-System-Messages auf 4.7 → 400, `stop_details`, kein Fast Mode, kein Computer-Use-Toolset), plus Breaking Changes und Verhaltensänderungen ab Opus 4.7 (Thinking-Display, Tokenizer 1×–1,35×, Progress-Updates, Cyber-Safeguards, High-Res-Bilder).
- https://platform.claude.com/docs/en/about-claude/model-deprecations — Status Active, Retirement „Not sooner than April 16, 2027"; Parametertabelle: `temperature`/`top_p`/`top_k` auf Claude 4.7+ → 400.
- https://platform.claude.com/docs/en/about-claude/models/overview — Opus 4.7 in der Liste „Legacy models (still available)"; Tokenizer seit Opus 4.7 (555k vs. 750k Wörter pro 1M Tokens).
- https://platform.claude.com/docs/en/build-with-claude/effort — effort-Stufen inkl. `xhigh`/`max` für Opus 4.7, Default `high`, Empfehlungstabelle, strengere effort-Treue als 4.6, `max_tokens` ≥ 64k bei `xhigh`/`max`.
- https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting — Opus 4.7: nur adaptiv, Default aus, `enabled` → 400.
- https://platform.claude.com/docs/en/build-with-claude/thinking — `display`-Default `omitted`, Interleaved Thinking automatisch, Sampling-Parameter-Regeln, Prefill-/Forced-Tool-Use-Verhalten.

---
model: claude-opus-4-8
vendor: Anthropic
family: Claude
aliases: [opus-4.8, claude-opus-4.8, opus4.8, opus-4-8]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 4.8

## Reasoning / Thinking
- Typ: **adaptiv, per Default aus**. Ohne `thinking`-Feld läuft der Request ohne Thinking; `thinking: {type: "adaptive"}` schaltet es ein, `{type: "disabled"}` ist erlaubt (kein Thinking). `thinking: {type: "enabled", budget_tokens: N}` liefert 400.
- Tiefensteuerung über `output_config.effort`: `low | medium | high | xhigh | max`, Default `high`. Start mit `xhigh` für Coding-/Agentic-Fälle, mindestens `high` für intelligenzkritische Aufgaben; `medium`/`low` erst, wenn Evals die Qualität bestätigen. `max` kann zu Overthinking neigen. Effort ist laut Doku für dieses Modell wichtiger als für jedes frühere Opus.
- Hält effort strikt ein, besonders am unteren Ende: bei `low`/`medium` bleibt es beim Angefragten; auf mittelschweren Aufgaben bei `low` Risiko von Under-Thinking → effort anheben statt herumzuprompten (nur bei Latenzzwang ein gezielter Hinweis auf mehrstufiges Reasoning).
- Adaptives Thinking-Triggering ist steuerbar: bei großen, komplexen System-Prompts denkt das Modell ggf. öfter als gewünscht — Hinweis ergänzen, nur bei mehrstufigen Problemen zu denken und sonst direkt zu antworten.
- `thinking.display` ist standardmäßig `"omitted"` (leere Thinking-Blöcke). Für sichtbare Zusammenfassungen `display: "summarized"` setzen.
- Nicht-Default-Werte für `temperature`/`top_p`/`top_k` liefern auf jedem Request 400 — Steuerung über Prompt + effort.
- Bei `xhigh`/`max` großes `max_tokens` setzen (Start bei 64k), damit über Subagenten und Tool-Calls Platz zum Denken bleibt.

## Prompting-Stil
- Läuft laut Doku ohne Änderung gut auf bestehenden Opus-4.7-Prompts; API-seitig kamen seit 4.7 nur 1M-Kontext als Default und Mid-Conversation-System-Messages hinzu.
- Kalibriert die Antwortlänge an der wahrgenommenen Aufgabenkomplexität (kurz bei einfachen Lookups, lang bei offener Analyse). Wo das Produkt eine feste Länge braucht, eine Concise-Instruktion ergänzen; positive Beispiele wirken besser als Verbote.
- Liefert regelmäßigere, hochwertigere Fortschritts-Updates in langen Agentic-Läufen. Vorhandenes „after every N tool calls"-Scaffolding entfernen; bei Bedarf Länge/Inhalt der Updates explizit beschreiben und Beispiele geben.
- Interpretiert Prompts wörtlich (besonders bei niedrigem effort), generalisiert Anweisungen nicht stillschweigend auf andere Fälle und leitet keine ungestellten Anforderungen ab — Geltungsbereich explizit angeben („auf jeden Abschnitt anwenden, nicht nur den ersten").
- Bevorzugt Reasoning gegenüber Tool-Calls und startet per Default weniger Subagenten. Höherer effort (`high`/`xhigh`) erhöht die Tool-Nutzung; zusätzlich im Prompt erklären, wann und warum ein Tool (z. B. Web-Suche) zu nutzen ist, und explizit regeln, wann Subagenten sinnvoll sind.
- Interaktive Coding-Produkte: Aufgabe, Intent und Constraints im ersten User-Turn vollständig angeben — das Modell ist autonomer als Vorgänger und denkt nach jedem User-Turn mehr; schrittweise nachgereichte Spezifikationen kosten Tokens und teils Qualität.
- Mid-Conversation-System-Messages (kein Beta-Header nötig): `{"role":"system"}` direkt nach einem User-Turn in `messages[]` anhängen statt den Top-Level-System-Prompt zu ändern (erhält den Prompt-Cache); Claude API, Amazon Bedrock, Google Cloud.
- Frontend: persistenter Default-Hausstil (cremefarbener Hintergrund, Serif-Display-Schrift, Terrakotta-/Amber-Akzent). Generische Gegenanweisungen verschieben nur die Palette — eine konkrete Alternative spezifizieren oder vorab mehrere Richtungen vorschlagen lassen.

## Stärken & Schwächen (prompt-relevant)
- Stärken laut Doku: lange Agentic-Läufe, Knowledge-Work, Vision und Memory-Aufgaben; zum Release besser in der Bug-Findung als frühere Modelle (höherer Recall und höhere Precision in internen Evals).
- Prosa: direkter, meinungsstarker Stil mit wenig Validierungs-Floskeln und sparsamem Emoji-Einsatz — braucht das Produkt eine wärmere Stimme, den Ton explizit vorgeben.
- Schwächen/Eigenheiten: hält effort strikt ein (bei `low`/`medium` Under-Thinking-Risiko auf mittelschweren Aufgaben); Unter-Nutzung von Tools/Subagenten ohne explizite Trigger; in interaktiven Multi-Turn-Sessions höherer Token-Verbrauch als in autonomen Single-Turn-Läufen.
- Code-Review: folgt „nur High-Severity"-/„be conservative"-Filtern wörtlich → gemessener Recall kann sinken. „Alles melden (mit Confidence und Severity), Filterung in einem separaten Schritt"-Muster nutzen oder die Schwelle konkret benennen.

## Output- & Format-Konventionen
- Assistant-Prefill (letzter Assistant-Turn) liefert 400 — stattdessen Structured Outputs (`output_config.format`) oder System-Prompt-Anweisung.
- 1M Kontextfenster als Default (kein Beta-Header), bis 128K Output-Tokens; über die Message-Batches-API bis 300K mit Beta-Header `output-300k-2026-03-24`. Das SDK verlangt Streaming ab `max_tokens` > 21.333 (`.stream()` / `get_final_message()`).
- Tool-Call-`input` mit einem Standard-JSON-Parser lesen, kein Raw-String-Matching.
- Tokenizer wie Opus 4.7: gegenüber Modellen vor Opus 4.7 rund 1×–1,35× so viele Tokens für denselben Text.
- Preise pro MTok: Input $5, Output $25, 5m-Cache-Write $6.25, 1h-Cache-Write $10, Cache-Read $0.50; Batch 50 % Rabatt. Minimal cachebares Prefix: **1024 Tokens**. Reliable Knowledge Cutoff Jan 2026.
- Computer Use: `computer_toolset_20260801` (Claude API, Google Cloud) und das ältere `computer_20251124`; auf Claude API und Google Cloud zusätzlich das Browser-Use-Tool. Bilder bis 2576px / 3,75 MP; 1080p gilt laut Doku als gute Balance aus Leistung und Kosten.
- Model IDs: `claude-opus-4-8` (Claude API, Google Cloud, Microsoft Foundry, Claude Platform on AWS), Bedrock `anthropic.claude-opus-4-8`.

## Migrations-Hinweise
- **Lifecycle**: laut Anbieter Legacy (Status *Active (legacy)*, Retirement nicht vor dem 28. Mai 2027); Anthropic empfiehlt die Migration zu Claude Opus 5.5 (`claude-opus-5-5`).
- **VON Opus 4.8 weg (zu Opus 5.5)**: Requests ohne `thinking`-Feld denken dort immer — `max_tokens` (Thinking plus Text) und Output-Kosten neu bemessen; `thinking: {type: "disabled"}`, forcierte `tool_choice` (`any`/`tool`) und auf Claude API/Google Cloud `computer_20251124` liefern 400; effort-Default sinkt auf `medium` (explizit setzen, neu sweepen); Cache-Minimum sinkt auf 512 Tokens; Priority Tier entfällt; Text zwischen Tool-Calls kommt als `thinking`-Block statt als `text`.
- **VON Opus 4.8 weg (zu anderen/älteren Modellen)**: ggf. wieder präskriptiveres Scaffolding und explizites Step-by-step ergänzen; Prefill nur zurückbauen, wenn der Ziel-Guide es erlaubt; `effort`/`xhigh` ggf. nicht verfügbar → Tiefe per Prompt steuern.
- **ZU Opus 4.8 migrieren**: Von Opus 4.7 genügt der Modell-ID-Tausch plus Prompt-Re-Tuning; Instruktions-Updates können auf Mid-Conversation-System-Messages umgestellt werden (Opus 4.7 lehnt `role: "system"` in `messages` mit 400 ab), Kontext-Beta-Header entfernen. Von 4.6/älter zusätzlich: `budget_tokens` → adaptives Thinking + effort, `temperature`/`top_p`/`top_k` entfernen, Prefills entfernen, Kosten und `max_tokens` für den neuen Tokenizer und hochauflösende Bilder (bis ca. 3× Bild-Tokens) neu kalibrieren. Dann Verhalten: Concise-Instruktion bei Längenbedarf, Progress-Scaffolding streichen, Tool-/Subagenten-Trigger explizit machen, effort bei `xhigh` starten, Stil-Prompts gegen den direkteren Ton prüfen.

## Quellen
- https://platform.claude.com/docs/en/models/opus-4-8/overview — id `claude-opus-4-8` und Plattform-IDs, 1M Kontext, 128K Output / 300K Batch-Beta, $5/$25 plus Cache-Preise, Thinking „Adaptive", Default-Effort `high`, Knowledge Cutoff Jan 2026, Status *Active (legacy)*, Retirement nicht vor 28.5.2027, Empfehlung zur Migration auf Opus 5.5.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8 — läuft auf Opus-4.7-Prompts, Längenkalibrierung nach Komplexität, Effort-Empfehlungen und strikte Effort-Einhaltung (Under-Thinking bei `low`), steuerbares Thinking-Triggering, Reasoning vor Tool-Calls, weniger Subagenten, regelmäßigere Progress-Updates, wörtliches Instruction-Following, direkter Prosastil, interaktive Coding-Produkte („more autonomous than prior models"), Code-Review-Severity-Filter, Frontend-Hausstil, Computer Use.
- https://platform.claude.com/docs/en/build-with-claude/effort — Effort-Stufen inkl. `xhigh`/`max`, Default `high`, Opus-4.8-Empfehlung (Start `xhigh` für Coding/Agentic), 64k `max_tokens` bei `xhigh`/`max`.
- https://platform.claude.com/docs/en/build-with-claude/thinking — Modelltabelle (ohne Feld Thinking aus, `adaptive` an, `budget_tokens` 400, `disabled` aus), `display`-Default `omitted`, Sampling-Parameter → 400, Prefill → 400 ab Claude 4.6, Streaming-Pflicht im SDK ab `max_tokens` > 21.333.
- https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages — kein Beta-Header nötig, Opus 4.8 unterstützt (Claude API, Amazon Bedrock, Google Cloud), Platzierungsregeln.
- https://platform.claude.com/docs/en/build-with-claude/context-windows — 1M als Default ohne Beta-Header für Opus 4.8.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-4-8 — Weg von Opus 4.8 zu Opus 5.5 (Thinking auf Requests ohne Feld, 512 statt 1024 Cache-Minimum, Priority Tier), Abschnitte zu Opus 4.7 (Mid-Conversation-System-Messages, Kontext-Header) und 4.6 und älter (Sampling, `budget_tokens`, Prefill, Tokenizer 1×–1,35×, High-Res-Bilder, JSON-Parsing der Tool-Inputs).

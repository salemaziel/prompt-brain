---
model: claude-opus-4-5
vendor: Anthropic
family: Claude
aliases: [opus-4.5, claude-opus-4.5, opus4.5, claude-opus-4-5-20251101]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 4.5

## Reasoning / Thinking
- Typ: **nur Extended Thinking, per Default aus**. Eingeschaltet wird es manuell mit `thinking: {type: "enabled", budget_tokens: N}`; `thinking: {type: "adaptive"}` liefert 400.
- Opus 4.5 ist das einzige Extended-Thinking-Modell mit `effort`-Parameter: effort und `budget_tokens` wirken zusammen — erst die effort-Stufe für die Aufgabe wählen, dann das Thinking-Budget nach benötigter Reasoning-Tiefe setzen. Default `high`; `xhigh` und `max` sind für Opus 4.5 nicht gelistet.
- `thinking.display` liefert standardmäßig zusammengefasstes Thinking (`"summarized"`).
- Interleaved Thinking (Denken zwischen Tool-Calls) braucht im manuellen Modus einen Beta-Header (`interleaved-thinking-2025-05-14`) und ändert die Budget-Zählung.
- Bei aktivem Thinking: `temperature`/`top_k` inkompatibel, `top_p` nur zwischen 0,95 und 1; Forced Tool Use (`tool_choice` `any`/`tool`) nicht möglich, nur `auto`/`none`; kein Assistant-Prefill.
- **Ohne Extended Thinking** reagiert Opus 4.5 besonders empfindlich auf das Wort „think" und Varianten — Alternativen wie „consider", „evaluate" oder „reason through" verwenden.

## Prompting-Stil
- **Aggressive Sprache abmildern**: Opus 4.5 reagiert stärker auf den System-Prompt als frühere Modelle; gegen Undertriggering geschriebene Tool-/Skill-Anweisungen führen zu Overtriggering. „CRITICAL: You MUST use this tool when…" → „Use this tool when…".
- **Overengineering bremsen**: Tendenz zu Zusatzdateien, unnötigen Abstraktionen und ungefragter Flexibilität — Lösungen per Anweisung minimal halten.
- **Wortwahl bei abgeschaltetem Thinking**: „think" und Varianten in Prompts durch „consider", „evaluate" oder „reason through" ersetzen (s. o.).
- **Prefill ist erlaubt**, solange Thinking aus ist — ein Muster, das ab Opus 4.6 mit 400 abgelehnt wird.
- **Frontend-Vorgaben machen**: Ohne Design-Anweisungen greift das Modell zu generischen Mustern („AI slop"-Ästhetik); Typografie, Farben und Interaktionen explizit vorgeben.

## Stärken & Schwächen (prompt-relevant)
- Stärken: verbesserte Vision, besonders bei Bildverarbeitung und Datenextraktion mit mehreren Bildern; zuverlässigeres Lesen von Screenshots und UI-Elementen bei Computer Use; komplexe Web-Apps mit starkem Frontend-Design.
- Schwächen/Eigenheiten: Overtriggering bei zu nachdrücklicher Tool-Sprache, Overengineering, Empfindlichkeit für „think" ohne Thinking; kleineres Fenster als alle späteren Opus-Modelle.
- Reliable Knowledge Cutoff Mai 2025 (Training-Data-Cutoff August 2025).

## Output- & Format-Konventionen
- 200K Kontextfenster (rund 150k Wörter), 64K Output-Tokens; die 300K-Output-Beta der Batches-API gibt es für Opus 4.5 nicht. Input Text und Bilder, Output Text.
- Model-ID datiert: `claude-opus-4-5-20251101`; `claude-opus-4-5` ist ein Komfort-Alias, der auf die datierte ID zeigt. Google Cloud: `claude-opus-4-5@20251101`; Bedrock nur über InvokeModel (`anthropic.claude-opus-4-5-20251101-v1:0`).
- Tokenizer der Generation vor Opus 4.7: derselbe Text braucht ab Opus 4.7 bis zu ~35 % mehr Tokens.
- Structured Outputs über `output_config.format`; das ältere `output_format` ist deprecated und braucht den Beta-Header `structured-outputs-2025-11-13`, sonst 400.
- Der `effort`-Parameter braucht keinen Beta-Header mehr (`effort-2025-11-24` kann entfallen).

## Migrations-Hinweise
- **Lifecycle**: Legacy, Status Active; Retirement nicht vor dem 24. November 2026 — das früheste Datum der noch verfügbaren Opus-Modelle. Anthropic empfiehlt die Migration zu Claude Opus 5.5.
- **VON Opus 4.5 zu Opus 4.6+/Opus 5.5**: Assistant-Prefills entfernen (ab 4.6 → 400) und durch Structured Outputs oder System-Prompt ersetzen; Tool-Call-`input` per JSON-Parser lesen (geändertes Escaping ab 4.6); von `client.beta.messages.create()` auf `client.messages.create()` wechseln; Beta-Header `effort-2025-11-24`, `fine-grained-tool-streaming-2025-05-14` und `interleaved-thinking-2025-05-14` entfernen; `output_format` → `output_config.format`; `budget_tokens` → adaptives Thinking plus effort (ab 4.7 Pflicht). Danach alle Schritte ab Opus 4.6 (Sampling-Parameter, Thinking-Display, Tokenizer, Bild-Tokens) und für Opus 5.5 Thinking-immer-an, effort-Default `medium` und Verbot von Forced Tool Use.
- **ZU Opus 4.5 migrieren** (von neueren Modellen): adaptives Thinking durch `thinking: {type: "enabled", budget_tokens: N}` ersetzen und effort höchstens auf `high` setzen; Prompts und Outputs auf 200K Kontext/64K Output zuschneiden; bei aktivem Thinking Forced Tool Use, Prefill und Nicht-Default-`temperature`/`top_k` vermeiden; „think" in Prompts ohne Thinking umformulieren.

## Quellen
- https://platform.claude.com/docs/en/models/opus-4-5/overview — Legacy-Status, Model-ID `claude-opus-4-5-20251101` mit Alias `claude-opus-4-5`, Plattform-IDs, 200K Kontext, 64K Output, Thinking „Extended", effort-Default `high`, Knowledge Cutoff Mai 2025, Retirement nicht vor 24.11.2026, Migrationsempfehlung zu Opus 5.5.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-45 — Breaking Changes ab 4.5 (Prefill, Tool-Parameter-Escaping) und empfohlene Schritte (adaptives Thinking, Beta-Namespace und Beta-Header entfernen, `output_config.format`).
- https://platform.claude.com/docs/en/about-claude/model-deprecations — `claude-opus-4-5-20251101` Status Active, Retirement „Not sooner than November 24, 2026".
- https://platform.claude.com/docs/en/about-claude/models/overview — Opus 4.5 in der Liste „Legacy models (still available)"; Alias vor der 4.6-Generation als Komfort-Pointer auf die datierte ID; 200K Tokens ≈ 150k Wörter.
- https://platform.claude.com/docs/en/build-with-claude/effort — Opus 4.5 als einziges Extended-Thinking-Modell mit effort, Zusammenspiel mit `budget_tokens`, `xhigh`/`max` nicht für Opus 4.5 gelistet, kein Beta-Header nötig.
- https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting — Opus 4.5: nur Extended Thinking, Default aus, `adaptive` → 400.
- https://platform.claude.com/docs/en/build-with-claude/thinking — `display`-Default `summarized` auf älteren Modellen, Interleaved Thinking im manuellen Modus per Beta-Header, Sampling-/Prefill-/Forced-Tool-Use-Grenzen bei aktivem Thinking, 64K Output ohne Batch-Erweiterung.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices — Opus-4.5-spezifisch: „think"-Sensitivität ohne Extended Thinking, System-Prompt-Responsiveness/Overtriggering, Overengineering, Vision, Frontend-Design.

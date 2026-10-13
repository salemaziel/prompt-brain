---
model: claude-sonnet-4-6
vendor: Anthropic
family: Claude
aliases: [sonnet-4.6, claude-sonnet-4.6, sonnet4.6, sonnet-4-6]
last_verified: 2026-10-13
status: legacy
successor: claude-sonnet-5-5
---

# Claude Sonnet 4.6

## Reasoning / Thinking
- Typ: **adaptiv, aber per Default aus** — ein Request ohne `thinking`-Feld läuft ohne Thinking; einschalten mit `thinking: {type: "adaptive"}`. `{type: "enabled", budget_tokens: N}` ist deprecatet (für neuen Code nicht verwenden; für Altcode nur als transitionaler Token-Deckel), `{type: "disabled"}` schaltet Thinking ab.
- Tiefensteuerung über `output_config.effort`: `low | medium | high | max`, Default `high`. `max` wird unterstützt, `xhigh` jedoch nicht (in der Sonnet-Klasse erst ab Sonnet 5). Doku-Empfehlung: effort **explizit** setzen (sonst unerwartete Latenz), `medium` als empfohlener Default für die meisten Anwendungen inkl. agentischem Coding, `low` für Chat und hochvolumige/latenzkritische Workloads.
- Für Chat/Klassifikation: `thinking: {type: "disabled"}` + `effort: "low"` liefert vergleichbare oder bessere Performance bei niedriger Latenz. (unbelegt)
- `thinking.display` Default `"summarized"` (lesbare Zusammenfassung; Sonnet 5/5.5: `"omitted"`).
- Sampling: Einschränkungen nur bei aktivem Thinking — `temperature` und `top_k` sind dann inkompatibel, `top_p` nur zwischen 0.95 und 1; ohne Thinking sind Nicht-Default-Werte erlaubt (anders als ab Sonnet 5, wo sie immer 400 liefern).
- Per-Message-Effort und Mid-Conversation-System-Messages gibt es auf Sonnet 4.6 nicht; ein effort-Wechsel über den Top-Level-Wert startet den Prompt-Cache neu.

## Prompting-Stil
- Claude-4.6-Modelle sind proaktiver und können auf Anweisungen übertriggern, die für ältere Modelle nötig waren — Gründlichkeits- und Tool-Druck-Formulierungen („If in doubt, use [tool]", „CRITICAL: You MUST use this tool …") abmildern; bleibt das Verhalten zu aggressiv, effort senken.
- Zum Release: beste Balance aus Speed und Intelligenz, gut für hochvolumige Produktionsworkloads. (unbelegt)
- Tool-Call-`input` immer mit einem JSON-Parser lesen (Escaping kann abweichen), nie Raw-String-Match.

## Stärken & Schwächen (prompt-relevant)
- Stärken: 1M Kontextfenster; schnelle, kosteneffiziente Ausführung mit starker Instruktionsbefolgung. (unbelegt)
- Schwächen/Eigenheiten: bei höherem `effort` mehr Exploration/Tokens — `medium` ist laut Doku der empfohlene Default; übermäßige Tool-/Skill-Aktivierung bei zu aggressiven Prompts.

## Output- & Format-Konventionen
- Assistant-Prefill (letzter Assistant-Turn) liefert 400 — Structured Outputs (`output_config.format`) oder System-Prompt-Anweisung nutzen.
- 1M Kontextfenster, bis 128K Output-Tokens (synchrone Messages API); Message Batches API bis 300K mit Beta-Header `output-300k-2026-03-24`; für große Outputs streamen.
- `output_format` (top-level, deprecated) → `output_config.format`.
- Älterer Tokenizer: Sonnet 5 und 5.5 erzeugen für denselben Text rund 30 % mehr Tokens. Bilder bis 1568 px lange Kante bzw. 1.568 Tokens pro Bild. Minimal cachebarer Prompt 1.024 Tokens.
- Preis pro MTok: $3 Input / $15 Output, Cache-Read $0.30. Reliable Knowledge Cutoff August 2025.

## Migrations-Hinweise
- **VON Sonnet 4.6 weg**: zu Opus für die härtesten/längsten Aufgaben; zu Haiku für reine Speed/Kosten — Haiku 4.5 hat keinen `effort`-Parameter (dort entfernen), Haiku 5.5 unterstützt ihn. Zum Nachfolger Sonnet 5.5: Thinking läuft dort ohne `thinking`-Feld, `budget_tokens` und Nicht-Default-Sampling liefern 400, `display` defaultet auf `"omitted"`, Token-Zählungen steigen um ~30 % (Details im Sonnet-5.5-Guide).
- **ZU Sonnet 4.6 migrieren**: Von Sonnet 4.5 `effort` **explizit** setzen (4.6 defaultet auf `high` → höhere Latenz/Kosten sonst). `budget_tokens`→adaptive. `interleaved-thinking-2025-05-14` entfernen (adaptive interleavt automatisch), `fine-grained-tool-streaming-2025-05-14` durch `eager_input_streaming: true` pro Tool ersetzen; `effort-2025-11-24` entfernen (unbelegt). Von `client.beta.messages` auf `client.messages` zurückwechseln (unbelegt). Prefills entfernen. Aggressive Tool-Sprache abmildern.
- **Lifecycle**: Sonnet 4.6 ist *Legacy* (noch verfügbar, Status „Active (legacy)"); Anthropic empfiehlt die Migration zu Claude Sonnet 5.5 (`claude-sonnet-5-5`). Retirement nicht vor dem 17. Februar 2027 (Anthropic-Plattformen).

## Quellen
- https://platform.claude.com/docs/en/models/sonnet-4-6/overview — Sonnet 4.6: 1M Kontext, 128K Output (Batch-Beta 300K), adaptives Thinking (extended deprecated), Default-effort `high`, $3/$15, Cache-Read $0.30, Knowledge Cutoff Aug 2025, Status legacy, Migrationsempfehlung zu Sonnet 5.5, Retirement nicht vor 17.2.2027.
- https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide — Abschnitt „Migrating from Claude Sonnet 4.5 or earlier": Prefill → 400 (wie auf 4.6), Tool-Input mit JSON-Parser lesen, effort explizit setzen, `interleaved-thinking-2025-05-14` entfernen, `fine-grained-tool-streaming-2025-05-14` durch `eager_input_streaming: true` ersetzen, `output_format` → `output_config.format`; dazu die Thinking-Tabelle (4.6: ohne Feld aus, Default-`display` `"summarized"`), Cache-Minimum 1.024, ~30 % mehr Tokens und Bild-Limits 1568 px gegenüber Sonnet 5.5.
- https://platform.claude.com/docs/en/build-with-claude/effort — Effort-Stufen (max für Sonnet 4.6, kein xhigh); Abschnitt „Recommended effort levels for Claude Sonnet 4.6" (medium empfohlen, effort explizit setzen); Per-Message-Effort nicht auf Sonnet 4.6, Top-Level-Wechsel bricht den Cache; Modellliste mit Haiku 5.5, ohne Haiku 4.5.
- https://platform.claude.com/docs/en/build-with-claude/thinking — Konfigurationstabelle (Sonnet 4.6: ohne Feld kein Thinking, `enabled` deprecated, `disabled` möglich), `display`-Default `"summarized"`, Sampling-Regeln älterer Modelle, Prefill → 400 ab Claude 4.6.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices — „Migration considerations" (Claude-4.6-Modelle proaktiver, Übertriggern; Prefill-Ersatz) und Tool-Übertriggern-Beispiele („CRITICAL: You MUST …", „If in doubt …").
- https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages — Modellliste der Mid-Conversation-System-Messages (Sonnet 4.6 nicht enthalten).

---
model: claude-opus-4-6
vendor: Anthropic
family: Claude
aliases: [opus-4.6, claude-opus-4.6, opus4.6]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 4.6

## Reasoning / Thinking
- Typ: **adaptiv (Extended deprecated), per Default aus**. Ohne `thinking`-Feld kein Thinking; empfohlen ist `thinking: {type: "adaptive"}`. `thinking: {type: "enabled", budget_tokens: N}` funktioniert noch, ist aber deprecated; `{type: "disabled"}` ist erlaubt. Kein `thinking.type` wird mit 400 abgelehnt.
- Tiefensteuerung über `output_config.effort`: `low | medium | high | max`, Default `high`. `xhigh` ist für Opus 4.6 nicht gelistet.
- `thinking.display` ist standardmäßig `"summarized"`; die ersten Zeilen des Thinking-Outputs sind ausführlicher (für Prompt-Engineering nützlich).
- Mehr Vorab-Exploration als Vorgänger, besonders bei hohem effort: sammelt teils ungefragt viel Kontext oder verfolgt mehrere Recherchestränge; kann ausgiebig denken und so Thinking-Tokens und Latenz aufblähen. Gegenmittel: Reasoning per Anweisung begrenzen oder effort senken. Eine harte Kostenobergrenze via `budget_tokens` geht noch, ist aber deprecated — besser effort senken oder `max_tokens` als hartes Limit nutzen.
- Interleaved Thinking ist mit adaptivem Thinking automatisch (kein Beta-Header).
- Sampling-Parameter: Die 400-Regel für Nicht-Default-Werte gilt erst ab Claude 4.7. Auf Opus 4.6 gilt die Einschränkung nur bei aktivem Thinking: `temperature`/`top_k` sind dann inkompatibel, `top_p` nur zwischen 0,95 und 1.

## Prompting-Stil
- **Aggressive Sprache abmildern**: Opus 4.6 reagiert stärker auf den System-Prompt als frühere Modelle; gegen Undertriggering geschriebene Prompts führen zu Overtriggering. „CRITICAL: You MUST use this tool when…" → „Use this tool when…".
- **Gezielte statt pauschaler Defaults**: „Default to using [tool]" durch „Use [tool] when it would enhance your understanding of the problem" ersetzen; Over-Prompting wie „If in doubt, use [tool]" streichen.
- **Entscheidungsdisziplin**: Gegen ausuferndes Abwägen hilft eine Anweisung, einen Ansatz zu wählen und dabei zu bleiben, solange keine widersprechende Information auftaucht.
- **Sub-Agenten deckeln**: starke Neigung, Sub-Agenten auch dort zu starten, wo ein direkter Weg (z. B. ein `grep`) reicht — explizit sagen, wann Delegation sinnvoll ist und wann nicht.
- **Overengineering bremsen**: Tendenz zu Zusatzdateien, unnötigen Abstraktionen und ungefragter Flexibilität — Anweisung ergänzen, Lösungen minimal zu halten.
- **Riskante Aktionen absichern**: Ohne Vorgabe kann das Modell schwer umkehrbare Aktionen ausführen (Dateien löschen, Force-Push, Posten auf externen Diensten). Bestätigungspflicht für destruktive, schwer umkehrbare oder für andere sichtbare Aktionen in den Prompt schreiben.
- **Kein Assistant-Prefill**: ab Opus 4.6 liefert ein vorbefüllter letzter Assistant-Turn 400 — Structured Outputs oder System-Prompt-Anweisungen nutzen.

## Stärken & Schwächen (prompt-relevant)
- Stärken: verbesserte Vision, besonders bei Bildverarbeitung und Datenextraktion mit mehreren Bildern im Kontext; zuverlässigeres Lesen von Screenshots und UI-Elementen bei Computer Use; baut komplexe Web-Apps mit starkem Frontend-Design.
- Schwächen/Eigenheiten: ohne Design-Vorgaben generische Muster („AI slop"-Ästhetik); Overtriggering bei Tools, Sub-Agenten-Übernutzung, Overengineering, Overthinking (s. o.).
- Reliable Knowledge Cutoff Mai 2025 (Training-Data-Cutoff August 2025).

## Output- & Format-Konventionen
- 1M Kontextfenster, 128K Output-Tokens synchron; über die Message-Batches-API bis 300K mit Beta-Header `output-300k-2026-03-24`. Input Text und Bilder, Output Text.
- Tokenizer der Generation vor Opus 4.7: 1M Tokens entsprechen rund 750k Wörtern; dieselben Texte brauchen ab Opus 4.7 bis zu ~35 % mehr Tokens.
- Kein Prefill; feste Formate über Structured Outputs (`output_config.format`) oder System-Prompt.
- Tool-Call-Argumente können anders escaped sein als bei Vorgängern (Unicode, Slash) — `input` immer per JSON-Parser lesen, nie als Raw-String matchen.
- Forced Tool Use (`tool_choice` `any`/`tool`) funktioniert mit adaptivem Thinking, mit Extended Thinking nur `auto`/`none`.
- Bedrock nur über die InvokeModel-Integration (`anthropic.claude-opus-4-6-v1`).

## Migrations-Hinweise
- **Lifecycle**: Legacy, Status Active; Retirement nicht vor dem 5. Februar 2027. Anthropic empfiehlt die Migration zu Claude Opus 5.5.
- **VON Opus 4.6 zu Opus 4.7+/Opus 5.5**: `budget_tokens` liefert ab 4.7 400 → adaptive plus effort, effort-Sweep statt Budget-Übersetzung; `temperature`/`top_p`/`top_k` entfernen; `display` wird stillschweigend `omitted` → bei UI-Anzeige `display: "summarized"` setzen; neuer Tokenizer (bis ~1,35×): `max_tokens`, Compaction-Trigger und clientseitige Token-Schätzungen neu prüfen; Bild-Tokens bis ~3× höher, Koordinaten-Skalierung entfernen; erzwungenes Progress-Scaffolding streichen; Cyber-Safeguards einplanen. Für Opus 5.5 zusätzlich: Thinking immer an, effort-Default `medium`, Forced Tool Use abgelehnt.
- **VON Opus 4.6 zu Opus 4.5**: `adaptive` → 400, nur `budget_tokens`; Kontext 200K, Output 64K, kein `max`/`xhigh`; Prefill wieder erlaubt (nur ohne aktives Thinking).
- **ZU Opus 4.6 migrieren** (von 4.5 oder älter): Prefills entfernen; Tool-Input per JSON-Parser lesen; auf adaptives Thinking plus effort umstellen; aggressive Tool-Sprache und Anti-Laziness-Prompts zurückfahren; Minimal-, Sub-Agenten- und Bestätigungsregeln ergänzen.

## Quellen
- https://platform.claude.com/docs/en/models/opus-4-6/overview — Legacy-Status, Model-ID `claude-opus-4-6`, 1M Kontext, 128K Output (300K Batch-Beta), Thinking „Adaptive (extended deprecated)", effort-Default `high`, Knowledge Cutoff Mai 2025, Retirement nicht vor 05.02.2027, Bedrock-InvokeModel-ID, Migrationsempfehlung zu Opus 5.5.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-46 — Breaking Changes ab Opus 4.7 (`budget_tokens`, Sampling-Parameter, Thinking-Display, Tokenizer, Prefill seit 4.6), Verhaltensänderungen (Progress-Updates, Cyber-Safeguards, High-Res-Bilder), Tool-Parameter-Escaping ab 4.6.
- https://platform.claude.com/docs/en/about-claude/model-deprecations — Status Active, Retirement „Not sooner than February 5, 2027"; Sampling-Parameter-400 erst ab Claude 4.7.
- https://platform.claude.com/docs/en/about-claude/models/overview — Opus 4.6 in der Liste „Legacy models (still available)"; Extended Thinking auf Opus 4.6 deprecated; Wörter-pro-Token vor dem Opus-4.7-Tokenizer.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices — Opus-4.6-spezifisch: System-Prompt-Responsiveness/Overtriggering, Overthinking und Vorab-Exploration, `budget_tokens` deprecated, Sub-Agenten-Neigung, Overengineering, riskante Aktionen, Vision, Frontend-Design.
- https://platform.claude.com/docs/en/build-with-claude/effort — effort-Stufen (`max` ja, `xhigh` nicht für Opus 4.6), Default `high`.
- https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting — Opus 4.6: adaptiv plus Extended (deprecated), Default aus, keine abgelehnten Thinking-Typen.
- https://platform.claude.com/docs/en/build-with-claude/thinking — `display`-Default `summarized` auf Opus 4.6, Sampling-Regeln älterer Modelle, Prefill ab Claude 4.6 → 400, Forced Tool Use nur mit adaptivem Thinking.

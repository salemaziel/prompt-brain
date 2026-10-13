---
model: claude-opus-5
vendor: Anthropic
family: Claude
aliases: [opus-5, claude-opus5, opus5]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 5

## Reasoning / Thinking
- Typ: **adaptiv, per Default an**. Ein Request ohne `thinking`-Feld denkt — anders als Opus 4.8/4.7, wo dasselbe Request ohne Thinking lief. `{type: "adaptive"}` ist äquivalent zum Weglassen.
- Abschalten via `thinking: {type: "disabled"}` ist **nur bis effort `high`** erlaubt; kombiniert mit `xhigh`/`max` → 400.
- `thinking: {type: "enabled", budget_tokens: N}` ist entfernt (400). Tiefe ausschließlich über `output_config.effort` (`low | medium | high | xhigh | max`, Default `high`).
- Rohe Chain-of-Thought wird nie zurückgegeben; `display: "summarized"` liefert eine Zusammenfassung, Default `"omitted"` leere Thinking-Felder.
- Sampling-Parameter `temperature`/`top_p`/`top_k` auf Nicht-Default-Werten → 400.
- `max_tokens` ist ein hartes Limit über Thinking **plus** Antworttext — bei bisher thinking-freien Workloads neu bemessen. Bei `xhigh`/`max` mit ≥ 64k starten.

## Prompting-Stil
- **Explizit statt implizit**: Opus 5 interpretiert Prompts wörtlich, generalisiert eine Anweisung nicht stillschweigend auf andere Fälle und leitet keine ungestellten Anforderungen ab. Geltungsbereich ausschreiben.
- **Verifikations-Anweisungen entfernen**: Das Modell prüft seine Arbeit ungefragt. Übernommene „double-check your answer"/„include a final verification step"-Zeilen erzeugen Over-Verification — Streichen senkt Kosten ohne Qualitätsverlust.
- **Länge explizit vorgeben**: `effort` steuert Thinking-Volumen, nicht die sichtbare Antwortlänge — Absenken verkürzt Antworten nicht zuverlässig. Kurze Concise-Instruktion ergänzen, in langen System-Prompts zusätzlich als `<tone_preference>`-Reminder am Ende.
- **Scope begrenzen**: Das Modell erweitert Aufgaben mitunter um ungefragte Schritte; enge Aufgaben brauchen eine explizite Scope-Regel.
- **Delegation deckeln**: Opus 5 delegiert bereitwilliger an Sub-Agenten als Vorgänger — Kriterien nennen oder harte Obergrenze setzen.
- **Progress-Scaffolding streichen**: Zwischenstands-Choreografie („nach je 3 Tool-Calls zusammenfassen") ist überflüssig; stattdessen Kadenz und Form der Updates beschreiben.
- Lange agentische Läufe: vollständige Aufgabenspezifikation **vorab** in einem Turn geben und laufen lassen.
- **Reasoning nicht im Antworttext anfordern**: Prompts, Skills und Tool-Beschreibungen, die das Modell sein Thinking/Reasoning ausschreiben lassen — wörtlich oder in festem Format (`<thinking>`-, `<reasoning>`- oder Scratchpad-Abschnitt vor der Antwort, `reasoning`-/`thinking`-/`trace`-Feld in JSON-Output oder Tool-Input, Reasoning-Log, Reasoning „verbatim"/„in full") —, können mit `stop_reason: "refusal"` und `stop_details.category: "reasoning_extraction"` abgelehnt werden. Stattdessen eine kurze Begründung, die Belege oder eine Zusammenfassung der ausgeführten Schritte anfordern; wird das Reasoning selbst gebraucht, Thinking anlassen und die Thinking-Blöcke mit `display: "summarized"` lesen. Die Kategorie hat kein Fallback-Modell (Prompt ändern statt erneut senden), und eine Ablehnung vor jedem Output wird abgerechnet.

## Stärken & Schwächen (prompt-relevant)
- Stärken: schwierige agentische Coding-Aufgaben (Multi-File-Features, größere Refactorings, End-to-End-Arbeit) ohne Stubs/Platzhalter; Code-Review mit hoher Precision **und** Recall, auch bei niedrigem effort; Vision (Charts, Dokumente, Diagramme, UI-Replikation); Office-Artefakte (mehrblättrige Spreadsheets mit Formeln, Slide-Decks); Multi-Agent-Koordination mit Writer-Verifier-Mustern; konsistentes Instruction-Following über das gesamte 1M-Fenster.
- `low`/`medium` liefern starke Qualität bei einem Bruchteil von Tokens und Latenz — primärer Kosten-Hebel; von Vorgängermodellen übernommene effort-Defaults neu sweepen.
- Schwächen/Eigenheiten: längere sichtbare Antworten und längere geschriebene Deliverables als Vorgänger; ausgeprägte Narration in agentischen Sessions; narrativ ausführliche Selbstkorrekturen; Severity-Filter im Review-Prompt („nur high-severity") werden wörtlich befolgt und senken den gemessenen Recall.
- Mit abgeschaltetem Thinking zwei Artefakte: Tool-Calls landen gelegentlich als **Text** statt als `tool_use`-Block (Turn gilt als erfolgreich, der Call läuft nie), und interne XML-Tags können in die sichtbare Antwort lecken. Primäre Gegenmaßnahme laut Doku: Thinking anlassen und stattdessen effort senken.

## Output- & Format-Konventionen
- 1M-Kontextfenster als Default **und** Maximum (kein Beta-Header), 128k Output-Tokens; über die Message-Batches-API bis 300k Output mit Beta-Header `output-300k-2026-03-24`.
- Kein Assistant-Prefill — Structured Outputs (`output_config.format`) oder System-Prompt-Anweisungen nutzen.
- Tokenizer wie Opus 4.7/4.8: gegenüber Modellen vor Opus 4.7 rund 1×–1,35× so viele Tokens für denselben Text (inhaltsabhängig).
- Safety-Klassifikatoren können ablehnen: HTTP 200 mit `stop_reason: "refusal"` und `stop_details` — vor dem Lesen von `content` prüfen. Server-seitige Fallbacks über `fallbacks: "default"` (Beta `server-side-fallback-2026-07-01`, nur Claude API; der ältere Header `server-side-fallback-2026-06-01` akzeptiert nur die explizite Modellliste).
- Preis $5 / MTok Input, $25 / MTok Output; Reliable Knowledge Cutoff Mai 2026.
- Minimal cachebares Prefix: **512 Tokens** (Opus 4.8: 1024) — Prompts, die bisher als zu kurz zum Cachen galten, cachen ohne Codeänderung. Beim Wechsel von 4.8 lohnt ein Cache-Eligibility-Review.
- Top-Level-effort (output_config.effort am Request) ist Teil des gerenderten Prompts — ein Wechsel zwischen Requests startet den Prompt-Cache neu. Ein Per-Message-effort-Wechsel (Beta-Header `mid-conversation-output-config-2026-07-01`, nur Claude API und Google Cloud, nicht Amazon Bedrock) behält den Cache.
- Mid-Conversation-System-Messages (`role: "system"` in `messages` direkt nach einem User-Turn) werden auf Opus 5 unterstützt, ohne Beta-Header (Claude API, Amazon Bedrock, Google Cloud) — Anweisungen ändern, ohne die History neu aufzubauen.

## Migrations-Hinweise
- **Lifecycle**: laut Anbieter Legacy (Status *Active (legacy)*, Retirement nicht vor dem 24. Juli 2027); Anthropic empfiehlt die Migration zu Claude Opus 5.5 (`claude-opus-5-5`) — dort ist `thinking: disabled` auf jeder Stufe 400, Forced Tool Use entfällt und der effort-Default sinkt auf `medium`.
- **VON Opus 5 weg**: explizite Verifikations- und Self-Check-Schritte wieder ergänzen, wenn das Zielmodell nicht selbst prüft; Concise-/Scope-/Delegations-Deckel-Instruktionen neu bewerten (sie kompensieren Opus-5-Eigenheiten); `fallbacks`-, `refusal`- und effort-Spezifika entfernen; bei Zielmodellen ohne adaptives Thinking wieder Step-by-step-Scaffolding bzw. `budget_tokens` vorsehen.
- **ZU Opus 5 migrieren**: `budget_tokens` und alle Sampling-Parameter entfernen; Assistant-Prefill durch Structured Outputs ersetzen; prüfen, ob eine Route `thinking: disabled` mit `xhigh`/`max` kombiniert (→ 400: Thinking anlassen oder effort auf `high` senken); `max_tokens` bei bisher thinking-freien Routen erhöhen; Verifikations- und Progress-Scaffolding **streichen**; Concise- und Scope-Instruktion ergänzen; Delegation deckeln; effort-Sweep neu fahren statt alte Defaults zu übernehmen; `refusal`-Handling ergänzen; Anweisungen, Reasoning im Antworttext auszuschreiben, durch eine Kurzbegründung ersetzen (`reasoning_extraction`, s. Prompting-Stil).

## Quellen
- https://platform.claude.com/docs/en/models/opus-5/overview — belegt id `claude-opus-5`, 1M Kontext, 128k Output, $5/$25, Knowledge Cutoff Mai 2026, effort-Default `high`, 300k-Output-Beta auf der Batches-API, 512-Token-Cache-Minimum, Legacy-Status mit Opus 5.5 als Migrationsziel, Retirement nicht vor 24.7.2027.
- https://platform.claude.com/docs/en/build-with-claude/thinking — Opus 5: Thinking per Default an, `disabled` nur bis effort `high` (sonst 400), `budget_tokens` → 400, Sampling-Parameter abgelehnt, `display`-Default `omitted`, Tool-Calls als Text / XML-Leaks bei abgeschaltetem Thinking.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide — für Opus 4.7 und später: `budget_tokens` entfernt, Sampling-Parameter abgelehnt, Tokenizer rund 1×–1,35×; Unterschiede Opus 5 → Opus 5.5.
- https://platform.claude.com/docs/en/build-with-claude/effort — alle fünf effort-Stufen für Opus 5, Default `high`, Empfehlung Start bei `high` mit frischem Sweep, `max_tokens` ≥ 64k bei `xhigh`/`max`, Top-Level-effort-Wechsel startet den Cache neu, Per-Message-effort (Beta) behält ihn (nicht auf Amazon Bedrock).
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching — minimal cachebares Prefix 512 Tokens für Opus 5 gegenüber 1024 für Opus 4.8.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 — Verbosity/Deliverable-Länge, Over-Verification, Scope-Erweiterung, Sub-Agenten-Deckel, Selbstkorrektur-Narration, wörtliches Instruction-Following, die beiden Artefakte bei abgeschaltetem Thinking, Code-Review-Severity-Filter, Reasoning in the response (`reasoning_extraction`).
- https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback — Kategorie `reasoning_extraction` und Abschnitt „Keep reasoning in thinking blocks": typische Auslöser, Ersatz durch Kurzbegründung bzw. `display: "summarized"`, kein Fallback-Modell, Ablehnung vor jedem Output wird abgerechnet; Server-side Fallback nur Claude API, `2026-06-01` nur explizite Liste.
- https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages — kein Beta-Header, Opus 5 unterstützt (Claude API, Amazon Bedrock, Google Cloud), Platzierungsregeln.
- https://platform.claude.com/docs/en/build-with-claude/context-windows — 1M-Kontext als Default ohne Beta-Header für Opus 5, bis 128k Output pro Request.

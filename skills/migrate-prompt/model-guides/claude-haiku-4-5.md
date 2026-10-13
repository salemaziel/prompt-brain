---
model: claude-haiku-4-5
vendor: Anthropic
family: Claude
aliases: [haiku-4.5, claude-haiku-4.5, haiku4.5, haiku-4-5, claude-haiku-4-5-20251001]
last_verified: 2026-10-13
status: legacy
successor: claude-haiku-5-5
---

# Claude Haiku 4.5

## Reasoning / Thinking
- Typ: **Extended Thinking (manuell)** über `thinking: {type: "enabled", budget_tokens: N}`; `budget_tokens` mindestens 1.024 und kleiner als `max_tokens`. Ohne `thinking`-Feld läuft kein Thinking; `{type: "adaptive"}` → 400 (`adaptive thinking is not supported on this model`).
- Der **`effort`-Parameter wird nicht unterstützt** (Modellseite: Default effort „Not supported") — anders als Haiku 5.5 sowie die Opus-Modelle ab 4.5, die Sonnet-Modelle ab 4.6 und die Fable-Modelle. Tiefe nur über `budget_tokens`. Das konkrete Fehlerbild beim Senden von `effort` ist auf den geprüften Seiten nicht beschrieben (unbelegt).
- Budget-Tuning laut Doku: bei einfachen Aufgaben nahe 1.024 starten und schrittweise erhöhen, bei komplexen ab ~16.000; Budgets über 32k per Batch-API fahren. Das Budget ist ein Ziel, keine harte Obergrenze; `max_tokens` bleibt die Decke.
- **Kein Interleaved Thinking** (der Beta-Header wird auf der Claude API akzeptiert, aber ignoriert). Erzwungenes `tool_choice` (`any`/`tool`) ist mit Extended Thinking nicht kombinierbar (Fehler); nur `auto` oder `none`.
- Thinking-Blöcke: nur die des letzten Assistant-Turns bleiben erhalten, ältere entfernt die API automatisch. `thinking.display` Default `"summarized"`.
- Sampling: `temperature`, `top_p`, `top_k` werden akzeptiert; **bei aktivem Thinking** sind `temperature` und `top_k` inkompatibel und `top_p` nur zwischen 0.95 und 1 erlaubt.

## Prompting-Stil
- Klare, direkte, explizite Instruktionen: Claude-4-und-spätere Modelle kommunizieren knapper und direkter und brauchen ausdrückliche Anweisungen statt implizierter Erwartungen.
- Knapp und einfach halten; für komplexes mehrstufiges Reasoning ist ein größeres Modell besser geeignet. (unbelegt)
- Für feste Ausgabeformate Structured Outputs nutzen; Assistant-Prefill funktioniert nur bei abgeschaltetem Thinking.

## Stärken & Schwächen (prompt-relevant)
- Stärken: schnelles, kosteneffizientes Modell der 4.5-Generation ($1 / $5 pro MTok); laut Modellübersicht hat inzwischen Haiku 5.5 die niedrigste Latenz („Fastest") und niedrigere Listenpreise. Gut für hochvolumige, klar umrissene Aufgaben. (unbelegt: Einsatzprofil)
- Schwächen: kein `effort`, kein adaptives und kein interleaved Thinking; 200K Kontext; Reliable Knowledge Cutoff Feb 2025 (Training Data Cutoff Jul 2025). Geringere Reasoning-Tiefe als Opus/Sonnet — komplexe Logik explizit per Prompt strukturieren. (unbelegt)

## Output- & Format-Konventionen
- 200K Kontextfenster, bis 64K Output-Tokens; keine 300k-Batch-Output-Beta. Input: Text und Bilder → Text; Bilder in der Standard-Auflösungsstufe (Downscaling über 1.568 px Langkante bzw. 1.568 Visual Tokens).
- Structured Outputs werden unterstützt (`output_config.format`). Auf Amazon Bedrock nur über die Legacy-Integration (InvokeModel), nicht über „Claude in Amazon Bedrock".
- Assistant-Prefill wird bei abgeschaltetem Thinking akzeptiert; bei aktivem Thinking ist Prefill nicht möglich.
- Computer Use über `computer_20250124` mit Beta-Header `computer-use-2025-01-24`; das Browser-Use-Tool wird nicht unterstützt.
- Preise pro MTok: Input $1, Output $5, 5m-Cache-Write $1.25, 1h-Cache-Write $2, Cache-Read $0.10; Batch −50 %. Minimal cachebares Prompt: 4.096 Tokens.
- Model IDs: Claude API `claude-haiku-4-5-20251001` (Alias `claude-haiku-4-5`); Amazon Bedrock `anthropic.claude-haiku-4-5` (InvokeModel `anthropic.claude-haiku-4-5-20251001-v1:0`); Google Cloud `claude-haiku-4-5@20251001`; Microsoft Foundry und Claude Platform on AWS `claude-haiku-4-5`.

## Migrations-Hinweise
- **Lifecycle**: Modellübersicht und Modellseite führen Haiku 4.5 als **Legacy** (Status „Active (legacy)", Nachfolger Claude Haiku 5.5); die Deprecations-Tabelle listet `claude-haiku-4-5-20251001` als Active mit Retirement nicht vor dem 15. Oktober 2026. Vor einer Migration ZU Haiku 4.5 den aktuellen Stand auf der Deprecations-Seite prüfen.
- **VON Haiku 4.5 weg (zu Haiku 5.5)**: Anthropic zufolge laufen bestehende Haiku-4.5-Prompts ohne Änderung gut; die Pflichtänderungen sind API-seitig — `budget_tokens` → adaptives Thinking + effort, Sampling-Parameter und Prefill entfernen, `computer_20250124` ersetzen, ~30 % mehr Tokens und Thinking in `max_tokens` einplanen (Details im Guide `claude-haiku-5-5`).
- **VON Haiku 4.5 weg (zu Opus/Sonnet)**: `effort` und adaptives Thinking werden verfügbar — Tiefe lässt sich feiner steuern; je nach Zielmodell gelten dort eigene Einschränkungen (Sampling, Prefill, `budget_tokens`).
- **ZU Haiku 4.5 migrieren**: `effort`-Parameter aus Requests entfernen; adaptives Thinking durch `enabled`+`budget_tokens` ersetzen (sonst 400); Kontext auf 200K und Output auf 64K begrenzen; Thinking-Text kommt wieder als Zusammenfassung; Prompts vereinfachen und Aufgaben eng umreißen. (unbelegt: letzter Punkt)

## Quellen
- https://platform.claude.com/docs/en/models/haiku-4-5/overview — Legacy-Status („Active (legacy)"), Nachfolger Haiku 5.5, Model IDs je Plattform inkl. Alias, 200K Kontext, 64K Output, $1/$5 plus Cache-Preise, Thinking „Extended", Default effort „Not supported", Knowledge Cutoff Feb 2025 / Training Jul 2025, Retirement nicht vor 15.10.2026.
- https://platform.claude.com/docs/en/build-with-claude/thinking — Konfigurationsmatrix (ohne Feld kein Thinking, `adaptive` 400, `enabled` = Extended Thinking), `display`-Default `"summarized"` für ältere Modelle, Sampling- und Prefill-Regeln bei aktivem Thinking, kein Interleaved Thinking, nur letzter Turn erhalten, `tool_choice`-Einschränkung im manuellen Modus.
- https://platform.claude.com/docs/en/build-with-claude/extended-thinking — `budget_tokens` ≥ 1.024 und < `max_tokens`, Budget-Tuning (1.024 / 16.000 / Batch über 32k), Interleaved-Header auf Haiku 4.5 ignoriert, Migration zu adaptivem Thinking.
- https://platform.claude.com/docs/en/build-with-claude/effort — `supportedModels` ohne Haiku 4.5 (enthält Haiku 5.5, Opus ab 4.5, Sonnet ab 4.6, Fable).
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs — `claude-haiku-4-5-20251001` unterstützt, `output_config.format`, auf Bedrock nur über die Legacy-Integration.
- https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide — Haiku 4.5 akzeptiert Sampling-Parameter und Prefill bei Thinking aus, `computer_20250124` + `computer-use-2025-01-24`, Standard-Bildstufe, kein Browser-Use-Tool auf Haiku 4.5, Haiku-4.5→5.5-Checkliste, Claude-4+-Modelle brauchen explizite Anweisungen.
- https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5 — Cache-Minimum 4.096 Tokens auf Haiku 4.5.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5 — bestehende Haiku-4.5-Prompts laufen auf Haiku 5.5 ohne Änderung gut.
- https://platform.claude.com/docs/en/about-claude/model-deprecations — `claude-haiku-4-5-20251001` Active, Retirement nicht vor 15.10.2026.
- https://platform.claude.com/docs/en/models/overview — Haiku 4.5 unter „Legacy models (still available)", Haiku 5.5 „Fastest".

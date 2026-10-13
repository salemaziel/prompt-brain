---
model: claude-haiku-5-5
vendor: Anthropic
family: Claude
aliases: [haiku, haiku-5.5, claude-haiku-5.5, haiku5.5]
last_verified: 2026-10-13
status: current
---

# Claude Haiku 5.5

## Reasoning / Thinking
- Typ: **adaptiv, per Default an**. Requests ohne `thinking`-Feld denken (Haiku 4.5: ohne Feld kein Thinking). `thinking` weglassen oder `{type: "adaptive"}` senden.
- `thinking: {type: "enabled", budget_tokens: N}` → 400. Haiku 5.5 ist das **erste Haiku-Modell mit effort**: `output_config.effort` = `low | medium | high | xhigh | max`, Default **`medium`** (ein explizit gesetzter Default verhält sich wie ein weggelassener Parameter).
- Thinking abschalten: `thinking: {type: "disabled"}` funktioniert **nur bei `low`, `medium` und `high`**; bei `xhigh`/`max` → 400 (`output_config.effort 'xhigh' is not supported when thinking is disabled on this model.`). Laut Doku ist effort senken der bessere Hebel als Abschalten; eine Prompt-Anweisung „direkt antworten" hat das Thinking in Anthropics Tests nicht unterdrückt.
- Thinking-Tokens zählen gegen `max_tokens` (bis 128.000): zu knapp bemessene Limits enden mit `stop_reason: "max_tokens"` nach einem `thinking`-Block, ohne Text.
- Thinking-Blöcke früherer Assistant-Turns bleiben im Kontext und werden als Input abgerechnet (Haiku 4.5 behielt nur die des letzten Turns).
- `thinking.display` Default `"omitted"`: Blöcke kommen mit leerem `thinking`-Feld und nur der `signature`; `display: "summarized"` liefert die Zusammenfassung (Haiku 4.5: summarized per Default).
- Erzwungenes `tool_choice` (`any` oder ein benanntes Tool) wird akzeptiert, die Antwort beginnt dann aber direkt mit dem Tool-Call **ohne** Thinking-Block.
- Sampling: `temperature` nur `1`, `top_p` nur `0.99`; jeder andere Wert, jedes `top_k` und `temperature` zusammen mit `top_p` → 400.
- Thinking-Blöcke sind an den erzeugenden Account (oder einen verknüpften) gebunden; ein Replay über einen anderen Account verwirft sie still. Ein zurückgesendeter Block ist nur gültig, solange `system`, `tools` und frühere `messages` unverändert sind, sonst 400 (bei Accounts vor dem 31. August 2026 nur mit gesetztem `thinking.block_binding.prefix_mismatch_behavior`).

## Prompting-Stil
- Anthropic: bestehende **Haiku-4.5-Prompts sollten ohne Änderung gut laufen** — Anpassungen gezielt nach beobachtetem Verhalten, nicht pauschal.
- **effort statt Thinking-Budget**: zwei bis drei Stufen auf eigenen Evals vergleichen. `low` für Chat, kurze Tool-Aufgaben und simple Massen-Requests; `medium` (Default) für die meisten Aufgaben inkl. agentischem Coding; `high` für Wissensarbeit, längere Agent-Aufgaben und striktes Instruction-Following; `xhigh`/`max` nur bei messbarem Gewinn und dann gegen Sonnet 5.5 vergleichen.
- **Suche**: bei Such-Tools das aktuelle Datum in System-Prompt oder Tool-Beschreibung geben; bei `low` und langen System-Prompts zusätzlich der Doku-Hinweis, dass Trainingsdaten veraltet sind und „latest"-Fakten gesucht werden müssen. Pauschale „immer suchen"-Anweisungen vermeiden (mehr unnötige Suchen, keine besseren Antworten).
- **Lange Agent-Prompts bei `low`**: Neigung zum vorzeitigen Abbruch und zu ungeprüften Code-Änderungen — Doku-Bausteine „weiterarbeiten bis erledigt, keine ungefragten Extras" und „vor dem Fertig-Melden einen echten Test/Build/Typecheck laufen lassen" ergänzen oder effort anheben (kostet mehr Output-Tokens).
- **Chatbots**: Satz ergänzen, dass die System-Prompt-Regeln die ganze Konversation gelten, auch wenn Nutzer argumentieren oder insistieren; bei wichtigem Instruction-Following zusätzlich `high`.
- **Mid-Turn-Nutzereingaben** nie in `tool_result`-Blöcke packen (das Modell kann sie als untrusted ignorieren), sondern als Text-Block nach dem letzten `tool_result` im User-Turn; Harness-Hinweise in eine separate Mid-Conversation-System-Message.
- Neue System-Prompt-Zeilen nur in **neuen** Konversationen einführen; laufende Konversationen erhalten Änderungen im neuesten Turn bzw. als angehängte System-Message (sonst 400 wegen geänderter Präfix).

## Stärken & Schwächen (prompt-relevant)
- Stärken: für hochvolumige, latenzkritische Aufgaben wie Klassifikation, Routing, Extraktion und Sub-Agenten gebaut; laut Modellübersicht niedrigste Latenz im aktuellen Lineup („Fastest") und niedrigste Preise; adaptives Thinking + effort, 1M Kontext; Browser-Use-Tool (`browser_toolset_20260801`) auf Claude API und Google Cloud.
- Schwächen/Eigenheiten: bei `low` eher übersprungene Suchen, vorzeitiges Stoppen und ausgelassene Checks; mit Thinking aus **plus** JSON-Output via Structured Outputs wird ein nötiger Tool-Call teils übersprungen (Abhilfe: adaptives Thinking, `output_config.format` bei Tool-Pflicht weglassen, `tool_choice` erzwingen oder die Doku-Zeile „JSON gilt nur für die finale Antwort"); reasoning-artiger Text in der sichtbaren Antwort, häufiger bei Thinking aus oder `low` (Abhilfe: adaptiv + `medium`); bei `xhigh` in Multi-Turn-Chats mitunter die ganze Antwort im Thinking und leerer sichtbarer Text.
- Safety-Klassifikatoren können ablehnen: `stop_reason: "refusal"` mit `stop_details.category` (`cyber`, `frontier_llm`, `bio`, `general_harms`) — gegenüber Haiku 4.5 neu; **kein** serverseitiger Fallback, erneutes Senden liefert meist wieder eine Ablehnung.

## Output- & Format-Konventionen
- 1M Kontextfenster, 128k Output-Tokens; über die Message-Batches-API bis 300k mit Beta-Header `output-300k-2026-03-24`. Input: Text und Bilder → Text. Reliable Knowledge Cutoff Jun 2026.
- **Neuer Tokenizer** (wie Claude 4.7+): derselbe Text ≈ 30 % mehr Tokens als auf Haiku 4.5 — `max_tokens`, Token-Zählungen und Kostenschätzungen neu erheben.
- **Hochauflösende Bild-Stufe**: Downscaling erst über 2.576 px Langkante bzw. 4.784 Visual Tokens (Haiku 4.5: 1.568 px / 1.568 Tokens); ein 2000×1500-Bild kostet etwa 2,5× so viele Visual Tokens.
- **Kein Assistant-Prefill** (400, auch mit Thinking aus) — `messages` mit einem User-Turn beenden; Format über Structured Outputs oder Tools mit Enum-Feldern, Präambeln per System-Prompt unterdrücken.
- Structured Outputs (`output_config.format`) auf Claude API u. a. verfügbar, **nicht auf Amazon Bedrock** — dort Format im Prompt beschreiben oder Tool ohne `strict` nutzen und selbst validieren.
- Antworten können mit `thinking`-Blöcken beginnen: Content-Blöcke nach `type` auswählen, nicht nach Position.
- Preise pro MTok, gestaffelt nach Prompt-Länge: bis 100k Tokens $0.10 Input / $0.50 Output, darüber $0.50 / $2.50; Cache-Read $0.01 bzw. $0.05; Batch −50 %. Minimal cachebares Prompt: 512 Tokens (Haiku 4.5: 4.096).
- Model IDs: Claude API, Google Cloud, Microsoft Foundry, Claude Platform on AWS `claude-haiku-5-5` (feste ID ohne Datumssuffix und ohne separaten Alias); Amazon Bedrock `anthropic.claude-haiku-5-5`. Status *Active (latest)*, Release 7. Oktober 2026, Retirement nicht vor 7. Oktober 2027.

## Migrations-Hinweise
- **ZU Haiku 5.5 migrieren (von Haiku 4.5)**: Modell-ID tauschen; Prompts neu zählen und `max_tokens` mit Luft für Thinking bemessen; `enabled`+`budget_tokens` durch adaptives Thinking + effort ersetzen (wo Haiku 4.5 ohne Thinking oder mit kleinem Budget lief, niedrigere effort-Stufe wählen); Blöcke nach `type` statt Position lesen; `temperature`/`top_p`/`top_k` entfernen und Verhalten per Prompt steuern; Prefill durch einen abschließenden User-Turn ersetzen; `computer_20250124` ersetzen (Claude API/Google Cloud: `computer_toolset_20260801`, Bedrock: `computer_20251124` + `computer-use-2025-11-24`); Replays über den erzeugenden Account fahren; Konversationen append-only halten; `stop_reason: "refusal"` behandeln; auf Bedrock Structured Outputs durch Prompt-Format + eigene Validierung ersetzen. Priority Tier wird auf Haiku 5.5 nicht unterstützt — Kapazität separat planen.
- **ZU Haiku 5.5 migrieren (von Haiku 3.5 oder älter)**: zusätzlich `claude-3-5-haiku-20241022` / `claude-3-5-haiku-latest` / `claude-3-haiku-20240307` ersetzen (beide auf der Claude API retired); `code_execution_20250522` → `code_execution_20250825` oder neuer; Text-Editor auf `text_editor_20250728`; `refusal` und `model_context_window_exceeded` behandeln; Trailing Newlines in Tool-String-Parametern zulassen; Prompts überarbeiten — Claude-4+-Modelle kommunizieren knapper und direkter und brauchen explizite Anweisungen.
- **VON Haiku 5.5 weg (zu Haiku 4.5)**: Für diese Richtung gibt es keine eigene Anleitung; aus den Haiku-4.5-Spezifikationen folgt: effort entfernen (dort nicht unterstützt) und Thinking über `enabled`+`budget_tokens` steuern (ohne `thinking`-Feld läuft Haiku 4.5 ohne Thinking); Sampling-Parameter und Prefill (bei Thinking aus) sind dort wieder erlaubt; Kontext auf 200K und Output auf 64K begrenzen.
- Kompatibilität der Reasoning-Kette: Haiku 5.5 liest Thinking-Blöcke von Sonnet 5, Opus 4.8, Haiku 4.5 und älteren Modellen, **nicht** von Opus 5, Opus 5.5, Sonnet 5.5, Fable oder Mythos (still verworfen).

## Quellen
- https://platform.claude.com/docs/en/models/haiku-5-5/overview — id `claude-haiku-5-5` und Plattform-IDs, 1M Kontext / 128k Output (300k Batch-Beta), gestaffelte Preise inkl. Cache-Write/-Read, Thinking adaptiv, Default-Effort `medium`, Latenz „Fastest", Knowledge Cutoff Jun 2026, Status *Active (latest)*, Release 7.10.2026, Retirement nicht vor 7.10.2027, Sampling-Hinweis, 512-Token-Cache-Minimum, ~30 % mehr Tokens als Haiku 4.5.
- https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5 — Änderungsübersicht gegenüber Haiku 4.5 (neu, breaking, geändert), Browser-Use-Tool, Refusals ohne Fallback, Thinking-Blöcke bleiben im Kontext, Cache-Minimum 512 statt 4.096.
- https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide — Checklisten „Every starting model" und „Claude Haiku 3.5 or earlier", Model-ID-Tabelle, Tokenizer und hochauflösende Bild-Stufe, Thinking-Konfiguration, Sampling- und Prefill-400, Computer-Use-Toolset, Account-Bindung, Append-only-Prüfung, kein Priority Tier, keine Structured Outputs auf Bedrock, Lesbarkeit fremder Thinking-Blöcke.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5 — Haiku-4.5-Prompts laufen ohne Änderung, effort-Empfehlungen je Stufe, `disabled` nur bis `high`, Such-Datum, JSON-Output mit eigenen Tools, Early Stopping, Verifikation bei Coding-Agents, Mid-Turn-Nutzereingaben, System-Prompt-Treue, Reasoning im sichtbaren Text, Refusal-Kategorien.
- https://platform.claude.com/docs/en/build-with-claude/effort — Haiku 5.5 unterstützt alle fünf Stufen, Default `medium`, Default explizit gesetzt = weggelassen, per-Message-Effort (Beta) und 400 bei Effort-Wechsel mit Thinking aus.
- https://platform.claude.com/docs/en/build-with-claude/thinking — Konfigurationsmatrix (ohne Feld adaptiv, `enabled` 400, `disabled` bis `high`), `display`-Default `"omitted"`, Erhalt früherer Thinking-Blöcke, Sampling-Regeln.
- https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting — exakte Fehlermeldung für `disabled` bei `xhigh`/`max`, kein Thinking-Block bei erzwungenem `tool_choice`, Prefix-Check-Fehler.
- https://platform.claude.com/docs/en/models/haiku-4-5/overview — Vergleichswerte des Vorgängers (200K Kontext, 64K Output, Extended Thinking, effort „Not supported") für die Rückrichtung.
- https://platform.claude.com/docs/en/models/overview — Haiku 5.5 im aktuellen Lineup („Fastest", „From $0.10 / input MTok"), Haiku 4.5 unter „Legacy models (still available)".

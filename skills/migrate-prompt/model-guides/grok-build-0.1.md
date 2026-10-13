---
model: grok-build-0.1
vendor: xAI
family: Grok
aliases: [grok-code-fast-1, grok-code-fast, grok-code-fast-1-0825, grok-build-0-1]
last_verified: 2026-10-13
status: current
---

# Grok Build 0.1

## Reasoning / Thinking
- Typ: **Reasoning-Modell ohne dokumentierte Steuerung.** Die Modellseite führt „Reasoning: Yes", nennt aber keine Effort-Stufen; auch die Summary-Tabelle der Reasoning-Seite listet nur grok-4.7, grok-4.6, grok-4.5 und grok-4.20-multi-agent. Ob `reasoning_effort` akzeptiert, ignoriert oder abgelehnt wird, ist nicht dokumentiert (unbelegt). Ebenso unbelegt: Default-Tiefe und ob Reasoning abschaltbar ist.
- Reasoning-Tokens werden laut Reasoning-Seite generell mitabgerechnet („the reasoning tokens are billed as part of your total consumption").
- Klassenregel der Reasoning-Seite: „`presencePenalty`, `frequencyPenalty`, and `stop` cannot be used with reasoning models. Requests that include them return an error." grok-build-0.1 ist dort nicht namentlich genannt, trägt aber das Reasoning-Flag — die Parameter daher vorsorglich weglassen.
- Lesbare Reasoning-Summaries beschreibt xAI nur für grok-4.7; ob grok-build-0.1 `reasoning.encrypted_content` liefert („Some models can"), ist nicht belegt (unbelegt). Pipelines, die einen Denkweg auswerten, dürfen sich hier auf nichts verlassen.

## Prompting-Stil
- Positionierung laut Announcement: „a coding model specifically trained for agentic coding tasks, including web development, debugging, and MCP support"; außerhalb von Coding „a speedy, economical option for general-purpose agentic and tool calling use cases". Entsprechend **agentisch und aufgabenorientiert** prompten, nicht als Allzweck-Chat.
- Das Announcement sagt, das Modell „performs best in agentic harness" (genannt u. a. Grok Build, Cursor, OpenCode). Prompts für reine Single-Shot-Chats ohne Tool-Schleife laufen damit außerhalb des Profils, für das xAI es positioniert.
- Tool-Auswahl über die **Tool-Definitionen** steuern: die Beschreibung eines Tools „helps the model decide when to use it". Paralleles Tool-Calling ist an und wird mit `parallel_tool_calls: false` abgeschaltet.
- Format über **Structured Outputs** erzwingen (`response_format.type: "json_schema"`): „the response is guaranteed to match your schema" — mit den dokumentierten Limits (String-Länge 2.048, Arrays 256, 64 Properties; `not` und `if`/`then`/`else` nur Best-Effort).
- Prompt-Caching läuft automatisch ab dem Anfang des `messages`-Arrays: statischen Prefix (System-Prompt, Tool-Definitionen) vorn und unverändert halten, `x-grok-conv-id` bzw. `prompt_cache_key` setzen.
- Eine modellspezifische Prompting-Guidance für grok-build-0.1 bzw. grok-code-fast-1 ist in der aktuellen xAI-Doku nicht auffindbar; jede weitergehende Stilaussage ist unbelegt.

## Stärken & Schwächen (prompt-relevant)
- Stärken: **günstigstes xAI-Coding-Modell** im Roster ($1.00 Input / $2.00 Output pro 1M unter 200k); laut Announcement „100+ tokens/second"; Function Calling, Structured Outputs und Bild-Input vorhanden; laut Retirement-Guide gegenüber grok-code-fast-1 „significantly improved agentic coding and web dev capabilities". Vom Hersteller sind keine Benchmarks publiziert.
- Schwächen/Eigenheiten: **kleinstes Kontextfenster** der aktuellen Grok-Textmodelle (256k statt 500k bei grok-4.5/4.6/4.7 bzw. 1M bei grok-4.3/4.20); **Batch API „Not supported"**; nur us-east-1/us-west-2, keine EU-Region; deutlich niedrigere Rate Limits als die Flaggschiffe (37 rps / 10M tpm statt 150 rps / 50M tpm bei grok-4.5); kein publizierter Knowledge Cutoff, kein publiziertes Output-Limit, keine Effort-Steuerung. Die Modellübersicht empfiehlt für Code ausdrücklich grok-4.7, nicht grok-build-0.1.

## Output- & Format-Konventionen
- 256.000 Tokens Kontext; Input Text + Bild, Output nur Text. Max. Output-Tokens und Knowledge Cutoff: nicht publiziert (unbelegt).
- Function Calling: ja; Structured Outputs: ja; Reasoning: ja; Batch API: „Not supported".
- Preise pro 1M Tokens: Input $1.00 (<200k Prompt) / $2.00 (≥200k), Cached Input $0.20 / $0.40, Output $2.00 / $4.00. Ab 200k Prompt-Tokens gilt der höhere Satz für **alle** Tokens des Requests. Rate Limits: 37 Requests/s, 10M Tokens/min; Regionen us-east-1, us-west-2.
- Vendor-Aliase auf der Modellseite: `grok-code-fast-1`, `grok-code-fast`, `grok-code-fast-1-0825`. `grok-build-latest` gehört laut xAI **nicht** hierher, sondern steht auf der grok-4.5-Modellseite — ein Prompt, der „grok-build-latest" anspricht, landet also nicht bei grok-build-0.1.
- Verfügbarkeitsstatus widersprüchlich: das Announcement vom 29. Mai 2026 sagt „now available via the xAI API in public beta", die Release Notes (Monat „May", ohne Jahresangabe) „Currently in early access"; die Modellseite nennt keinen Status. Beta-Charakter einplanen.

## Migrations-Hinweise
- **Von grok-code-fast-1**: Seit dem 15. Mai 2026 werden Requests an `grok-code-fast-1` laut Retirement-Guide auf `grok-build-0.1` geroutet; „The slugs themselves continue to resolve". Prompts, die für grok-code-fast-1 getunt wurden, laufen also bereits auf diesem Modell — Verhalten neu evaluieren statt Annahmen über das alte Modell fortzuschreiben (dessen Eigenheiten sind in der aktuellen Doku nicht mehr beschrieben, unbelegt).
- **ZU grok-build-0.1** (z. B. von grok-4.5/4.6/4.7): (1) `reasoning_effort`/`reasoning.effort` nicht mehr als Hebel einplanen — für dieses Modell ist keine Stufe dokumentiert. (2) `presence_penalty`, `frequency_penalty`, `stop` entfernen und Format über Structured Outputs absichern. (3) Kontext auf ≤256k planen; die 200k-Preisklippe liegt nahe am Kontextende. (4) Batch-Jobs umplanen (nicht unterstützt). (5) Das Modell in eine Tool-Schleife/Agent-Harness einbetten, statt es als Chat-Generalisten zu nutzen. (6) Für schwere Aufgaben, die bisher von hoher Reasoning-Tiefe lebten, Qualität gegenprüfen — xAI empfiehlt für Code grok-4.7.
- **VON grok-build-0.1 weg** (zu grok-4.7/4.6): Effort explizit setzen (dort Default `high`, nicht abschaltbar); Kosten steigen auf $2/$6 pro 1M (<200k); Kontext wächst auf 500k.
- `logprobs`/`top_logprobs` werden laut Übersicht für „`grok-4.20` and newer" still ignoriert; ob grok-build-0.1 darunter fällt, ist nicht dokumentiert (unbelegt) — keine Pipeline darauf stützen.
- Grok Build (Agent/CLI) ≠ Modell: Das Announcement nannte grok-build-0.1 „the same model that powers Grok Build"; die aktuelle Grok-Build-Doku nennt kein Default-Modell und erlaubt beliebige Modelle, die Release Notes führen Grok 4.7 Fast als in Grok Build verfügbar. „Grok Build" im Prompt daher nicht mit diesem Modell gleichsetzen.

## Quellen
- https://docs.x.ai/developers/models/grok-build-0.1 — Modellseite: id `grok-build-0.1`, Aliase `grok-code-fast-1`/`grok-code-fast`/`grok-code-fast-1-0825`, 256k Kontext, Text+Bild→Text, Function Calling/Structured Outputs/Reasoning ja ohne Effort-Optionen, Batch API „Not supported", Preistabelle inkl. 200k-Staffel, 37 rps / 10M tpm, Regionen us-east-1/us-west-2; ohne Cutoff, Output-Limit und Statusvermerk.
- https://x.ai/news/grok-build-0-1 — Announcement vom 29. Mai 2026: „public beta", „100+ tokens/second", Positionierung für agentisches Coding/Web-Dev/Debugging/MCP, „performs best in agentic harness", $1/$2 pro 1M, „the same model that powers Grok Build"; keine Benchmarks, keine Prompting-Tipps.
- https://docs.x.ai/developers/migration/may-15-retirement — Mapping `grok-code-fast-1` → `grok-build-0.1`, „significantly improved agentic coding and web dev capabilities", Slugs lösen weiterhin auf.
- https://docs.x.ai/developers/release-notes — Eintrag „Grok Build 0.1 … Currently in early access" unter „May" ohne Jahresangabe; Grok Build (Agent) „now available in beta"; Grok 4.7 Fast in Grok Build verfügbar.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — Summary-Tabelle ohne grok-build-0.1, Klassenregel zu `presencePenalty`/`frequencyPenalty`/`stop`, Abrechnung der Reasoning-Tokens, Summaries nur für grok-4.7, „Some models can also return encrypted reasoning".
- https://docs.x.ai/developers/models — Preisroster (256k), Empfehlung „For everything else, including code, use Grok 4.7", `logprobs`-Hinweis für „`grok-4.20` and newer", Alias-Konvention.
- https://docs.x.ai/developers/models/grok-4.5 — belegt, dass `grok-build-latest` als Alias von grok-4.5 geführt wird, nicht von grok-build-0.1; Vergleichswerte 150 rps / 50M tpm.
- https://docs.x.ai/build/overview — Grok Build unterstützt „any custom model", kein Default-Modell genannt.
- https://docs.x.ai/developers/tools/function-calling — Tool-Beschreibung „helps the model decide when to use it", `parallel_tool_calls: false` zum Abschalten.
- https://docs.x.ai/developers/model-capabilities/text/structured-outputs — `response_format.type: "json_schema"`, Schema-Garantie, Limits und Best-Effort-Keywords.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching — automatisches Caching ab Anfang des `messages`-Arrays, `x-grok-conv-id` und `prompt_cache_key`.

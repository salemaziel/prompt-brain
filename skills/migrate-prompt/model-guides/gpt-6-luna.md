---
model: gpt-6-luna
vendor: OpenAI
family: GPT
aliases: [luna, gpt6-luna, 6-luna]
last_verified: 2026-10-13
status: current
---

# GPT-6 Luna

## Reasoning / Thinking
- `reasoning.effort` akzeptiert `none | low | medium (Default) | high | xhigh | max`. Anders als GPT-6 Astra und GPT-6.1 Sol ist **`none` erlaubt** („GPT-6 Sol and GPT-6 Luna support `none`“). Wahl laut Deployment-Checkliste: `low` für Extraktion, Routing, Klassifikation oder Routine-Umformulierung; `medium`/`high`, wenn das Modell diagnostizieren, abwägen oder planen muss; `xhigh`/`max` nur bei per Eval belegtem Qualitätsgewinn.
- `reasoning.mode` `standard` (Default) | `pro`: Der Reasoning-Guide sagt das für „GPT-5.6 and GPT-6 models“ (nur Responses API); Luna wird dort nicht einzeln genannt — für Luna (unbelegt), vor produktivem Einsatz testen.
- `configuration_update` (Effort mitten in der Konversation ändern, ohne den Prompt-Prefix umzuschreiben) ist für die „GPT-6 model family in standard, single-agent mode“ dokumentiert, mit denselben Grenzen wie bei Astra (keine adjazenten Updates, keine automatische Compaction/Truncation). Luna wird nicht einzeln genannt (unbelegt).
- `reasoning.context`: `all_turns` weist der Reasoning-Guide nur für GPT-5.6-Modelle und GPT-6.1 Sol aus; für Luna nicht dokumentiert (unbelegt) — `auto` setzen und das Response-Feld `reasoning.context` prüfen. Persistiertes Reasoning wird nur innerhalb derselben Modellfamilie wiederverwendet; beim Familienwechsel verwirft die API inkompatible Reasoning-Items.
- Reasoning-Tokens sind unsichtbar, belegen aber Kontext und werden als Output-Tokens abgerechnet; `max_output_tokens` deckelt Reasoning + Antwort gemeinsam (Einstiegsreserve laut Doku mindestens 25.000 Tokens).

## Prompting-Stil
- Eigene Luna-Prompting-Guidance gibt es nicht. Die GPT-6-Prompts im Modell-Guide sind ausdrücklich „a starting point across the GPT-6 model family“, adressieren aber „behavior observed with GPT-6 Astra“ — Autonomie-Baustein, Präzedenzsatz für Skills, Prosa-Anweisung, Slop-Wort-Verbot und Test-Scope-Regeln also nur nach eigener Eval übernehmen; dass Luna dieselben Eigenheiten zeigt, ist nicht belegt (unbelegt).
- Für Luna passende Aufgabenzuschnitte benennen: OpenAI empfiehlt `gpt-6-luna` „for efficient, repeatable work“ und rät, nicht jeden Request an das stärkste Modell zu routen. Prompts eng auf eine klar umrissene Aufgabe zuschneiden, Ausgabeformat explizit vorgeben (Structured Outputs wird unterstützt).
- Detailgrad: Die Deployment-Checkliste nennt `text.verbosity` (`low`/`medium`/`high`) „the main lever for balancing brevity against completeness“ und Inhalt/Struktur/Länge im Prompt; ihr Beispiel nutzt Astra, für Luna nicht einzeln belegt (unbelegt).

## Stärken & Schwächen (prompt-relevant)
- Positionierung: „Our most efficient model for focused, high-volume tasks.“ Im Modell-Guide „Fastest and most cost-effective“ mit „Strong performance for focused, high-volume tasks.“; im Katalog für „cost-sensitive, high-volume workloads“.
- Die Decisions API startete am 06.10.2026 als Beta mit `gpt-6-luna`: „Turn text and images into typed answers 10x faster than the Responses API.“ Bei Prompts mit festem Antworttyp als Alternative zur Responses API prüfen.
- Gleiches Responses-Tool-Set wie Astra (`web_search`, `file_search`, `image_generation`, `code_interpreter`, `hosted_shell`, `apply_patch`, `skills`, `computer_use`, `mcp`, `tool_search`). EU-Data-Residency mit Standard, Fast, Flex und Batch (Regional Processing +10 %).
- Schwächen: nicht die Stufe für die härteste Arbeit — höchste Fähigkeit liegt bei `gpt-6-astra`, komplexes Coding/Professional Work zu geringeren Kosten bei `gpt-6.1-sol`. Bildverständnis war bis zu einem Encoding-Fix am 25.09.2026 beeinträchtigt; OpenAI empfiehlt, Evals mit Bild-Input danach neu laufen zu lassen.

## Output- & Format-Konventionen
- Kontextfenster 1.050.000 Tokens, max. 922.000 Input und 128.000 Output; Knowledge Cutoff 18. Mai 2026. Input Text + Bild, Output Text. Einziger Snapshot: `gpt-6-luna`.
- Preise je 1M Tokens: Input $0,10, Cached Input $0,01, Cache Writes $0,125, Output $0,50. Über 272K Input-Tokens gelten 2× Input-/Cache- und 1,5× Output-Raten für den ganzen Request; Batch/Flex 50 %, Fast mode 2×.
- Endpoints: Chat Completions, Responses, Batch (kein Realtime, Assistants, Fine-tuning, Embeddings, Audio, Moderation). Built-in Tools und Function Calling über die Responses API; **Chat Completions trägt Function Calling nur mit `reasoning_effort: "none"`**.
- Ist der Effort nicht `none`, `temperature`, `top_p` und `top_logprobs` entfernen (bei Chat Completions auch `logprobs`, bei Responses `message.output_text.logprobs` aus `include`).
- Prompt Caching (GPT-5.6 und neuer): Cache-Lebensdauer über `prompt_cache_options.ttl` (`"30m"`), explizite Breakpoints möglich, Cache Writes 1,25× Input-Rate, Mindestpräfix 1.024 sichtbare Input-Tokens.

## Migrations-Hinweise
- **VON gpt-6-luna weg**: `reasoning.*`, `configuration_update` und Decisions-API-Aufrufe sind OpenAI-spezifisch und entfallen bei Fremdzielen. Ziel `gpt-6-astra` oder `gpt-6.1-sol`: `none` → `low`, Function Calling von Chat Completions auf Responses umstellen, Sampling-Parameter streichen. Reasoning-Items aus Luna-Verläufen wandern nicht in andere Familien.
- **ZU gpt-6-luna migrieren**: offizieller Ersatz für `gpt-5.4-nano` (Deprecation 01.10.2026, Shutdown 01.04.2027). (1) `model` auf `gpt-6-luna`. (2) Effektiven Effort beibehalten; `none` geht weiter, `minimal` → `low` und vergleichen. (3) Tools: mit Effort ≠ `none` auf die Responses API. (4) Bei Effort ≠ `none` Sampling-/Logprob-Parameter entfernen. (5) Von GPT-5.5 oder älter: `prompt_cache_retention` → `prompt_cache_options.ttl: "30m"`. (6) Astra-Prompt-Bausteine nur als Startpunkt einsetzen und evaluieren. (7) Bild-Input-Evals neu laufen lassen. (8) Bei gemessener Qualitätslücke auf `gpt-6.1-sol` bzw. `gpt-6-astra` eskalieren.
- Von `gpt-5.6-luna`: kein offizielles Nachfolger-Mapping; GPT-6 Luna ist günstiger ($0,10/$0,50 statt $0,20/$1,20). GPT-5.6-Reasoning-Items und ein gewohntes `all_turns` nicht ungeprüft übernehmen.

## Quellen
- https://developers.openai.com/api/docs/models/gpt-6-luna — Modellseite: id `gpt-6-luna` (einziger Snapshot), Tagline, effort `none`–`max` (Default `medium`), Function Calling in Chat Completions nur mit `none`, 1.050.000/922.000/128.000 Tokens, Cutoff 18.05.2026, Preise inkl. Cache Writes, 272K-Regel, Batch/Flex/Fast, EU-Residency, Endpoint-Matrix, Feature- und Tool-Liste.
- https://developers.openai.com/api/docs/models.md — Katalog: Luna als Featured Model „for cost-sensitive, high-volume workloads“ neben Astra und GPT-6.1 Sol.
- https://developers.openai.com/api/docs/guides/latest-model.md — GPT-6-Modell-Guide (rollierende Seite, Stand 2026-10-13): „Fastest and most cost-effective“, `none` für Sol/Luna, Function-Calling- und Sampling-Regeln, Prompt-Caching-Umstieg, Fast-mode-EU-Residency, Prompts als Startpunkt für die Familie auf Basis von Astra-Beobachtungen.
- https://developers.openai.com/api/docs/guides/reasoning — Luna-Default `medium`, `reasoning.mode` für „GPT-5.6 and GPT-6 models“, `configuration_update` für die GPT-6-Familie, `all_turns` nur GPT-5.6/GPT-6.1 Sol, Reasoning-Wiederverwendung nur innerhalb einer Familie, Abrechnung und 25.000-Token-Reserve.
- https://developers.openai.com/api/docs/guides/deployment-checklist — Effort-Wahl nach Aufgabentyp, `gpt-6-luna` „for efficient, repeatable work“, `text.verbosity`, configuration_update für GPT-6 im Standard-/Single-Agent-Modus.
- https://developers.openai.com/api/docs/guides/prompt-caching — Unterschiede ab GPT-5.6: `prompt_cache_options.ttl` `"30m"`, Breakpoints, 1,25× Cache Writes, 1.024-Token-Mindestpräfix.
- https://developers.openai.com/api/docs/changelog.md — Release von `gpt-6-luna` am 22.09.2026, Bild-Encoding-Fix mit Eval-Empfehlung am 25.09.2026, Decisions API (Beta) mit `gpt-6-luna` am 06.10.2026.
- https://developers.openai.com/api/docs/deprecations — Eintrag 2026-10-01: `gpt-5.4-nano` → `gpt-6-luna`, Shutdown 01.04.2027.

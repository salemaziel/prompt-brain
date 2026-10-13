---
model: gpt-6-sol
vendor: OpenAI
family: GPT
aliases: [gpt6-sol, 6-sol]
last_verified: 2026-10-13
status: current
---

# GPT-6 Sol

## Reasoning / Thinking
- `reasoning.effort` (Responses) bzw. `reasoning_effort` (Chat Completions) akzeptiert `none | low | medium (Default) | high | xhigh | max`. Anders als GPT-6 Astra und GPT-6.1 Sol unterstützt GPT-6 Sol ausdrücklich `none`; `minimal` ist nicht gelistet.
- `reasoning.mode`: `standard` (Default) oder `pro` — laut Reasoning-Guide für GPT-5.6- und GPT-6-Modelle in der Responses API; Mode und Effort sind unabhängig, Pro-Tokens werden zu den Standard-Raten abgerechnet.
- `reasoning.context`: Die Doku listet `all_turns`-Support nur für GPT-5.6-Modelle und GPT-6.1 Sol; für GPT-6 Sol ist er nicht ausgewiesen (unbelegt) — den effektiven Modus im `reasoning.context`-Feld der Response prüfen, statt Reasoning-Persistenz über Turns vorauszusetzen.
- Effort-Wechsel mitten in der Konversation per `configuration_update` ist für „the GPT-6 model family in standard, single-agent mode" dokumentiert; dass GPT-6 Sol darunter fällt, nennt die Doku nicht namentlich (unbelegt).

## Prompting-Stil
- Kein eigener Prompting-Guide für GPT-6 Sol. Die GPT-6-Prompts gelten als „a starting point across the GPT-6 model family", adressieren aber „behavior observed with GPT-6 Astra" — jede Übertragung auf GPT-6 Sol ist (unbelegt) und per Eval zu prüfen.
- Bausteine aus diesem Guide, falls die Evals sie tragen: Autonomie explizit gewähren („bias towards action"), Freigaben erst nach einem „concrete, reviewable result", Präzedenz der User-Anweisungen gegenüber Skills ausschreiben, Prosa ausdrücklich anfordern, Testumfang bei kleinen Änderungen begrenzen.
- Tool-Anweisungen an den API-Pfad koppeln: Built-in Tools und Function Calling laufen über die Responses API; in Chat Completions nur Function Calling und nur mit `reasoning_effort: "none"`.

## Stärken & Schwächen (prompt-relevant)
- Positionierung: „Built to power complex coding and agentic workflows". Im Modellkatalog unter „More models", nicht in der Flagship-Gruppe; die Modellseite verweist auf „GPT-6.1 Sol … for the newer Sol model".
- OpenAI nennt `gpt-6-sol` als empfohlenen Ersatz für die abgekündigten `gpt-5.1` und `gpt-5.3-codex` (Shutdown 1. Apr 2027) — ein typisches Migrationsziel aus älteren Coding-Setups.
- Vorteil gegenüber 6.1 Sol: `none`-Effort als latenzarmer Pfad und Function Calling in Chat Completions (nur mit `none`).
- Eigenheiten: Am 25.09.2026 behob OpenAI einen Bildkodierungs-Bug, der das Bildverständnis verschlechterte; Evals mit Bild-Input aus der Zeit davor wiederholen. Multi-Agent-Beta und Ultrafast mode sind auf den abgerufenen Seiten nur für andere Modelle (u. a. GPT-6.1 Sol) gelistet, nicht für GPT-6 Sol.
- Nicht unterstützt: Realtime, Assistants, Fine-tuning, Embeddings, Bild-/Video-/Audio-Endpunkte, Moderation, Legacy-Completions.

## Output- & Format-Konventionen
- Kontextfenster **1.050.000** Tokens, max. Input **922.000**, max. Output **128.000**; Knowledge-Cutoff **20. Apr 2026**; Input Text + Bild, Output nur Text. Einziger Snapshot: `gpt-6-sol`.
- Endpunkte: `v1/chat/completions`, `v1/responses`, `v1/batch`. Features: streaming, structured_outputs, function_calling, file_search, image_input, web_search, prompt_caching. Hosted Tools (Responses): web_search, file_search, image_generation, code_interpreter, hosted_shell, apply_patch, skills, computer_use, mcp, tool_search.
- Preise pro 1 Mio. Tokens: Input $2, Cached Input $0.2 (10 % der Input-Rate), Cache Writes $2.5 (1,25x), Output $10. Über 272K Input-Tokens: 2x Input-/Cache-Raten und 1,5x Output für den gesamten Request. Batch/Flex 50 %, Fast 2x; EU-Data-Residency mit Standard, Fast, Flex und Batch (+10 % Regional-Aufschlag).
- Prompt-Caching folgt den Regeln für „GPT-5.6 and later": Lebensdauer über `prompt_cache_options.ttl` (`"30m"`), nicht `prompt_cache_retention`.

## Migrations-Hinweise
- **VON gpt-6-sol weg**: Effort auf die Leiter des Ziel-Guides abbilden; `none` nur übernehmen, wenn das Ziel es dokumentiert. Chat-Completions-Function-Calling mit `none` bricht auf Zielen, die Tools nur über Responses erlauben. `reasoning.mode`, `configuration_update` und `prompt_cache_options.ttl` auf Ziel-Äquivalente umschreiben; Kontextbudget von 1,05 Mio. Tokens auf das Zielfenster zurückschneiden.
- **Zu gpt-6.1-sol** (laut OpenAI „the newer Sol model"): OpenAI verlangt „review the migration guidance before switching to GPT-6.1 Sol". (1) `none` → `low`, `minimal` → mit `low` starten. (2) Function Calling aus Chat Completions in die Responses API verlagern. (3) Bei Effort ≠ `none` `temperature`, `top_p`, `top_logprobs` (Chat Completions zusätzlich `logprobs`) entfernen. (4) Neu nutzbar: Multi-Agent-Beta, Ultrafast mode, `all_turns`.
- **ZU gpt-6-sol migrieren** (z. B. von `gpt-5.1` oder `gpt-5.3-codex`, offizieller Ersatz): Effort explizit setzen (Default `medium`); Tool-Workloads mit Reasoning auf die Responses API heben; laut GPT-6-Migrationsleitfaden bei Effort ≠ `none` Sampling-Parameter und Logprobs entfernen; von GPT-5.5 oder früher kommend `prompt_cache_retention` → `prompt_cache_options.ttl: "30m"`.

## Quellen
- https://developers.openai.com/api/docs/models/gpt-6-sol — Modellseite: id/Snapshot `gpt-6-sol`, „Built to power complex coding and agentic workflows", Verweis auf GPT-6.1 Sol als „newer Sol model", Effort-Stufen `none`…`max` (Default `medium`), Function Calling in Chat Completions nur mit `none`, EU-Residency, 1.050.000 / 922.000 / 128.000, Cutoff 20.04.2026, Preise und Faktoren, Endpunkte, Features, Tools.
- https://developers.openai.com/api/docs/guides/latest-model — „Using GPT-6" (rollierende Seite, Stand 2026-10-13): Hinweis „If you already use `gpt-6-sol`, review the migration guidance before switching to GPT-6.1 Sol", Limitations (`none` bei GPT-6 Sol unterstützt), Migration quickstart (Tool-Calling, unsupported parameters, `prompt_cache_options.ttl`), Prompting best practices mit Astra-Bezug.
- https://developers.openai.com/api/docs/guides/reasoning — Default `medium` für GPT-6 Sol, `reasoning.mode` für GPT-5.6/GPT-6, `all_turns`-Support nur für GPT-5.6 und GPT-6.1 Sol gelistet, `configuration_update` für die GPT-6-Familie.
- https://developers.openai.com/api/docs/deprecations — Eintrag 2026-10-01: `gpt-5.3-codex` und `gpt-5.1` → `gpt-6-sol`, Shutdown 1. Apr 2027.
- https://developers.openai.com/api/docs/models/all — Einordnung unter „More models"; Flagship-Gruppe = GPT-6 Astra / GPT-6.1 Sol / GPT-6 Luna.
- https://developers.openai.com/api/docs/guides/prompt-caching — `prompt_cache_options.ttl` (`"30m"`) für GPT-5.6 und später.
- https://developers.openai.com/api/docs/guides/responses-multi-agent — Multi-Agent-Beta gelistet für GPT-6.1 Sol und GPT-5.6, nicht für GPT-6 Sol.
- https://developers.openai.com/api/docs/changelog — 22.09.2026: Release `gpt-6-sol` (Responses und Chat Completions, $2 / $0.20 / $10); 25.09.2026: Fix des Bildkodierungs-Bugs bei GPT-6 Sol/Luna.

---
model: grok-4.20
vendor: xAI
family: Grok
aliases: [grok-4.20-0309-reasoning, grok-4.20-reasoning, grok-4.20-reasoning-latest, grok-4.20-0309, grok-4.20-beta-latest]
last_verified: 2026-10-13
status: current
---

# Grok 4.20

Dieser Guide deckt den Vendor-Alias `grok-4.20` ab, der laut xAI auf `grok-4.20-0309-reasoning` zeigt. Die Schwester-Slugs `grok-4.20-0309-non-reasoning` und `grok-4.20-multi-agent-0309` sind eigene Modelle mit eigenem Verhalten; sie werden unten beschrieben, aber nicht als Aliase dieses Guides geführt.

## Reasoning / Thinking
- Typ: **Reasoning per Modellwahl, nicht per Parameter.** `grok-4.20-0309-reasoning` trägt „Reasoning: Yes", `grok-4.20-0309-non-reasoning` „Reasoning: No" — wer Denken ein- oder ausschalten will, wechselt den Slug.
- Effort-Stufen für die Reasoning-Variante: auf der Modellseite nicht gelistet, und die Summary-Tabelle der Reasoning-Seite nennt sie nicht. Ob `reasoning_effort` wirkt, ignoriert wird oder einen Fehler auslöst, ist unbelegt; Default-Tiefe ebenso (unbelegt).
- **Multi-Agent-Variante** (`grok-4.20-multi-agent`): hier steuert `reasoning.effort` „how many agents collaborate on a request rather than reasoning depth" — `low`/`medium` = 4 Agenten, `high`/`xhigh` = 16 (im xAI SDK `agent_count` 4 oder 16). Dieselbe Effort-Zahl bedeutet also etwas völlig anderes als bei grok-4.5/4.6/4.7.
- Klassenregel: „`presencePenalty`, `frequencyPenalty`, and `stop` cannot be used with reasoning models. Requests that include them return an error." Reasoning-Tokens werden mitabgerechnet.
- Lesbare Reasoning-Summaries beschreibt xAI nur für grok-4.7; für grok-4.20 ist kein lesbarer Denkweg dokumentiert (unbelegt).

## Prompting-Stil
- Herstellerbeschreibung: „a high-performance model with industry-leading speed and agentic tool calling capabilities. It combines the lowest hallucination rate on the market with strict prompt adherence" (Herstelleraussage, nicht unabhängig verifiziert). Daraus folgt: präzise, wörtlich gemeinte Instruktionen; Mehrdeutigkeit wird eher nicht „wohlwollend" aufgelöst (Ableitung, unbelegt).
- Eine modellspezifische Prompting-Guidance publiziert xAI für grok-4.20 nicht; jede darüber hinausgehende Stilaussage ist unbelegt.
- Tool-Auswahl über Tool-Beschreibungen steuern („helps the model decide when to use it"); paralleles Tool-Calling ist an, `parallel_tool_calls: false` schaltet es ab. Format über Structured Outputs (`response_format.type: "json_schema"`, „guaranteed to match your schema", Limits 2.048 / 256 / 64).
- Multi-Agent: xAI empfiehlt, den Scope explizit zu setzen (welche Dimensionen abgedeckt werden sollen), strukturierte Ausgabe wie Vergleichstabellen anzufordern, gewünschte Quellen/Perspektiven zu nennen, tiefe Themen auf Folge-Turns aufzuteilen und Kontext wie Constraints oder Zielmarkt mitzugeben.
- Caching automatisch ab dem Anfang des `messages`-Arrays; statischen Prefix stabil halten, `x-grok-conv-id` bzw. `prompt_cache_key` setzen.

## Stärken & Schwächen (prompt-relevant)
- Stärken: **1M Tokens Kontext**; günstig ($1.25 Input / $2.50 Output pro 1M unter 200k, identisch für alle drei Varianten); **Batch API unterstützt** mit 20 % Rabatt; eine Non-Reasoning-Variante für latenzkritische Pfade; Multi-Agent für tiefe Recherche mit serverseitigen Tools (`web_search`, `x_search`, `code_execution`, `collections_search`, Remote MCP).
- Schwächen/Eigenheiten: keine dokumentierte Effort-Steuerung; kein publizierter Knowledge Cutoff und kein Output-Limit; `logprobs`/`top_logprobs` werden für „`grok-4.20` and newer" still ignoriert; nur us-east-1/us-west-2. Die Modellübersicht empfiehlt für Code und Chat grok-4.7, nicht 4.20.
- Multi-Agent zusätzlich: **Beta** („The API interface and behavior may change"); „Client-side tools (function calling) and custom tools are not currently supported"; `max_tokens` nicht unterstützt; läuft **nicht** über Chat Completions, nur xAI SDK / Responses API; zurück kommen nur Tool-Calls und die Endantwort des Leader-Agenten; alle Agenten-Tokens und Tool-Calls werden abgerechnet; Rate Limit nur 9 rps / 2,5M tpm.

## Output- & Format-Konventionen
- 1.000.000 Tokens Kontext (alle drei Varianten); Input Text + Bild, Output nur Text. Max. Output und Cutoff: nicht publiziert (unbelegt).
- Reasoning-Variante: Function Calling ja, Structured Outputs ja, Reasoning ja; Non-Reasoning: Reasoning nein; Batch API bei allen mit 20 % Rabatt.
- Preise pro 1M Tokens: Input $1.25 (<200k) / $2.50 (≥200k), Cached Input $0.20 / $0.40, Output $2.50 / $5.00; ab 200k Prompt-Tokens gilt der höhere Satz für alle Tokens des Requests. Rate Limits: 37 rps / 10M tpm (Reasoning und Non-Reasoning), 9 rps / 2,5M tpm (Multi-Agent). Regionen us-east-1, us-west-2.
- Vendor-Aliase der Reasoning-Variante u. a. `grok-4.20`, `grok-4.20-reasoning`, `grok-4.20-reasoning-latest`, `grok-4.20-0309`, `grok-4.20-beta-latest` sowie diverse `…-beta`/`…-experimental-beta`-Strings; Non-Reasoning u. a. `grok-4.20-non-reasoning`; Multi-Agent u. a. `grok-4.20-multi-agent`, `grok-4.20-multi-agent-latest`.
- Datum: Die Release Notes melden „Grok 4.20 and Grok 4.20 Multi-agent are live" nur unter „March" ohne Jahresangabe — kein belastbares Freigabedatum (unbelegt).

## Migrations-Hinweise
- **ZU grok-4.20**: (1) Variante bewusst wählen — Reasoning-Slug für Denkaufgaben, `grok-4.20-0309-non-reasoning` als Zero-Thinking-Pfad (statt eines `none`-Efforts). (2) `reasoning_effort` nicht als Tiefenhebel einplanen; Wirkung unbelegt. (3) `presence_penalty`/`frequency_penalty`/`stop` bei Reasoning- und Multi-Agent-Slug entfernen; Formatkontrolle über Structured Outputs. (4) Logik, die auf `logprobs` baut, ersetzen — die Felder werden still ignoriert. (5) Instruktionen wörtlich und vollständig formulieren (strikte Prompt-Adhärenz laut Hersteller). (6) Batch-Jobs sind hier möglich und 20 % günstiger.
- **Auf Multi-Agent umstellen**: Client-Funktionen und Custom Tools entfallen — nur serverseitige Tools/Remote MCP; Chat-Completions-Integrationen auf Responses API umbauen; `max_tokens` streichen; Längensteuerung in den Prompt bzw. ins Schema verlagern; Kosten wegen paralleler Agenten neu kalkulieren.
- **VON grok-4.20 weg** (zu grok-4.7/4.6/4.5): Kontext halbiert sich auf 500k — Chunking prüfen; Preise steigen auf $2/$6 pro 1M (<200k); Reasoning ist dort nicht abschaltbar und Effort hat Default `high`, ein Non-Reasoning-Pfad muss auf `low` umgestellt werden. **Effort-Semantik umdeuten**: ein aus Multi-Agent übernommenes `high`/`xhigh` bedeutete 16 Agenten, dort bedeutet es Denktiefe. Zu grok-4.3: gleiches Preisniveau und 1M Kontext, dort aber `reasoning_effort: none` als Zero-Thinking-Pfad statt eines eigenen Slugs.

## Quellen
- https://docs.x.ai/developers/models/grok-4.20-0309-reasoning — Modellseite: id `grok-4.20-0309-reasoning`, Aliasliste inkl. `grok-4.20`, Beschreibung („industry-leading speed and agentic tool calling", „lowest hallucination rate on the market with strict prompt adherence"), 1M Kontext, Text+Bild→Text, Function Calling/Structured Outputs/Reasoning ja ohne Effort-Optionen, Batch mit 20 % Rabatt, Preistabelle, 37 rps / 10M tpm, us-east-1/us-west-2.
- https://docs.x.ai/developers/models/grok-4.20-0309-non-reasoning — „Reasoning: No", eigene Aliasliste, gleiche Preise, Limits und Regionen.
- https://docs.x.ai/developers/models/grok-4.20-multi-agent-0309 — Multi-Agent-Modellseite: Aliase, 1M Kontext, Batch mit 20 % Rabatt, 9 rps / 2,5M tpm.
- https://docs.x.ai/developers/model-capabilities/text/multi-agent — Beta-Hinweis, `agent_count` 4/16 bzw. Effort-Mapping, unterstützte Server-Tools, keine Client-Funktionen/Custom Tools, kein `max_tokens`, nicht über Chat Completions, nur Leader-Antwort, Abrechnung aller Agenten, Prompting-Empfehlungen.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — Summary-Tabelle (grok-4.20-multi-agent: „Controls agent count (4 or 16)"), Klassenregel `presencePenalty`/`frequencyPenalty`/`stop`, Default `high` und nicht abschaltbares Reasoning bei grok-4.5/4.6/4.7, Summaries nur grok-4.7.
- https://docs.x.ai/developers/models — Preisroster, `logprobs`-Hinweis für „`grok-4.20` and newer", Empfehlung grok-4.7 für Code und Chat, Vergleichswerte grok-4.3/4.5/4.6/4.7.
- https://docs.x.ai/developers/release-notes — „Grok 4.20 and Grok 4.20 Multi-agent are live" unter „March" ohne Jahresangabe.
- https://docs.x.ai/developers/migration/may-15-retirement — belegt `none`-Reasoning-Effort bei grok-4.3 als Zero-Thinking-Ziel.
- https://docs.x.ai/developers/tools/function-calling — Tool-Beschreibungen, `parallel_tool_calls: false`.
- https://docs.x.ai/developers/model-capabilities/text/structured-outputs — Schema-Garantie und Limits.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching — automatisches Caching, `x-grok-conv-id`, `prompt_cache_key`.

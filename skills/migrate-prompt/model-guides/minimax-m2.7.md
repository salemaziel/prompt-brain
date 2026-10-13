---
model: minimax-m2.7
vendor: MiniMax
family: MiniMax
aliases: [minimax-m2.7-highspeed, m2.7, minimax-m27, "MiniMaxAI/MiniMax-M2.7"]
last_verified: 2026-10-13
status: current
---

# MiniMax-M2.7 (inkl. M2.7-highspeed)

## Reasoning / Thinking
- Typ: **Thinking immer an, nicht abschaltbar**. Auf beiden Endpoints gilt für M2.x: `thinking` weggelassen oder `adaptive` → Thinking an; `{"type": "disabled"}` wird „accepted but ignored; thinking remains on". Keine Tiefensteuerung: `output_config.effort` / `reasoning_effort` wirken nur bei M3.1-Flash-Preview, „Other models ignore this field".
- Rückgabe: Anthropic-Pfad als `thinking`-Content-Block; OpenAI-Pfad standardmäßig als `<think>…</think>` im `content`-Feld, mit `reasoning_split=true` getrennt in `reasoning_content`. `reasoning_split` schaltet Thinking weder an noch aus.
- Multi-Turn: die vollständige Assistant-Message muss zurück in die History („must be append to the conversation history to maintain the continuity of the reasoning chain") — Anthropic-Pfad die komplette `response.content`-Liste, OpenAI-Pfad `content` inkl. `<think>`-Tags unverändert.
- Self-Hosting: Reasoning wird über SGLangs `--reasoning-parser minimax-append-think` verarbeitet, Tool Calls über `--tool-call-parser minimax-m2`; wie der Trace danach im Response liegt, hängt laut Vendor von der SGLang-Version ab.

## Prompting-Stil
- **Keine modellspezifische Prompting-Seite mehr.** Die frühere „Usage Tips"-Seite unter `token-plan/` leitet auf die M-Plan-Übersicht um; MiniMax' frühere Ratschläge (Aufgabe ans Ende, Sektionen labeln, diverse Few-Shot-Beispiele) sind für M2.7 daher (unbelegt).
- Belegt durch die Hugging-Face-Modellkarte: Sampling `temperature=1.0`, `top_p=0.95`, `top_k=40` und der Default-System-Prompt „You are a helpful assistant. Your name is MiniMax-M2.7 and is built by MiniMax." Achtung: Die gehostete API hat `top_p`-Default 0.9 und ignoriert `top_k` auf dem Anthropic-Pfad.
- Sichtbares CoT-Scaffolding ist überflüssig, da das Modell ohnehin denkt; ob es die Qualität senkt, ist (unbelegt).

## Stärken & Schwächen (prompt-relevant)
- Laut Vendor ein Modell „for agents, software engineering, and complex productivity tasks"; die Modellkarte nennt Agent Teams, komplexe Skills und dynamische Tool-Suche sowie u. a. SWE-Pro 56,22 % und Terminal Bench 2 57,0 % (Vendor-Angaben).
- **Nur Text und Tool Calls**: „The M2.7, M2.5, M2.1, and M2 series support text and tool-call content blocks only" — kein Bild-/Video-Input.
- Kontext **204.800 Tokens**. M2.7 ca. 60 tps; M2.7-highspeed „Same performance, faster and more agile" mit ca. 100 tps — gleiche Prompts, gleicher Guide.
- Open Weights (`MiniMaxAI/MiniMax-M2.7`, MiniMax-M2.7 License; kommerzielle Nutzung mit Attributions- und Vorab-Genehmigungspflichten). Parameterzahl und Knowledge Cutoff sind auf den offiziellen Seiten nicht angegeben (unbelegt). Structured Outputs/JSON-Schema-Modus sind nicht dokumentiert (unbelegt).
- Thinking ist nicht abschaltbar: für latenzkritische Chat- oder Completion-Fälle ohne Reasoning ist M2.7 strukturell im Nachteil gegenüber M3 mit `disabled`.

## Output- & Format-Konventionen
- Model IDs (API, exakte Schreibweise): `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`.
- `max_tokens` (Anthropic) bzw. `max_completion_tokens` (OpenAI; `max_tokens` dort deprecated): empfohlen 65536, Maximum 204800. Thinking-Tokens zählen mit — zu klein gewählt → `stop_reason: "max_tokens"` ohne Text bzw. `finish_reason: "length"` mit leerem `content`.
- `temperature` [0, 2], Default 1; `top_p` Default **0.9** (M2.x). Anthropic-Pfad: `stop_sequences` und `top_k` werden ignoriert, `tool_choice` nur `auto`/`none`.
- Caching: passives Prefix-Caching (ab 512 Input-Tokens, Reihenfolge tool list → system prompts → user messages) **und** explizites `cache_control` auf dem Anthropic-Pfad — 5 Minuten TTL mit Verlängerung bei Nutzung, max. 4 Breakpoints, 20-Block-Lookback, Cache-Write wird extra berechnet.
- Preise pro 1M Tokens (Pay-as-you-go): M2.7 $0,30 Input / $1,20 Output / $0,06 Cache-Read / $0,375 Cache-Write; M2.7-highspeed $0,60 / $2,40 / $0,06 / $0,375.

## Migrations-Hinweise
- **VON M2.7 zu MiniMax-M3** (vom Vendor für neue Projekte mit Multimodal- oder 1M-Bedarf empfohlen): `thinking` **explizit** auf `adaptive` setzen — auf dem Anthropic-Pfad ist es bei M3 sonst aus, bei M2.7 war es immer an. Ein bisher folgenlos mitgeschicktes `disabled` schaltet bei M3 Thinking tatsächlich ab. `cache_control`-Breakpoints wirken bei M3 laut Support-Matrix nicht mehr — Kosten auf passives Caching stützen. Limits anheben (Kontext bis 1M, `max_tokens` bis 524288), `top_p`-Default wechselt von 0.9 auf 0.95. Bild-/Video-Input wird möglich.
- **VON M2.7 zu M3.1-Flash-Preview**: effort explizit setzen (Default `max`); `reasoning_split=false` geht dort nicht — Thinking kommt in `reasoning_content` statt `<think>` in `content`.
- **ZU M2.7**: Bild-/Video-Inhalte entfernen oder vorab in Text überführen; Kontext auf ≤ 204.800 Tokens und `max_tokens` auf ≤ 204800 trimmen. `thinking: disabled` und effort-Parameter wirken nicht — Latenzbudget für immer-an-Thinking einplanen. Bei wiederkehrenden Präfixen explizite `cache_control`-Breakpoints setzen.
- **VON M2.7 zu anderen Anbietern**: `<think>`-Parsing und `reasoning_split`/`reasoning_details` entfernen, History-Handling an das Ziel anpassen; `stop_sequences`/`top_k`, die hier folgenlos waren, werden dort wieder wirksam.

## Quellen
- https://platform.minimax.io/docs/guides/text-generation — Supported Models: M2.7 und M2.7-highspeed (204.800 Kontext, ca. 60 bzw. 100 tps, „Same performance, faster and more agile"), „MiniMax-M3, MiniMax-M2.7, and MiniMax-M2.7-highspeed also remain available"; ältere Modelle im Legacy-Akkordeon.
- https://platform.minimax.io/docs/release-notes/models — Mar. 18, 2026: „Released MiniMax-M2.7 series (MiniMax-M2.7 / M2.7-highspeed)".
- https://platform.minimax.io/docs/faq/models — M2.7 und M2.7-highspeed unter „Available Models" (nicht retired).
- https://platform.minimax.io/docs/api-reference/text-anthropic-api — Thinking-Control-Tabelle (M2.x: „Accepted but ignored; thinking remains on"), nur Text/Tool-Call-Blöcke für M2.x, Thinking-Tokens in `max_tokens`, ignorierte `stop_sequences`/`top_k`, Multi-Turn-Regel.
- https://platform.minimax.io/docs/api-reference/text-chat-anthropic — `max_tokens` 65536/204800 für Nicht-M3-Modelle, `top_p` 0.9 für M2.x, `output_config.effort` „Other models ignore this field", `tool_choice` nur `auto`/`none`.
- https://platform.minimax.io/docs/api-reference/text-chat-openai — `thinking` für M2.x nicht abschaltbar, `reasoning_effort` ignoriert, `reasoning_split` als Output-Schalter (`<think>` in `content` vs. `reasoning_content`), `max_completion_tokens` 65536/204800.
- https://platform.minimax.io/docs/api-reference/text-openai-api — `<think>`-Inhalte in `content` vollständig erhalten; `finish_reason: "length"` mit leerem `content` bei zu kleinem Limit.
- https://platform.minimax.io/docs/api-reference/text-prompt-caching — passives Caching inkl. M2.7-Serie; Cache Comparison: explizites Caching für M2.7/M2.5/M2.1/M2, 5 Minuten TTL.
- https://platform.minimax.io/docs/api-reference/anthropic-api-compatible-cache — `cache_control`-Mechanik (max. 4 Breakpoints, 20-Block-Lookback), Supported Models inkl. M2.7/M2.7-highspeed.
- https://platform.minimax.io/docs/guides/pricing-paygo — M2.7 $0,3/$1,2/$0,06/$0,375; M2.7-highspeed $0,6/$2,4/$0,06/$0,375.
- https://platform.minimax.io/docs/guides/local-deploy-m2-7 — „For a new project that needs native multimodal input or a 1M-token context, use MiniMax-M3", SGLang-Parser `minimax-append-think` / `minimax-m2`, Lizenzhinweis.
- https://huggingface.co/MiniMaxAI/MiniMax-M2.7 — offizielle Modellkarte: Agent Teams/Skills, SWE-Pro 56,22 %, Terminal Bench 2 57,0 %, Sampling `temperature=1.0`/`top_p=0.95`/`top_k=40`, Default-System-Prompt.
- https://platform.minimax.io/docs/guides/text-m3-function-call — „must be append to the conversation history …", `<think>`-Inhalt in `content` nicht verändern (Guide auf M3 ausgerichtet; Übertragung auf M2.7 über die SDK-Seiten belegt).

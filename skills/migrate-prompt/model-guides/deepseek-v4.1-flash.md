---
model: deepseek-v4.1-flash
vendor: DeepSeek
family: DeepSeek
aliases: [deepseek-flash, v4.1-flash, deepseek-v4-1-flash]
last_verified: 2026-10-13
status: current
---

# DeepSeek-V4.1-Flash

## Reasoning / Thinking
- **Ein Hybrid-Modell hinter `deepseek-flash`** (Modellversion DeepSeek-V4.1-Flash): Non-Thinking und Thinking in einer ID, Thinking ist **per Default an** (Default-Effort `high`). OpenAI-Format: `thinking: {"type": "enabled"|"disabled"}` (im OpenAI-SDK in `extra_body`) plus `reasoning_effort` `none|low|high|max` (`none` = Thinking aus). Anthropic-Format: derselbe `thinking`-Schalter (`budget_tokens` wird ignoriert), Effort über `output_config: {"effort": "low|high|max"}`. Responses-API: `reasoning: {"effort": "none|low|high|max"}`.
- Effort-Mapping angeforderter Stufen: minimal→low, low→low, medium→high, high→high, **xhigh→high**, max→max, ultra→max. `/models` meldet für `deepseek-flash` die Stufen `low|high|max`, Default `high`.
- Modellseitig ist Effort ein **numerisches Budget 1–100** (low = 50, high = 75, max = 100), gerendert als `<｜System｜>Reasoning Effort: {budget} (range 1-100, …)`-Präfix — nur im Thinking-Modus und nur am Anfang der Konversation. Die API bietet nur low/high/max an; Zwischenwerte über die API sind nicht dokumentiert (unbelegt).
- `reasoning_content` kommt neben `content`. Ohne `tools` muss es nicht zurückgereicht werden (die API ignoriert es); **mit `tools`** muss das `reasoning_content` aller Vorturns vollständig zurück an die API — auch für Turns ohne Tool-Call —, sonst HTTP 400.
- Sampling: Im Thinking-Modus sind `temperature`, `presence_penalty`, `frequency_penalty` wirkungslos (kein Fehler). `top_p` wirkt **nur** im Thinking-Modus (effektiv 0.95–1.0, kleinere Werte → 0.95); im Non-Thinking-Modus ist es fest 1.0.
- `tool_choice: required` oder ein benanntes Tool liefert im Thinking-Modus HTTP 400 — Tool-Zwang nur mit `thinking: {"type": "disabled"}`.

## Prompting-Stil
- System-Prompt steht direkt nach BOS: `<｜begin▁of▁sentence｜>{system}<｜User｜>{user}<｜Assistant｜>`; im Thinking-Modus setzt das Template den Effort-Präfix als `<｜System｜>`-Block davor. **Neu ggü. V4:** System-Messages mitten im Verlauf (`<｜System｜>`). Auf dem Anthropic-Messages-Endpoint meldet `/models` `system_prompt_update: in-history` — die jeweils letzte System-Message im Verlauf ist der vollständige wirksame System-Prompt und ersetzt alle früheren.
- **JSON braucht drei Dinge**: `response_format: {"type": "json_object"}`, das Wort „json" plus ein Beispiel des Zielformats im System- oder User-Prompt, und genug `max_tokens`. Ohne JSON-Anweisung im Prompt kann das Modell bis zum Token-Limit Whitespace erzeugen. Kein `json_schema`.
- Prefill über Chat Prefix Completion (Beta): letzte Message `role: "assistant"` mit `prefix: True` gegen `https://api.deepseek.com/beta`, kombiniert mit `stop` gegen nachlaufende Prosa.
- **Bilder (neu ggü. V4-Flash)**: `image_url`-Blöcke (http(s)-URL oder base64-Data-URL) oder `file`-Blöcke (Files-API-`file_id` bzw. `file_data`); `detail` `low` (Downscale auf 512×512) | `high` | `original` | `auto`. Bilder nur in User-Messages — in System- oder Assistant-Messages HTTP 400. Anthropic-Endpoint: `image`-Block mit `source.type` `base64|url|file`.
- Context Caching läuft automatisch, trifft nur bei vollständigem Match einer persistierten Cache-Unit und arbeitet „best-effort"; „statisch vor variabel" ist nur aus den Beispielen abgeleitet (unbelegt).
- Tool-Call-Markup (nur relevant beim Handschreiben von Beispielen oder lokaler Inferenz): DSML **mit führendem Leerzeichen** — `<｜DSML｜ calls>`, `<｜DSML｜ invoke name="…">`, `<｜DSML｜ parameter name="…" string="true|false">`. Lokal empfohlen: `temperature` 1.0, `top_p` 0.95 oder 1.0, 1M Kontext, `max_tokens` ≥ 256K.

## Stärken & Schwächen (prompt-relevant)
- Multimodales MoE mit 552B Backbone-Parametern in Causal-Encoder-Decoder-Architektur: 8B aktiv beim Prefill, 16B beim Decode; KV-Cache laut Hersteller 1/4 HBM bzw. 1/8 SSD der Vorgängergeneration — ausgelegt auf inputlastige Agent-Workloads. Nativ Text + Bild, Output nur Text.
- Stärken (Max-Effort, Herstellerangaben): Agentic Coding — Terminal-Bench 2.1 90.6 (V4-Pro 87.9), DeepSWE v1.1 74.2 (V4-Pro 62.7); Codeforces 3471; GPQA Diamond 90.9. DeepSeek stuft V4.1-Flash vor V4-Pro ein („ahead of V4-Pro on performance, cost, speed & total runtime").
- **Schwäche Faktenwissen**: SimpleQA-Verified (Base) 42.3 vs. 55.2 bei V4-Pro-Base; HLE 36.8 vs. 42.7 bei V4-Pro. Auf den schweren Agent-Benchmarks klar hinter Opus-5.0 (Terminal-Bench 3.0 30.0 vs. 43.3, Terminal-Bench 4.0 31.2 vs. 51.8). Wissenslastige Prompts brauchen eigenes Grounding.
- JSON Output liefert gelegentlich leeren `content` (Prompt anpassen); FIM Completion nur im Non-Thinking-Modus.

## Output- & Format-Konventionen
- **1M Kontext, max. 384K Output** (`/models`: 1048576 / 393216 Tokens). `max_tokens`-Default 8K (Non-Thinking) / 64K (Thinking) / 128K (`reasoning_effort: max`).
- Features: JSON Output, Tool Calls (`strict`-Modus als Beta über `/beta`), Responses API, Anthropic API, Chat Prefix Completion (Beta), FIM (Beta, nur Non-Thinking), Vision. `response_format` nur `text|json_object`; bis 16 `stop`-Sequenzen; `top_logprobs` 0–20; `frequency_penalty`/`presence_penalty` deprecated und wirkungslos.
- Vision-Limits: JPEG/PNG/GIF/WebP; höchstens 1024 Tokens pro Bild; bis 600 Bilder pro Request; Request-Body 48 MiB; Einzelbild 32 MiB (über Files-API-`file_id` 64 MiB).
- Preis pro 1M Tokens (Peak / Off-Peak): Input Cache-Hit $0.006 / $0.003, Cache-Miss $0.30 / $0.15, Output $1.20 / $0.60; Concurrency-Limit 2500. Peak = Mo–Fr 01:00–04:00 und 06:00–10:00 UTC.
- Base-URLs: `https://api.deepseek.com` (OpenAI-SDK), `https://api.deepseek.com/anthropic` (Anthropic-SDK; `claude-haiku*`/`claude-sonnet*` und unbekannte Modellnamen → `deepseek-flash`, `claude-opus*` → `deepseek-v4-pro`), `https://api.deepseek.com/beta` (Prefix Completion, `strict`-Tools). Die Legacy-IDs `deepseek-v4-flash` und `deepseek-v4-flash-vision-exp` werden laut Hersteller vorübergehend auf V4.1-Flash geroutet und zum Flash-Preis abgerechnet.
- Anthropic-Endpoint: `thinking` ohne `budget_tokens`, `output_config` nur `effort`; `top_k`, `cache_control`, `container`, `mcp_servers` werden ignoriert; `document`-, `search_result`-, `redacted_thinking`- und MCP-Blöcke nicht unterstützt.

## Migrations-Hinweise
- **VON V4-Flash (`deepseek-v4-flash`) ZU V4.1-Flash**: base_url behalten, `model` auf `deepseek-flash` setzen — die alte ID läuft nur übergangsweise. Prompt-Deltas: handgeschriebene DSML-Beispiele von `<｜DSML｜tool_calls>` auf `<｜DSML｜ calls>`/`<｜DSML｜ invoke>`/`<｜DSML｜ parameter>` umstellen; Bild-Workarounds (eingefügter OCR-/Alt-Text) können echten Bild-Blöcken weichen; System-Updates dürfen als spätere System-Message kommen.
- **VON V4-Pro ZU V4.1-Flash**: gleiche API-Parameter, gleiche Effort-Stufen, gleiche 1M/384K, aber anderes Template (s. o.). Wissenslastige Prompts mit Referenzmaterial absichern (SimpleQA/HLE niedriger). Anthropic-Endpoint: `in-history` statt `leading-only`.
- **VON `deepseek-chat`/`deepseek-reasoner` (V3/R1-Ära, seit 2026-07-24 15:59 UTC abgeschaltet)**: Der Modell-Split chat-vs-reasoner wird zum Mode-Flag (`thinking: disabled` bzw. `reasoning_effort: none` für Ex-Chat-Prompts); `frequency_penalty`/`presence_penalty` entfernen; R1-Temperatur-Tipps (0.6) sind im Thinking-Modus wirkungslos; in Tool-Loops `reasoning_content` zurückreichen statt strippen; Chunking-Gerüste für alte Kontextfenster streichen.
- **VON V4.1-Flash weg**: `thinking`/`reasoning_effort`/`output_config.effort` auf die Effort-Leiter des Ziel-Guides abbilden und die `reasoning_content`-Rückgabe anpassen; kann das Ziel `json_schema`, das In-Prompt-JSON-Beispiel zu einem echten Schema machen; `prefix: True` durch das Prefill-Äquivalent des Ziels ersetzen; Bild-Blöcke nur übernehmen, wenn der Ziel-Guide Vision dokumentiert (V4-Pro: nicht); spätere System-Messages in die führende System-Message ziehen, wenn das Ziel sie nicht übernimmt (V4-Pro: `leading-only`).
- Lebenszyklus: Das Routing der Legacy-IDs ist als „temporarily" gekennzeichnet; ein V4.1-Pro ist angekündigt, Termin (unbelegt).

## Quellen
- https://api-docs.deepseek.com/news/news260910 — Release-Ankündigung 2026-09-10: 552B MoE, Causal Encoder-Decoder mit 8B/16B aktiv, KV-Cache 1/4 HBM / 1/8 SSD, Modellname `deepseek-flash`, Retirement von V4-Flash/V4-Flash-Vision-Exp mit temporärem Routing, „ahead of V4-Pro"-Aussage, V4.1-Pro angekündigt.
- https://api-docs.deepseek.com/updates — Change Log 2026-09-10: Benchmarks (Terminal-Bench 2.1 90.6, DeepSWE v1.1 74.2, Codeforces 3471, GPQA Diamond 90.9, HLE 36.8), Umstellung auf `deepseek-flash`, Weiterbetrieb von V4-Pro nach dem 2026-09-14.
- https://api-docs.deepseek.com/quick_start/pricing — Modelltabelle: Version DeepSeek-V4.1-Flash, 1M / 384K, Thinking als Default, Feature-Matrix inkl. Vision und FIM nur Non-Thinking, Peak/Off-Peak-Preise und -Zeiten, Concurrency 2500, Fußnote zu den Legacy-IDs.
- https://api-docs.deepseek.com/api/list-models — `deepseek-flash`: 1048576 / 393216 Tokens, `input_modalities` text + image, Effort `low|high|max` mit Default `high`, `system_prompt_update: in-history` (V4-Pro: `leading-only`).
- https://api-docs.deepseek.com/guides/thinking_mode — Toggle und Effort in OpenAI-, Anthropic- (`output_config.effort`) und Responses-Format, Effort-Mapping inkl. minimal/xhigh/ultra, `top_p` nur im Thinking-Modus, `reasoning_content`-Regeln mit/ohne `tools` inkl. 400.
- https://api-docs.deepseek.com/api/create-chat-completion — Modellwerte `deepseek-flash`/`deepseek-v4-pro`, `reasoning_effort`-Enum, `max_tokens`-Defaults und -Maximum, `response_format` text/json_object, 16 Stops, `tool_choice`-400 im Thinking-Modus, Bild-Content-Parts mit `detail`, deprecated Penalties.
- https://api-docs.deepseek.com/guides/vision — Bildformate, drei Eingabewege, `detail`-Stufen, höchstens 1024 Tokens pro Bild, Limits (600 Bilder, 48 MiB Body, 32/64 MiB Einzelbild), Bilder nur in User-Messages, Anthropic-`image`-Block.
- https://api-docs.deepseek.com/guides/anthropic_api — Mapping haiku/sonnet/unbekannt → `deepseek-flash`, opus → `deepseek-v4-pro`; Feldunterstützung (`thinking` ohne `budget_tokens`, `output_config` nur `effort`, ignorierte Felder, nicht unterstützte Blöcke).
- https://api-docs.deepseek.com/guides/json_mode — `json_object`, Pflicht-Literal „json", Beispiel im Prompt, `max_tokens`-Hinweis, gelegentlich leerer `content`.
- https://api-docs.deepseek.com/guides/chat_prefix_completion — Prefill über Assistant-Rolle mit `prefix: True` auf der `/beta`-Base-URL, Kombination mit `stop`.
- https://api-docs.deepseek.com/guides/kv_cache — automatisches Caching, Treffer nur bei vollständigem Match einer Cache-Unit, „best-effort"; die Reihenfolge-Empfehlung „statisch vor variabel" steht dort nicht explizit.
- https://api-docs.deepseek.com/guides/tool_calls — `strict`-Modus (Beta) über `/beta`, in Thinking- und Non-Thinking-Modus.
- https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash — Model Card: 552B MoE, Causal Encoder-Decoder (8B/16B aktiv), native Bildverarbeitung, Effort 1–100, Base-Benchmarks (SimpleQA-Verified 42.3 vs. 55.2 V4-Pro-Base), Instruct-Vergleich mit Opus-5.0 und V4-Pro (HLE, Terminal-Bench 3.0/4.0), empfohlene lokale Sampling-Parameter, MIT-Lizenz.
- https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/encoding/README.md — die drei Template-Änderungen ggü. V4 (DSML mit führendem Leerzeichen, numerischer Effort low=50/high=75/max=100, `<｜System｜>` mitten im Verlauf), BOS-Template, Effort-Präfix nur im Thinking-Modus am Konversationsanfang.

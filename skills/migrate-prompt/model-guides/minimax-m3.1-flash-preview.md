---
model: minimax-m3.1-flash-preview
vendor: MiniMax
family: MiniMax
aliases: [minimax-m3.1, minimax-m3.1-flash, m3.1-flash-preview, m3.1-flash, minimax-m3-1-flash-preview]
last_verified: 2026-10-13
status: current
---

# MiniMax-M3.1-Flash-Preview

## Reasoning / Thinking
- Typ: **Thinking immer an, Tiefe per effort-Leiter**. „Thinking is on by default and needs no configuration"; es lässt sich nicht abschalten. `thinking: {"type": "disabled"}` bzw. effort `none` liefern HTTP 400 mit `model "MiniMax-M3.1-Flash-Preview" requires adaptive thinking; thinking.type="disabled" (including reasoning.effort=none) is not allowed (2013)`. Wird `thinking` gesendet, muss es `{"type": "adaptive"}` sein.
- Tiefe: `low`, `medium`, `high`, `xhigh`, `max` — höhere Stufen denken gründlicher, erzeugen mehr Output-Tokens und mehr Latenz. **Default ohne Angabe ist `max`.** Feldname je Protokoll: Anthropic-kompatibel `output_config.effort`, OpenAI-kompatibel `reasoning_effort`, OpenAI Responses `reasoning.effort`. Latenz/Tokens senkt man laut Vendor über eine niedrigere Stufe, nicht über Abschalten.
- Rückgabe des Thinkings: Anthropic-Pfad als `thinking`-Content-Block (mit `signature`); OpenAI-Pfad **immer** getrennt in `reasoning_content`, `content` enthält nur die Antwort. `reasoning_split=false` (Thinking als `<think>` in `content`) wird für dieses Modell derzeit nicht unterstützt.
- Multi-Turn: Thinking-Blöcke unverändert zurückgeben („preserve them unchanged in later turns, especially in tool-use conversations"); auf dem OpenAI-Pfad muss `reasoning_content` vollständig erhalten bleiben. Die OpenAI-SDK-Seite verweist für Tool Use und Interleaved Thinking dieses Modells auf den M3-Tool-Use-Guide.

## Prompting-Stil
- **Keine modellspezifische Prompting-Seite.** Die frühere „M-series Usage Tips"-Seite ist entfernt (HTTP 404, Stand 2026-10-13); Empfehlungen wie „Aufgabe ans Ende" oder „Sektionen labeln" sind für dieses Modell (unbelegt).
- Offiziell vorhanden sind nur die allgemeinen „Better Prompts"-Hinweise der MiniMax-Code-App, in der das Modell debütierte: gewünschtes Ergebnis beschreiben, nicht nur Schritte; bei Coding-Aufgaben Stack, Constraints und Validierungskriterien nennen; bei Research Ausgabeformat und Quellenanforderungen angeben. Das sind Produkt-, keine Modellhinweise.
- Tiefensteuerung gehört in den effort-Parameter, nicht in Prompt-Text; ob zusätzliche „denke gründlich"-Anweisungen bei hohem effort etwas bewirken, ist (unbelegt).

## Stärken & Schwächen (prompt-relevant)
- Laut Vendor das neueste M-Series-Sprachmodell „for agentic reasoning, tool use, coding, and long-context tasks"; „Frontier multimodal coding model with 1M context window and tunable thinking depth". Input Text, Bild und Video (wie M3).
- **Preview mit eingeschränktem Zugang**: „available only through M Plan and MiniMax Code for now"; Aufruf mit Subscription Key, kein Pay-as-you-go-Preis veröffentlicht. Die M-Plan-FAQ empfiehlt Pay-as-you-go für Produktion — dort ist M3 das Gegenstück.
- Kosten-/Quotenhebel: je höher die Thinking-Tiefe, desto mehr Thinking-Content und desto mehr M-Plan-Verbrauch — der `max`-Default ist die teuerste Stufe.
- Nicht veröffentlicht: Parameterzahl, Benchmarks, Output-Geschwindigkeit, Knowledge Cutoff (unbelegt). Passives Prompt Caching listet MiniMax nur für M3 und M2.x, nicht für dieses Modell (unbelegt); explizites `cache_control` ebenfalls nur für M2.x.

## Output- & Format-Konventionen
- Model ID (API, exakte Schreibweise): `MiniMax-M3.1-Flash-Preview`. Kontextfenster 1.000.000 Tokens. MiniMax' Claude-Code-Anleitung setzt `MiniMax-M3.1-Flash-Preview[1m]`.
- `max_tokens` (Anthropic) bzw. `max_completion_tokens` (OpenAI; `max_tokens` dort deprecated): empfohlen 131072, Maximum 524288. Thinking-Tokens zählen mit — zu klein gewählt → `stop_reason: "max_tokens"` ohne Text bzw. `finish_reason: "length"` mit leerem `content`.
- `temperature` [0, 2], Default 1; `top_p` Default 0.95. Anthropic-Pfad: `stop_sequences` und `top_k` werden ignoriert, `tool_choice` nur `auto`/`none`. Structured Outputs/JSON-Schema-Modus sind nicht dokumentiert (unbelegt).
- Endpoints: `https://api.minimax.io/anthropic` (empfohlen) und `https://api.minimax.io/v1`. Bild bis 10 MB, Video bis 50 MB per URL/base64, größere Videos über die Files API (`mm_file://{file_id}`); Token-Schätzung über `POST /anthropic/v1/messages/count_tokens`.

## Migrations-Hinweise
- **VON MiniMax-M3 hierher**: `thinking: {"type": "disabled"}` entfernen (sonst HTTP 400); effort **explizit** setzen, statt den teuren `max`-Default zu erben; prompt-basierte Tiefensteuerung durch die effort-Stufe ersetzen. Auf dem OpenAI-Pfad nicht mehr auf `<think>` in `content` bauen — Thinking kommt in `reasoning_content`, `reasoning_split=false` geht nicht. API-Key gegen Subscription Key tauschen.
- **ZU MiniMax-M3 zurück** (z. B. für Pay-as-you-go/Produktion): effort-Felder streichen — M3 ignoriert sie stillschweigend; Tiefe wieder über `thinking` an/aus plus Prompt-Text steuern und `thinking` explizit setzen (M3-Default kippt zwischen den Endpoints).
- **VON anderen Anbietern**: ein abgeschaltetes Reasoning der Quelle lässt sich nicht 1:1 abbilden — nächstliegend ist die Stufe `low`; Latenz und `max_tokens` neu bemessen. Sichtbares CoT-Scaffolding („denke Schritt für Schritt") streichen. Claude-`cache_control`-Breakpoints nicht als wirksam einplanen.
- **Hiervon weg**: `output_config.effort`/`reasoning_effort` auf die Leiter des Ziels mappen (Stufennamen sind nicht standardisiert); Thinking-Block-/`reasoning_content`-Handling an das Ziel anpassen; Bild-/Video-Input prüfen.

## Quellen
- https://platform.minimax.io/docs/guides/text-generation — Modelltabelle (1M Kontext, „tunable thinking depth"), „latest M-series language model …", „available only through M Plan and MiniMax Code for now", Thinking immer an, effort-Stufen mit Default `max` und Feldnamen je Protokoll, `reasoning_content` auf dem OpenAI-Pfad, 400-Fehler bei `disabled`/`none`.
- https://platform.minimax.io/docs/api-reference/text-chat-anthropic — Messages-Schema: Model-ID, `thinking` nur `adaptive`, `output_config.effort` (Default `max`, `none` → 400), `max_tokens` 131072/524288, `top_p` 0.95, `temperature` [0, 2], `tool_choice` nur `auto`/`none`.
- https://platform.minimax.io/docs/api-reference/text-anthropic-api — Thinking-Control-Tabelle, vollständige Fehlermeldung (2013), „preserve them unchanged in later turns", Thinking-Tokens in `max_tokens`, ignorierte `stop_sequences`/`top_k`, Medienlimits, `count_tokens`.
- https://platform.minimax.io/docs/api-reference/text-chat-openai — `reasoning_effort` („Only `MiniMax-M3.1-Flash-Preview` supports real thinking-depth tuning"), `reasoning_split=false` nicht unterstützt, `max_completion_tokens` 131072/524288, `max_tokens` deprecated.
- https://platform.minimax.io/docs/api-reference/text-openai-api — `reasoning_content` vollständig erhalten, Thinking-Tokens in `max_tokens` (`finish_reason: "length"`), Verweis auf den Tool-Use-/Interleaved-Thinking-Guide für M3.1.
- https://platform.minimax.io/docs/api-reference/text-prompt-caching — Cache Comparison: passives Caching für M3 und M2.x, explizites nur für M2.x (M3.1 nicht gelistet).
- https://platform.minimax.io/docs/m-plan/faq — M3.1 Flash Preview in allen M-Plan-Stufen, höhere Thinking-Tiefe verbraucht mehr, „Pay-as-you-go is recommended for production use", Subscription Keys getrennt von Pay-as-you-go-Keys.
- https://platform.minimax.io/docs/m-plan/claude-code — `MiniMax-M3.1-Flash-Preview[1m]`, „always enables thinking and cannot turn it off".
- https://platform.minimax.io/docs/guides/pricing-paygo — Pay-as-you-go-Tabelle führt nur M3 und M2.7 (kein M3.1-Preis).
- https://agent.minimax.io/docs/code/get-started/first-task — „Better Prompts"-Hinweise der MiniMax-Code-App.
- https://agent.minimax.io/docs/changelog — v3.0.74 (2026-09-28): M3.1-Flash-Preview debütiert in MiniMax Code; CLI: Standardmodell `MiniMax-M3.1-Flash-Preview`.

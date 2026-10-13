---
model: qwen3.8-flash
vendor: Alibaba
family: Qwen
aliases: [qwen38-flash, qwen3-8-flash]
last_verified: 2026-10-13
status: current
---

# Qwen3.8-Flash

## Reasoning / Thinking
- Typ: **hybrid, per Default an** — die Deep-Thinking-Seite führt die „Qwen3.8 Flash series" als „Hybrid thinking mode, thinking mode enabled by default". Ein Request ohne Thinking-Feld denkt; abschalten pro Request über `enable_thinking: false`.
- Parameter-Platzierung SDK-abhängig: im OpenAI-Python-SDK `enable_thinking`/`thinking_budget` über `extra_body`, im Node.js-SDK als Top-Level-Parameter.
- `thinking_budget` deckelt die Reasoning-Tokens; Default laut API-Referenz = maximale Chain-of-Thought-Länge des Modells, für qwen3.8-flash **262.144 Tokens** (die Konsole nennt abweichend Default 4.000, Bereich 1–32.768).
- Reasoning kommt in `reasoning_content`, die Antwort in `content`. `preserve_thinking` ist für qwen3.8-flash ausdrücklich dokumentiert — ohne das Flag wird früheres Reasoning in der History ignoriert.
- Thinking kostet Kontext: max. Input 983.616 Tokens im Thinking-Modus gegenüber 991.808 ohne; max. Output 131.072.
- Anthropic-kompatibler Messages-Endpoint: `thinking: {type: "enabled" | "disabled"}`; Tiefe über `output_config.effort`, für qwen3.8-flash Default `xhigh`, gültig `xhigh`/`medium`/`low`; `max` und `high` werden auf `xhigh` gemappt. `budget_tokens` ist „to be deprecated". `max_tokens` zählt dort für qwen3.8-flash Antwort **und** Chain-of-Thought zusammen. Was bei fehlendem `thinking`-Feld auf diesem Endpoint passiert, sagt die Seite nicht (unbelegt).

## Prompting-Stil
- **Keine modellspezifische Prompting-Seite.** Offiziell ist nur Alibabas generischer Prompt-Engineering-Guide: Rahmen aus Context, Objective, Style, Tone, Audience, Response; Few-Shot-Beispiele für konsistente Form; Schrittlisten bei komplexen Aufgaben; seltene Trennzeichen (`###`, `===`) zur Abgrenzung. Alles darüber hinaus ist für dieses Modell (unbelegt).
- Weil Thinking per Default läuft, Tiefe über `thinking_budget` bzw. `effort` steuern statt über „denke Schritt für Schritt"-Scaffolding im Prompttext.
- JSON: im `json_object`-Modus muss das Wort **„JSON"** (case-insensitive) in System- oder User-Message stehen, sonst Fehler; im `json_schema`-Modus nicht.
- Cache-freundlich bauen: wiederkehrende Inhalte an den Anfang, variable ans Ende (impliziter Prefix-Cache ab 1.024 Tokens).

## Stärken & Schwächen (prompt-relevant)
- Positionierung laut Release-Notiz: „the latest multimodal model from the Qwen family"; Input Bild/Text/Video, Output Text; „fully compatible with both OpenAI and Anthropic API protocols" (Modellseite nennt Claude Code und Codex als integrierte Entwickler-Tools).
- Günstigste der drei Qwen-Textstufen, die Alibabas Empfehlungsliste führt (qwen3.8-max, qwen3.7-plus, qwen3.8-flash); Preis ohne Längenstaffel über das ganze 1M-Fenster (Referenz Peking/Global $0,113 Input / $0,382 Output pro 1M Tokens).
- Freigeschaltet laut Modellseite: Function Calling, Structured Outputs, Partial Mode und Context Cache in allen Regionen; Web Search nur Peking und Singapur; Batch nur Peking; **kein Fine-Tuning**.
- Offene Basis: Die offizielle Qwen-Modellkarte nennt qwen3.8-flash „the official version based on Qwen3.8-Flash-Next with more production features". Das offene Modell hat nativ 262.144 Kontext (per YaRN bis 1M); dessen Sampling-Empfehlungen (Thinking: `temperature` 1.0, `top_p` 0.95, `top_k` 20; Non-Thinking: 0.7 / 0.80 / 20, `presence_penalty` 1.5) gelten für die offenen Gewichte — ob sie für die gehostete API gelten (unbelegt).
- Nicht publiziert (unbelegt): Knowledge Cutoff, gepinnte Snapshot-ids, Benchmarks gegenüber qwen3.8-max.

## Output- & Format-Konventionen
- Kontextfenster 1.000.000 Tokens; max. Input 991.808 (ohne Thinking) bzw. 983.616 (mit); max. Output 131.072; max. Chain-of-Thought 262.144.
- Structured Output: `response_format` mit `json_object` (Keyword-Pflicht) oder `json_schema` (die Qwen3.8-Flash-Serie ist unter den Schema-fähigen Modellen gelistet). Einschränkungen laut Structured-Output-Seite: `json_schema` für Modelle der Region Singapur „not supported yet" (die Modellseite markiert Structured Outputs dort als unterstützt — widersprüchlich, vor Produktion testen); multimodale Eingaben fallen automatisch auf `json_object` zurück, ohne Schema-Garantie. Anthropic-Endpoint: `output_config.format` mit strikter Durchsetzung für die Qwen3.8-Serie.
- Partial Mode (Prefix Completion): die Modellseite markiert ihn als unterstützt, die Partial-Mode-Seite listet qwen3.8-flash aber nicht und dokumentiert Qwen-Prefill nur für den Non-Thinking-Modus — Prefill zusammen mit Thinking (unbelegt).
- Context Cache: implizit per Default aktiv und nicht abschaltbar, Mindestpräfix 1.024 Tokens; explizit über `cache_control: {"type": "ephemeral"}`, 5 Minuten Gültigkeit mit Reset bei Treffer.
- Ids: `qwen3.8-flash` (Model Studio nennt keine datierten Snapshots). Der Doku-URL-Slug `qwen3-8-flash` ist **nicht** die API-id. Anthropic-Endpoint: nur `/v1/messages`, kein `/v1/models` — id manuell konfigurieren.

## Migrations-Hinweise
- **ZU qwen3.8-flash migrieren**: Wichtigster Bruch — **Thinking läuft, sofern nicht `enable_thinking: false` gesetzt wird.** Prompts von Non-Thinking-Modellen: Latenz, Kosten und `max_tokens` neu bemessen (auf dem Anthropic-Endpoint frisst die Chain-of-Thought dasselbe `max_tokens`), explizite CoT-Aufforderungen streichen und Tiefe über `thinking_budget`/`effort` regeln. Aus Claude-Prompts: `budget_tokens` durch `output_config.effort` ersetzen; `high`/`max` landen auf `xhigh` (Default, höchste Stufe), mittlere Tiefe explizit `medium`. Assistant-Prefill: `enable_thinking: false` setzen oder auf Structured Output ausweichen (strikt nur ohne Bild-/Video-Input). Multi-Turn: `preserve_thinking` entscheidet, ob früheres Reasoning ankommt.
- **VON qwen3.8-max herunter**: dieselbe Parameter-Oberfläche (`enable_thinking`, `thinking_budget` mit gleichem 262.144-Default, `preserve_thinking`, `effort`-Skala, 1M-Fenster, 131.072 Output) — der Prompt kann strukturell bleiben; Qualitätsunterschiede zwischen Max und Flash sind nicht offiziell beziffert (unbelegt), also auf der eigenen Eval-Menge prüfen. Web Search fehlt außerhalb Peking/Singapur.
- **VON qwen3.8-flash weg**: `enable_thinking`, `thinking_budget`, `preserve_thinking`, `reasoning_content`, `partial: true` und `cache_control` sind Model-Studio-spezifisch ausgeprägt — anhand des Ziel-Guides neu abbilden statt 1:1 übernehmen. Die „JSON"-Keyword-Pflicht ist eine Qwen-Eigenheit; Schema-Dialekt des Ziels prüfen. Das 1M-Fenster schrumpft auf vielen Zielen — Chunking neu auslegen; Video-Input entfällt oft.
- Nicht verwechseln: `qwen-flash` ist ein eigenes, weiterhin angebotenes Modell (funktional = `qwen-flash-2025-07-28`, max. Output 32.768, laut Deep-Thinking-Seite Thinking per Default **aus**) und **kein** Alias von qwen3.8-flash.

## Quellen
- https://www.alibabacloud.com/help/en/model-studio/qwen3-8-flash — Modellseite: 1M Kontext, max. Input 991.808 / 983.616 (Thinking), max. Output 131.072, max. CoT 262.144, Input Bild/Text/Video → Text, OpenAI- und Anthropic-Kompatibilität, Claude Code/Codex; Feature-Tabelle je Region (Function Calling, Structured Outputs, Partial Mode, Context Cache überall; Web Search nur Peking/Singapur; Batch nur Peking; kein Fine-Tuning); Preise je Region ohne Längenstaffel; kein Knowledge Cutoff, keine Snapshot-ids.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Eintrag 2026-08-26 `qwen3.8-flash`: „the latest multimodal model from the Qwen family", OpenAI- und Anthropic-kompatibel.
- https://www.alibabacloud.com/help/en/model-studio/models — Empfehlungsliste Textmodelle: qwen3.8-max, qwen3.7-plus, qwen3.8-flash.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — „Qwen3.8 Flash series (Hybrid thinking mode, thinking mode enabled by default)", `preserve_thinking` für qwen3.8-flash, `thinking_budget`-Default = max. CoT (Konsole: 4.000), `extra_body` (Python) vs. Top-Level (Node.js), qwen-flash „thinking mode not enabled by default".
- https://www.alibabacloud.com/help/en/model-studio/anthropic-api-messages — qwen3.8-flash unter Qwen-Flash gelistet; `output_config.effort` Default xhigh, Werte xhigh/medium/low, max/high → xhigh; `budget_tokens` „to be deprecated"; `max_tokens` umfasst für qwen3.8-flash Antwort und Chain-of-Thought; strikte `json_schema`-Durchsetzung für die qwen3.8-Serie; kein `/v1/models`.
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — Qwen3.8-Flash-Serie unter den `json_schema`-Modellen; Singapur „not supported yet"; multimodale Inputs fallen auf `json_object` zurück; „JSON"-Keyword-Pflicht im `json_object`-Modus.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — Liste der Partial-Mode-Modelle (Qwen-Flash nur bis Qwen3.7-Flash, jeweils Non-Thinking); qwen3.8-flash nicht gelistet.
- https://www.alibabacloud.com/help/en/model-studio/context-cache — qwen3.8-flash in den Cache-Listen, Mindestpräfix 1.024 Tokens, impliziter Cache nicht abschaltbar, expliziter Cache 5 Minuten mit Reset bei Treffer.
- https://www.alibabacloud.com/help/en/model-studio/qwen-flash — versionslose id `qwen-flash` = `qwen-flash-2025-07-28`, max. Output 32.768; eigenes Modell.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — generischer, nicht modellspezifischer Prompt-Rahmen (Context, Objective, Style, Tone, Audience, Response), Few-Shot, Schrittlisten, Trennzeichen.
- https://huggingface.co/Qwen/Qwen3.8-Flash-Next — offizielle Qwen-Modellkarte des offenen Basismodells: qwen3.8-flash als „official version based on Qwen3.8-Flash-Next", nativ 262.144 Kontext (YaRN bis 1M), Sampling-Empfehlungen für Thinking/Non-Thinking.

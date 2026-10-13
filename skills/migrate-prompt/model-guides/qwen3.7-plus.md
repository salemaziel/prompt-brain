---
model: qwen3.7-plus
vendor: Alibaba
family: Qwen
aliases: [qwen3.7-plus-2026-05-26, qwen37-plus, qwen3-7-plus]
last_verified: 2026-10-13
status: current
---

# Qwen3.7-Plus

## Reasoning / Thinking
- Typ: **hybrid, per Default an** — die Deep-Thinking-Seite führt die „Qwen3.7 Plus series" (`qwen3.7-plus`, `qwen3.7-plus-2026-05-26`) als „Hybrid thinking mode, thinking mode enabled by default". Abschalten pro Request über `enable_thinking: false`.
- Parameter-Platzierung SDK-abhängig: im OpenAI-Python-SDK `enable_thinking`/`thinking_budget` über `extra_body`, im Node.js-SDK als Top-Level-Parameter.
- `thinking_budget` deckelt die Reasoning-Tokens; Default laut API-Referenz = maximale Chain-of-Thought-Länge des Modells, laut Modellseite **262.144 Tokens** (die Konsole nennt abweichend Default 4.000, Bereich 1–32.768).
- Reasoning kommt in `reasoning_content`; `preserve_thinking` ist für `qwen3.7-plus` und den Snapshot dokumentiert — ohne das Flag wird früheres Reasoning in der History ignoriert.
- Thinking kostet Kontext: max. Input 983.616 Tokens im Thinking-Modus gegenüber 991.808 ohne; max. Output in beiden Modi 131.072.
- Anthropic-kompatibler Messages-Endpoint: qwen3.7-plus ist unter Qwen-Plus gelistet, aber die `output_config.effort`-Werte sind nur für qwen3.8-max/-flash (und andere Anbieter) dokumentiert — welche `effort`-Werte qwen3.7-plus akzeptiert (unbelegt). qwen3.7-plus fällt dort unter „Other models": `max_tokens` begrenzt nur die Antwort, nicht das Denken; die Seite verweist dafür generisch auf `thinking.budget_tokens` (selbst „to be deprecated").

## Prompting-Stil
- **Keine modellspezifische Prompting-Seite.** Offiziell ist nur Alibabas generischer Prompt-Engineering-Guide: Rahmen aus Context, Objective, Style, Tone, Audience, Response; Few-Shot-Beispiele für konsistente Form; Schrittlisten bei komplexen Aufgaben; seltene Trennzeichen (`###`, `===`). Alles darüber hinaus ist für dieses Modell (unbelegt).
- Thinking läuft per Default — Tiefe über `thinking_budget` steuern statt über CoT-Anweisungen im Prompttext.
- JSON: im `json_object`-Modus muss das Wort **„JSON"** (case-insensitive) in System- oder User-Message stehen, sonst Fehler; im `json_schema`-Modus nicht.
- Kontext unter 256k Tokens halten, wenn möglich: oberhalb verdreifacht sich der Preis (siehe Output). Stabile Inhalte an den Anfang, damit der implizite Prefix-Cache (ab 1.024 Tokens) greift.

## Stärken & Schwächen (prompt-relevant)
- Positionierung laut Modellseite: kosteneffizientes Plus-Modell der Qwen3.7-Serie mit stärkeren Vision-Language-Fähigkeiten und Agent-Fähigkeiten für Coding, Tool-Use und Produktivität; Kernmerkmal „multi‑modal interactive hybrid agent capabilities" — reale Szenen wahrnehmen, Bildschirme lesen und GUIs bedienen, Code aus visuellen Vorlagen erzeugen, Mobile-Apps Ende-zu-Ende navigieren. Input Bild/Text/Video, Output Text.
- Alibabas Empfehlungsliste führt qwen3.7-plus als Plus-Textmodell neben qwen3.8-max und qwen3.8-flash; ein Qwen3.8-Plus ist auf den offiziellen Seiten nicht gelistet.
- Freigeschaltet: Function Calling, Prefix Completion und Context Caching in allen Regionen; Structured Outputs und Web Search überall **außer im US-Scope**; Batch nur Peking und Singapur; **kein Fine-Tuning**.
- Nicht publiziert (unbelegt): Knowledge Cutoff, empfohlene Sampling-Parameter, Benchmarks gegenüber qwen3.8-max/-flash.

## Output- & Format-Konventionen
- Kontextfenster 1.000.000 Tokens; max. Input 991.808 (ohne Thinking) bzw. 983.616 (mit); max. Output 131.072; max. Chain-of-Thought 262.144.
- **Längengestaffelte Preise**: bis 256k Input-Tokens z. B. Singapur $0,4 Input / $1,6 Output pro 1M, von 256k bis 1M $1,2 / $4,8 — Faktor 3; dieselbe Stufe gilt für Cache-Preise.
- Structured Output: `json_object` (Keyword-Pflicht) oder `json_schema` (die Qwen3.7-Plus-Serie ist unter den Schema-fähigen Modellen gelistet). Einschränkungen: im US-Scope laut Modellseite gar keine Structured Outputs; die Structured-Output-Seite nennt `json_schema` für Singapur „not supported yet" (die Modellseite markiert Singapur als unterstützt — widersprüchlich, vor Produktion testen); multimodale Eingaben fallen automatisch auf `json_object` zurück, ohne Schema-Garantie. Anthropic-Endpoint: strikte `json_schema`-Durchsetzung für die Qwen3.7-Serie.
- Prefix Completion (Partial Mode): letzte Assistant-Message mit `partial: true`; dokumentiert unter „Qwen-Plus (non-thinking mode): Qwen3.7-Plus series" — also nur mit `enable_thinking: false`.
- Context Cache: implizit per Default aktiv und nicht abschaltbar, Mindestpräfix 1.024 Tokens; explizit über `cache_control: {"type": "ephemeral"}`, 5 Minuten Gültigkeit mit Reset bei Treffer.
- Ids: `qwen3.7-plus` (laut Modellseite funktional gleich dem Snapshot `qwen3.7-plus-2026-05-26`). Der Doku-URL-Slug `qwen3-7-plus` ist **nicht** die API-id. Anthropic-Endpoint: kein `/v1/models`, id manuell konfigurieren.

## Migrations-Hinweise
- **ZU qwen3.7-plus migrieren**: **Thinking läuft per Default** — Prompts von Non-Thinking-Modellen bekommen Latenz und Reasoning-Kosten dazu; `enable_thinking: false` setzen oder `thinking_budget` bemessen und CoT-Anweisungen aus dem Prompt streichen. Assistant-Prefill funktioniert nur mit abgeschaltetem Thinking. Große Kontexte über 256k kosten das Dreifache — Retrieval/Chunking so auslegen, dass Requests darunter bleiben. Aus Claude-Prompts: `effort`-Stufen nicht blind übertragen (für qwen3.7-plus: unbelegt); `max_tokens` deckt auf dem Anthropic-Endpoint nur die Antwort. Strikte Schemas im US-Scope und mit Bild-/Video-Input nicht verfügbar.
- **VON qwen3.8-max/-flash herunter oder hinauf**: dieselben OpenAI-/DashScope-Parameter (`enable_thinking`, `thinking_budget`, `preserve_thinking`) und dieselben Limits (1M/131.072/262.144); Unterschiede liegen in Längenstaffel-Preis, dokumentiertem Partial Mode und den Anthropic-`effort`-Werten (bei 3.8 dokumentiert, hier nicht).
- **VON qwen3.7-plus weg**: `enable_thinking`, `thinking_budget`, `preserve_thinking`, `reasoning_content`, `partial: true` und `cache_control` sind Model-Studio-spezifisch ausgeprägt — anhand des Ziel-Guides neu abbilden statt 1:1 übernehmen. Die „JSON"-Keyword-Pflicht ist eine Qwen-Eigenheit; Schema-Dialekt des Ziels prüfen. Ob das Ziel GUI-/Screen-Agent-Aufgaben trägt, steht im Ziel-Guide, nicht hier.
- Nicht verwechseln: `qwen-plus` ist ein eigenes, weiterhin angebotenes Modell (funktional = `qwen-plus-2025-12-01`, max. Output 32.768, laut Deep-Thinking-Seite Thinking per Default **aus**) und **kein** Alias von qwen3.7-plus.

## Quellen
- https://www.alibabacloud.com/help/en/model-studio/qwen3-7-plus — Modellseite: ids `qwen3.7-plus` / Snapshot `qwen3.7-plus-2026-05-26` (funktional gleich), Positionierung als kosteneffizientes Plus-Modell mit „multi‑modal interactive hybrid agent capabilities" (GUI, Screens, Mobile-Apps, Code aus Bildern), Input Bild/Text/Video → Text, 1M Kontext, max. Input 991.808 / 983.616, Output 131.072, CoT 262.144, Feature-Tabelle je Region (US-Scope ohne Structured Outputs/Web Search, Batch nur Peking/Singapur, kein Fine-Tuning), Preisstaffel ≤256k vs. 256k–1M.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Eintrag 2026-06-01 `qwen3.7-plus`, `qwen3.7-plus-2026-05-26`: kosteneffizientes Plus-Modell der Qwen3.7-Serie; kein Qwen3.8-Plus gelistet.
- https://www.alibabacloud.com/help/en/model-studio/models — Empfehlungsliste Textmodelle: qwen3.8-max, qwen3.7-plus, qwen3.8-flash.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — „Qwen3.7 Plus series (Hybrid thinking mode, thinking mode enabled by default)", `preserve_thinking` für qwen3.7-plus und Snapshot, `thinking_budget`-Default = max. CoT (Konsole: 4.000), `extra_body` vs. Top-Level, qwen-plus „thinking mode not enabled by default".
- https://www.alibabacloud.com/help/en/model-studio/anthropic-api-messages — qwen3.7-plus unter Qwen-Plus gelistet; `effort`-Werte nur für andere Modelle dokumentiert; „Other models": `max_tokens` begrenzt das Denken nicht; strikte `json_schema`-Durchsetzung für die qwen3.7-Serie; kein `/v1/models`.
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — Qwen3.7-Plus-Serie unter den `json_schema`-Modellen; Singapur „not supported yet"; multimodale Inputs fallen auf `json_object` zurück; „JSON"-Keyword-Pflicht.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — „Qwen-Plus (non-thinking mode): Qwen3.7-Plus series", `partial: true` auf der letzten Assistant-Message.
- https://www.alibabacloud.com/help/en/model-studio/context-cache — qwen3.7-plus in den Cache-Listen, Mindestpräfix 1.024 Tokens, impliziter Cache nicht abschaltbar, expliziter Cache 5 Minuten mit Reset bei Treffer.
- https://www.alibabacloud.com/help/en/model-studio/qwen-plus — versionslose id `qwen-plus` = `qwen-plus-2025-12-01`, max. Output 32.768; eigenes Modell.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — generischer, nicht modellspezifischer Prompt-Rahmen (Context, Objective, Style, Tone, Audience, Response), Few-Shot, Schrittlisten, Trennzeichen.

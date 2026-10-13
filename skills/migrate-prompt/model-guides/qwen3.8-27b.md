---
model: qwen3.8-27b
vendor: Alibaba
family: Qwen
aliases: ["Qwen/Qwen3.8-27B", "Qwen/Qwen3.8-27B-FP8", qwen38-27b]
last_verified: 2026-10-13
status: current
---

# Qwen3.8-27B (Open Weights)

## Reasoning / Thinking
- Typ: **hybrid, per Default an**. Die Deep-Thinking-Seite führt `qwen3.8-27b` unter „Hybrid thinking mode, thinking mode enabled by default"; laut Model Card beginnt die Ausgabe mit einem `<think>`-Block.
- Abschalten pro Request: beim Self-Hosting `"enable_thinking": False` in `extra_body["chat_template_kwargs"]`; auf Qwen Cloud `enable_thinking` direkt übergeben (nicht in `chat_template_kwargs`). Im OpenAI-Python-SDK gehören Qwen-Felder in `extra_body`, im Node.js-SDK sind sie Top-Level.
- Tiefensteuerung laut Model Card über `reasoning_effort`: `xhigh` (Default), `medium`, `low` — als **Top-Level-Argument** des Chat-Completions-Calls. Die Card warnt: niedrigerer Effort verkürzt mehrstufige agentische Aufgaben nicht zwingend, sondern kann zu unzureichender Analyse, mehr Fehlschlägen und Retries führen. Die Model-Studio-Doku nennt zusätzlich `thinking_budget` für die Qwen3.8-Serie, ohne dieses Modell einzeln aufzuführen (modellgenau unbelegt).
- `preserve_thinking` ist laut Model Card **per Default an** (Reasoning aller früheren Turns bleibt erhalten); `False` behält nur das Reasoning des letzten User-Turns. Die Deep-Thinking-Seite listet das Modell nicht unter den `preserve_thinking`-fähigen Modellen — auf der gehosteten API unbelegt.
- Reasoning-Länge konsistent dokumentiert: Model Studio max. CoT **262.144**, Model Card empfiehlt bis 262.144 Reasoning- und 131.072 Antwort-Tokens. Ob Model Studio für dieses Modell nur Streaming erlaubt, ist nicht dokumentiert (unbelegt).

## Prompting-Stil
- **Keine modell-spezifische Prompting-Seite.** Offiziell nur Alibabas generischer Prompt-Engineering-Guide: Context, Objective, Style, Tone, Audience, Response; Few-Shot-Beispiele; nummerierte Schrittlisten; seltene Trennzeichen (`###`, `===`, `>>>`). Alles darüber hinaus ist für dieses Modell unbelegt.
- **Zwei getrennte Sampling-Sets** laut Model Card: Thinking `temperature 1.0`, `top_p 0.95`, `top_k 20`, `min_p 0.0`, `presence_penalty 0.0`, `repetition_penalty 1.0`; Instruct/Non-Thinking `temperature 0.7`, `top_p 0.80`, `top_k 20`, `min_p 0.0`, `presence_penalty 1.5`, `repetition_penalty 1.0`. `presence_penalty` ist zwischen 0 und 2 justierbar; höhere Werte können Sprachmischung verursachen. Parameter-Support variiert je Framework.
- Im Thinking-Modus Tiefe über `reasoning_effort` statt über „denke Schritt für Schritt"-Text steuern; für agentische Aufgaben großzügige Output-Länge einplanen (Card).

## Stärken & Schwächen (prompt-relevant)
- Dichtes (dense) 27B-Modell mit Vision-Encoder, 64 Layer mit verschachtelten Gated-DeltaNet- und Gated-Attention-Blöcken; laut Model Studio „native vision-language" (Release 2026-08-17), gegenüber 3.6-27B mit Fokus auf Coding und Office-Szenarien über Text- und Bild-Inputs sowie zuverlässigere End-to-End-Aufgaben.
- Input Text, Bild und Video (die Card nennt auch Stundenvideo-Verarbeitung); Output nur Text. Lizenz Apache-2.0.
- Auf Model Studio freigeschaltet: Function Calling, Structured Outputs, Web Search, Prefix Completion, Context Cache; **nicht**: Batch-Inferenz, Fine-Tuning. Regionen: Peking und Singapur.
- Eigenheiten: statisches YaRN kann die Leistung auf kurzen Texten verschlechtern — nur bei echtem Langkontext-Bedarf aktivieren. Tool-Call-Format und Parser-Flags dokumentiert die Card nicht (unbelegt). Knowledge Cutoff und Sprachumfang sind nicht publiziert (unbelegt).

## Output- & Format-Konventionen
- Model Studio: Kontextfenster 1.000.000; max. Input 991.808 bzw. 983.616 im Thinking-Modus; max. Output 131.072; max. CoT 262.144. Die Doku warnt, die nutzbare Länge könne je nach Parameterkombination variieren.
- Self-Hosting (Model Card): nativer Kontext **262.144**, mit YaRN bis 1.000.000 (`factor` passend zur typischen Länge, z. B. 2.0 für ~524.288). Serving über SGLang, vLLM, TokenSpeed; Langkontext nur mit Override-Flags (vLLM `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` + `--max-model-len` + `--hf-overrides`, SGLang `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1` + `--context-length` + `--json-model-override-args`). FP8-Variante: `Qwen/Qwen3.8-27B-FP8`.
- Structured Output auf Model Studio: die „Qwen3.8 open-source series" steht unter `json_object` (das Wort „JSON" muss im Prompt stehen), **nicht** unter `json_schema` — strikte Schema-Durchsetzung ist für dieses Modell nicht belegt.
- Prefix Completion: Modellseite markiert sie als unterstützt, die Partial-Mode-Seite nennt die Qwen3.8-Open-Source-Serie aber nicht; Zusammenspiel mit Thinking unbelegt — für Prefill-Routen sicherheitshalber `enable_thinking: false` setzen.

## Migrations-Hinweise
- **ZU qwen3.8-27b migrieren**: Thinking läuft, sofern nicht abgeschaltet — ein von einem Non-Thinking-Modell portierter Prompt denkt plötzlich; `max_tokens`, Latenz und Kosten neu bemessen oder `enable_thinking: false` setzen (Self-Hosting in `chat_template_kwargs`, Qwen Cloud direkt). **Sampling-Set an den Modus koppeln**: Thinking 1.0/0.95/20, Instruct 0.7/0.80/20 mit `presence_penalty 1.5` — `temperature 0` aus der Quelle nicht übernehmen. CoT-Scaffolding streichen und `reasoning_effort` setzen. Wer von einem 1M-Kontext-Modell kommt und selbst hostet: ohne YaRN sind es nur 262.144 Tokens. `json_schema`-Strict-Mode ist nicht belegt — Schema im Prompt beschreiben und „JSON" ins Prompt schreiben.
- **VON qwen3.8-27b weg**: `enable_thinking`/`reasoning_effort`/`preserve_thinking`/`chat_template_kwargs` entfernen; ohne eingebautes Reasoning beim Ziel explizite Reasoning-Schritte in den Prompt schreiben; Video-Input entfällt bei vielen Zielen.
- Als dichtes 27B-Modell ist es nicht das Flaggschiff der Serie: für maximale Qualität ist das gehostete **qwen3.8-max** bzw. das offene **qwen3.8-2.4t-a95b** (nur Thinking, nur Text) das Gegenstück — diese Einordnung als Stufe ist eine Ableitung aus den Modellseiten, kein Vendor-Ranking (unbelegt).

## Quellen
- https://www.alibabacloud.com/help/en/model-studio/qwen3-8-27b — Modellseite (Stand 11. Okt. 2026): id `qwen3.8-27b`, Input Bild/Text/Video → Text, 1M Kontext, max. Input 991.808 / 983.616 (Thinking), max. Output 131.072, max. CoT 262.144, Regionen Peking/Singapur, unterstützte (Function Calling, Structured Outputs, Web Search, Prefix Completion, Context Cache) und nicht unterstützte Features (Batch, Fine-Tuning), Hinweis auf parameterabhängige Längen.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — `qwen3.8-27b` als hybrid mit Thinking per Default; Parameter-Platzierung `extra_body` (Python) vs. Top-Level (Node.js); `thinking_budget` für die Qwen3.8-Serie; `preserve_thinking`-Liste ohne dieses Modell.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Eintrag vom 2026-08-17: 27B native vision-language Dense, Fokus Coding/Office gegenüber 3.6-27B.
- https://huggingface.co/Qwen/Qwen3.8-27B — offizielle Model Card: Architektur, Bild/Video-Input, Thinking-Default und Abschalten per `chat_template_kwargs` bzw. direkt auf Qwen Cloud, `reasoning_effort` xhigh/medium/low (Top-Level) mit Effort-Warnung, `preserve_thinking`, beide Sampling-Sets, Output-Längen, nativer Kontext 262.144 / YaRN bis 1M inkl. Flags, YaRN-Vorbehalt, FP8-Repo, Apache-2.0.
- https://huggingface.co/Qwen/Qwen3.8-27B-FP8 — offizielle FP8-Quantisierung von Qwen/Qwen3.8-27B (Apache-2.0).
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — „Qwen3.8 open-source series" nur unter `json_object` (Keyword „JSON" Pflicht), nicht unter `json_schema`.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — Prefix Continuation über letzte Assistant-Message mit `partial: true`; Qwen3.8-Open-Source-Serie nicht in der Modellliste.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — generischer, nicht modellspezifischer Prompt-Rahmen, Few-Shot, Schrittlisten, Trennzeichen.

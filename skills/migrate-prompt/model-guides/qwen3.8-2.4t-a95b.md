---
model: qwen3.8-2.4t-a95b
vendor: Alibaba
family: Qwen
aliases: ["Qwen/Qwen3.8-2.4T-A95B", "Qwen/Qwen3.8-2.4T-A95B-FP8"]
last_verified: 2026-10-13
status: current
---

# Qwen3.8-2.4T-A95B (Open Weights)

## Reasoning / Thinking
- Typ: **nur Thinking, nicht abschaltbar**. Die Deep-Thinking-Seite führt `qwen3.8-2.4t-a95b` als einziges Qwen3.8-Open-Source-Modell unter „Supports thinking mode only"; die Model Card sagt, Thinking ist für alle Interaktionen erforderlich, jede Antwort beginnt mit einem `<think>`-Block, und `enable_thinking` „should not be turned off".
- Tiefensteuerung laut Model Card über `reasoning_effort` mit `xhigh` (Default, komplexe Aufgaben), `medium` und `low` (Tempo/Kosten) — im Beispielcode als **Top-Level-Argument** des Chat-Completions-Calls, nicht in `chat_template_kwargs`. Die Model-Studio-Doku nennt dagegen `thinking_budget` für „Qwen3.8 … series", ohne dieses Modell einzeln aufzuführen; ob `thinking_budget` hier greift, ist damit nicht modellgenau belegt (unbelegt).
- `preserve_thinking` ist laut Model Card **per Default an** (früheres Reasoning bleibt in der History); beim Self-Hosting in `extra_body["chat_template_kwargs"]`, auf Qwen Cloud direkt in `extra_body`. Die Deep-Thinking-Seite listet das Modell **nicht** unter den `preserve_thinking`-fähigen Modellen — für die gehostete API ist das Verhalten damit unbelegt.
- **Dokumentierte Diskrepanz zur Reasoning-Länge:** Model Studio nennt eine max. Chain-of-Thought von **131.072** Tokens, die Model Card empfiehlt (wo das Framework getrennte Limits erlaubt) **262.144** Reasoning-Tokens plus 131.072 für die finale Antwort. Nicht eine Zahl stillschweigend übernehmen — je nach Laufzeit (Model Studio vs. Self-Hosting) die passende Grenze setzen.
- Ob die Qwen3.8-Open-Source-Modelle auf Model Studio nur Streaming unterstützen, sagt die Doku nicht (der Streaming-only-Hinweis nennt nur ältere Open-Source-Versionen wie qwen3.5-27b) — unbelegt.

## Prompting-Stil
- **Keine modell-spezifische Prompting-Seite.** Offiziell gibt es nur Alibabas generischen, ausdrücklich nicht modellgebundenen Prompt-Engineering-Guide: Context, Objective, Style, Tone, Audience, Response; Few-Shot-Beispiele; nummerierte Schrittlisten bei komplexen Aufgaben; seltene Trennzeichen (`###`, `===`, `>>>`). Alles Weitere ist für dieses Modell unbelegt.
- Weil das Modell immer denkt, gehört die Tiefe in `reasoning_effort` statt in den Prompttext; „denke Schritt für Schritt"-Scaffolding dupliziert nur das eingebaute Reasoning.
- Sampling laut Model Card: `temperature 1.0`, `top_p 0.95`, `top_k 20`, `min_p 0.0`, `presence_penalty 0.0`, `repetition_penalty 1.0`. `presence_penalty` darf gegen Wiederholungen auf 0–2 steigen, höhere Werte können aber Sprachmischung und leicht schlechtere Leistung bringen. Welche Parameter greifen, hängt vom Inferenz-Framework ab.
- Für agentische Aufgaben empfiehlt die Model Card ausdrücklich großzügige Output-Länge.

## Stärken & Schwächen (prompt-relevant)
- Architektur: Sparse MoE mit hybridem Attention (Gated DeltaNet + Gated Attention), 2,4 Bio. Parameter, ~95 Mrd. aktiv, 512 Experten (10 geroutet + 1 shared pro Token). Laut Model Studio die Open-Source-Version von Qwens aktuellem Flaggschiff (Release 2026-08-12).
- Vendor-gemeldete Benchmarks (nicht unabhängig geprüft; die Card nennt sie selbst harness-abhängig, teils inhouse): GPQA Diamond 92,6, PaperBench 93,0, OSWorld 86,1, CodeArena global #4.
- Auf Model Studio freigeschaltet: Function Calling, Structured Outputs, Web Search, Prefix Completion, Context Cache; **nicht**: Batch-Inferenz, Fine-Tuning. Regionen: Peking und Singapur.
- Schwächen/Eigenheiten: **nur Text** (die Card schließt multimodale Eingaben aus); **kein Non-Thinking-Pfad** — jeder Request erzeugt Reasoning-Output. Lizenz-Tag auf Hugging Face ist „qwen3.8-max" (keine Apache-Lizenz). Knowledge Cutoff, Sprachumfang und Hardwarebedarf sind nicht publiziert (unbelegt).

## Output- & Format-Konventionen
- Model Studio: Kontextfenster 1.000.000; max. Input 991.808 bzw. 983.616 im Thinking-Modus; max. Output 131.072; max. CoT 131.072. Input/Output nur Text.
- Self-Hosting (Model Card): nativer Kontext **262.144**, erweiterbar auf 1.010.000 Tokens; die Card dokumentiert dafür keine konkreten YaRN-Flags (unbelegt). Serving über SGLang, vLLM, TokenSpeed; die Beispielbefehle (`vllm serve "Qwen/Qwen3.8-2.4T-A95B"`, SGLang `--model-path …`) nennen weder Reasoning- noch Tool-Call-Parser (unbelegt). Gewichte in BF16; `Qwen/Qwen3.8-2.4T-A95B-FP8` ist die offizielle FP8-Variante (block-weise FP8, Blockgröße 128, laut Card nahezu identische Leistung).
- Structured Output auf Model Studio: die „Qwen3.8 open-source series" steht unter `json_object` (das Wort „JSON" muss im Prompt stehen), **nicht** unter `json_schema` — strikte Schema-Durchsetzung ist für dieses Modell nicht belegt.
- Prefix Completion ist auf der Modellseite als unterstützt markiert, die Partial-Mode-Seite nennt die Qwen3.8-Open-Source-Serie aber nicht; wie Prefill mit dem Pflicht-Thinking zusammenspielt, ist unbelegt.

## Migrations-Hinweise
- **ZU qwen3.8-2.4t-a95b migrieren**: Wichtigster Bruch — **Thinking ist nicht abschaltbar.** `enable_thinking: false`, Non-Thinking-Prefill-Routen und Latenzannahmen eines Non-Thinking-Quellmodells brechen; `max_tokens` für Reasoning plus Antwort neu bemessen (131.072 vs. 262.144 CoT je nach Laufzeit, siehe Diskrepanz oben). Explizite CoT-Aufforderungen streichen und die Tiefe über `reasoning_effort` steuern (nicht `thinking_budget`). Bild-/Video-Input entfernen — das Modell ist text-only. `temperature 0`/greedy-Settings durch die Card-Werte 1.0 / 0.95 / 20 ersetzen. Wer `json_schema`-Strict-Mode braucht, hat hier keinen belegten Pfad — Schema im Prompt beschreiben und „JSON" ins Prompt schreiben (`json_object`).
- **VON qwen3.8-2.4t-a95b weg**: `reasoning_effort`-/`chat_template_kwargs`-/`preserve_thinking`-Verdrahtung entfernen; hat das Ziel kein eingebautes Reasoning, Reasoning-/Selbstprüfungs-Schritte wieder in den Prompt schreiben. Beim Wechsel auf kleinere Kontexte Chunking neu auslegen.
- Das gehostete Gegenstück ist **qwen3.8-max**: laut Model Card die offizielle, auf diesem Modell basierende Version mit Vision-Input, Non-Thinking-Support, 1M-Default-Kontext und eingebauten Tools. Wer diese Features braucht, migriert dorthin statt auf die offenen Gewichte; beide sind **nicht** austauschbar.

## Quellen
- https://www.alibabacloud.com/help/en/model-studio/qwen3-8-2-4t-a95b — Modellseite (Stand 11. Okt. 2026): id `qwen3.8-2.4t-a95b`, Text rein/Text raus, 1M Kontext, max. Input 991.808 / 983.616 (Thinking), max. Output 131.072, max. CoT 131.072, Regionen Peking/Singapur, unterstützte (Function Calling, Structured Outputs, Web Search, Prefix Completion, Context Cache) und nicht unterstützte Features (Batch, Fine-Tuning); keine Prompting-Guidance.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — `qwen3.8-2.4t-a95b` unter „Supports thinking mode only"; `thinking_budget` für die Qwen3.8-Serie (nicht modellgenau); `preserve_thinking`-Liste ohne dieses Modell; Streaming-only-Hinweis nennt nur ältere Open-Source-Versionen.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Eintrag vom 2026-08-12: Open-Source-Version des aktuellen Flaggschiffs, Sparse MoE 2,4 Bio. / ~95 Mrd. aktiv, hybrides Attention, Benchmarks.
- https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B — offizielle Model Card: Architektur, text-only, Thinking Pflicht und nicht abschaltbar, `reasoning_effort` xhigh/medium/low (Top-Level), `preserve_thinking` per Default an, Sampling 1.0/0.95/20/0.0, 262.144 Reasoning + 131.072 Antwort, nativer Kontext 262.144 (bis 1.010.000), SGLang/vLLM/TokenSpeed, Verhältnis zu Qwen3.8-Max, Lizenz-Tag, Benchmark-Vorbehalte.
- https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B-FP8 — offizielle FP8-Variante (block-weise FP8, Blockgröße 128, nahezu identische Leistung, text-only, immer Thinking).
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — „Qwen3.8 open-source series" nur unter `json_object` (Keyword „JSON" Pflicht), nicht unter `json_schema`.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — Prefix Continuation über letzte Assistant-Message mit `partial: true`; Qwen3.8-Open-Source-Serie nicht in der Modellliste.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — generischer, nicht modellspezifischer Prompt-Rahmen (Context, Objective, Style, Tone, Audience, Response), Few-Shot, Schrittlisten, Trennzeichen.

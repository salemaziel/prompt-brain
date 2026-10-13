---
model: mistral-small-4
vendor: Mistral AI
family: Mistral
aliases: [mistral-small, mistral-small-latest, mistral-small-2603, small-4, small4, Mistral-Small-4-119B-2603]
last_verified: 2026-10-13
status: current
---

# Mistral Small 4

## Reasoning / Thinking
- Typ: **hybrid, pro Request umschaltbar** über `reasoning_effort` — laut Vendor ein Modell, das Instruct, Reasoning (früher Magistral) und Devstral vereint. Das offizielle Chat-Template akzeptiert genau **zwei** Werte und bricht sonst mit `reasoning_effort must be either "none" or "high"` ab. Kein Token-Budget, kein `thinking`-Objekt.
- **Default ist `"none"`**: fehlt das Feld, setzt das Template es selbst auf `none`. Ein übernommener Prompt läuft also ohne Reasoning, solange der Regler nicht explizit gesetzt wird.
- `"none"`: laut Vendor „equivalent to the same chat style of Mistral Small 3.2" — schnelle, leichte Antworten. `"high"`: „Deep, step-by-step reasoning for complex problems, with equivalent verbosity to previous Magistral models"; Vendor-Empfehlung `high` für komplexe Prompts.
- Sampling ist **an den Modus gekoppelt**: `temperature` 0.7 bei `"high"`, 0.0–0.7 je nach Aufgabe bei `"none"` (die offiziellen Beispiele nutzen 0.1).
- Multi-Turn-Pflicht: die vollständige Assistant-Message **inklusive `ThinkChunk`** zurück in die History spielen — „Do not strip ThinkChunk from assistant messages before replaying them. … significantly degrades output quality."
- `reasoning_effort` gilt auch auf `/v1/agents` und `/v1/conversations`, dort im Feld `completion_args`.

## Prompting-Stil
- **System-Prompt als primäre Steuerfläche**: die Vendor-Card führt „System Prompt: Strong adherence and support for system prompts", und alle offiziellen Usage-Beispiele laden die mitgelieferte `SYSTEM_PROMPT.txt` als System-Message (Platzhalter `{today}` / `{yesterday}` werden vorher eingesetzt).
- Selfhosting-Falle: fehlt eine System-Message, fügt das offizielle Chat-Template **selbst** einen Default-System-Prompt (Le-Chat-Persona, Datums- und Tool-Regeln) ein. Wer neutrales Verhalten will, gibt einen eigenen System-Prompt mit. Ob die API dasselbe tut, ist nicht dokumentiert (unbelegt).
- Rollen-zuerst-Framing aus der offiziellen Prompting-Doku: „You are a <role>, your task is to <task>."; Anweisungen hierarchisch gliedern, Struktur über Markdown und/oder XML-artige Tags, Few-Shot als Beispiel-Turns in der History.
- Wörtlichkeit einplanen: „Mistral Small 4 can follow your instructions to the letter." Geltungsbereich, Abbruchbedingungen und Output-Form ausschreiben.
- Dokumentierte Anti-Patterns der Prompting-Doku: vage Mengenangaben und schwammige Wörter, widersprüchliche Regeln (stattdessen Entscheidungsbaum), das Modell zählen lassen, unnötige Output-Tokens anfordern, numerische Bewertungsskalen statt Wortskalen.

## Stärken & Schwächen (prompt-relevant)
- Architektur: MoE mit 128 Experten, 4 aktiv; 119B Parameter gesamt. Aktive Parameter: Model Card und HF-Card sagen **6.5B**, die Ankündigung „6B active parameters per token (8B including embedding and output layers)" — die Angaben weichen voneinander ab.
- Text + Bild rein, Text raus. Mehrsprachig: die HF-Card nennt „dozens of languages" (u. a. Englisch, Französisch, Spanisch, Deutsch, Chinesisch, Japanisch, Koreanisch, Arabisch).
- Agentik und Coding sind Teil des Zuschnitts: „native function calling and JSON output"; laut Deprecated-Tabelle ist es u. a. der Ersatz für `magistral-small-*` und `devstral-small-2507`.
- Knappe Reasoning-Ausgaben: laut Vendor erreicht Small 4 mit Reasoning GPT-OSS 120B auf allen drei gezeigten Benchmarks oder übertrifft es, „while generating significantly shorter outputs"; auf LiveCodeBench mit 20 % weniger Output. Prompts, die lange Begründungen erzwingen, wirken dem entgegen.
- Kosten: $0.15 Input / $0.015 Cached Input / $0.6 Output pro 1M Tokens — ein Zehntel des Input- und 8 % des Output-Preises von Mistral Medium 3.5. `"high"` erhöht die Output-Tokens.
- Wissensstand: der offizielle System-Prompt schreibt „Your knowledge base was last updated on Friday, November 1, 2024." Eine separate Cutoff-Angabe publiziert Mistral nicht (unbelegt). Maximales Output-Token-Limit: nicht dokumentiert (unbelegt).

## Output- & Format-Konventionen
- Kontextfenster 256k. API-Namen laut Model Card: `mistral-small-2603` (fix) und `mistral-small-latest` (laut Lifecycle-Doku „Latest version, across generations"; „Using an alias may expose you to silent updates in model behavior and pricing"). Für reproduzierbare Prompts `mistral-small-2603` pinnen.
- Antwortform hängt am Modus: bei `"high"` ist `message.content` eine Liste aus `ThinkChunk` und `TextChunk`, bei `"none"` ein plain `str`. Beim Streaming ist `delta.content` erst eine Liste (Thinking), dann ein Übergangs-Chunk mit schließendem `ThinkChunk` plus erstem `TextChunk`, dann ein plain String.
- Features laut Model Card: Chat Completions, Function Calling, Agents & Conversations, Built-In Tools, Structured Outputs, **Predicted Outputs**, Document QnA, Prefix (Assistant-Prefill), Batching.
- Selfhosting-Template-Marker: `[SYSTEM_PROMPT]`, `[INST]`, `[AVAILABLE_TOOLS]`, `[MODEL_SETTINGS]{"reasoning_effort": …}[/MODEL_SETTINGS]`, `[THINK]`, `[TOOL_CALLS]…[ARGS]`, `[TOOL_RESULTS]`, `[IMG]`. Nur die Rollen `user`, `assistant`, `system`, `tool`; die Konversation muss mit `user` oder `system` beginnen.
- Bild-Platzierung im Template: Bilder nur in User- und Tool-Messages, System-Messages sind reiner Text, Assistant-Messages nur Text und Thinking. Besteht ein User-Turn aus genau einem Text- und einem nachfolgenden Bildblock, stellt das Template das Bild nach vorn.
- vLLM-Serving laut HF-Card: `--tool-call-parser mistral --enable-auto-tool-choice --reasoning-parser mistral`.

## Migrations-Hinweise
- **ZU Mistral Small 4 migrieren**: Mistral nennt Small 4 als Alternative für `mistral-small-2506`, `mistral-small-2503`, `mistral-small-2501`, `mistral-small-2409`, `mistral-small-2402`, `magistral-small-2509`, `magistral-small-2507`, `magistral-small-2506`, `devstral-small-2507`, `open-mixtral-8x7b`, `open-mixtral-8x22b`, `mistral-saba-2502` und Mathstral 7B — Ziel-Id entsprechend setzen.
- Von **Magistral Small** kommend: `reasoning_effort: "high"` **explizit setzen**, sonst läuft der Prompt still auf `none` und verliert sein Reasoning. Handgeparste `[THINK]`-Tags durch die `ThinkChunk`-Behandlung ersetzen und `temperature` auf 0.7 setzen.
- Von **Mistral Small 3.x** oder `devstral-small-2507` kommend: `"none"` entspricht laut Vendor dem Small-3.2-Chat-Stil; für komplexe oder agentische Aufgaben gezielt `"high"` setzen und dann Response-Parsing auf die Chunk-Liste umbauen.
- **VON Mistral Small 4 weg**: `reasoning_effort`, `ThinkChunk`-Parsing und die Replay-Regel entfernen; Ziele ohne Reasoning-Regler brauchen wieder explizites Step-by-step-Scaffolding im Prompt. Modus-gekoppelte Sampling-Werte neu kalibrieren. Mistral-Spezifika ersetzen (Prefix-Prefill, Predicted Outputs, Built-In Tools, `completion_args`). Bei Zielen unter 256k das Kontextbudget neu planen, bei Text-only-Zielen Bild-Parts entfernen.
- Innerhalb der Familie: Mistral Medium 3.5 und Mistral Large 4 (`mistral-large-4-0`) nehmen ebenfalls `reasoning_effort`; ein Prompt mit diesem Feld kann also von allen drei stammen.

## Quellen
- https://docs.mistral.ai/models/mistral-small-4-0-26-03 — offizielle Model Card: Release 16. März 2026, GA, Apache 2.0, v26.03, „119B parameters with 6.5B active", 256k Kontext, API-Namen `mistral-small-2603` und `mistral-small-latest`, $0.15 / $0.6 pro 1M, Feature-Liste inkl. Predicted Outputs.
- https://docs.mistral.ai/models — Line-up (Small 4 als Featured) und Deprecated-Tabelle mit Mistral Small 4 als Alternative für die oben genannten Small-, Magistral-Small-, Devstral-Small-, Mixtral-, Saba- und Mathstral-Modelle.
- https://docs.mistral.ai/capabilities/reasoning — `mistral-small-latest` und `mistral-large-4-0` mit `reasoning_effort`, Semantik von `none`/`high`, Chunk-Antwortform, Streaming-Verlauf, Multi-Turn-Replay-Warnung, `completion_args` auf Agents/Conversations.
- https://huggingface.co/mistralai/Mistral-Small-4-119B-2603 — offizielle Vendor-Card: MoE 128/4, 119B / 6.5B aktiv, Text+Bild rein, „Strong adherence and support for system prompts", „follow your instructions to the letter", empfohlene Temperature je Modus, Modusvergleich mit Small 3.2 bzw. Magistral, Benchmarks gegen GPT-OSS 120B, vLLM-Flags.
- https://huggingface.co/mistralai/Mistral-Small-4-119B-2603/raw/main/chat_template.jinja — offizielles Chat-Template: Default `reasoning_effort = 'none'`, die Wertprüfung `none`/`high`, Default-System-Prompt bei fehlender System-Message, Marker, Rollen- und Reihenfolgeregeln, Bild-Platzierung.
- https://huggingface.co/mistralai/Mistral-Small-4-119B-2603/raw/main/SYSTEM_PROMPT.txt — offizieller System-Prompt mit Knowledge-Base-Datum 1. November 2024 und Tool-Nutzungsregeln.
- https://mistral.ai/news/mistral-small-4/ — Ankündigung: vereint Magistral, Devstral und Mistral Small, „6B active parameters per token (8B including embedding and output layers)", Modusbeschreibung, kürzere Outputs als GPT-OSS 120B, API-Name `mistral-small-latest`.
- https://docs.mistral.ai/inference/pricing — Standard-Tier: Small 4 $0.15 Input / $0.015 Cached / $0.6 Output, Medium 3.5 $1.5 / $0.15 / $7.5 pro 1M Tokens.
- https://docs.mistral.ai/inference/model-lifecycle — Alias-Ebenen (`-latest` „Latest version, across generations") und Warnung vor stillen Alias-Updates.
- https://docs.mistral.ai/inference/prompting — modellübergreifende Prompting-Guidance: Rollen-Framing, Struktur, Markdown/XML-Tags, Few-Shot, Anti-Patterns.

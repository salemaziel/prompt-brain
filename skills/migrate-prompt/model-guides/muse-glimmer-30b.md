---
model: muse-glimmer-30b
vendor: Meta
family: Muse
aliases: [muse-glimmer, glimmer, muse_glimmer, "meta-models/Muse-Glimmer-30B", muse-glimmer-30b-gguf]
last_verified: 2026-10-13
status: current
---

# Muse Glimmer 30B

## Reasoning / Thinking
- Typ: **immer an, aber eigener Kanal**. Vor der Antwort schreibt das Modell eine private Chain-of-Thought als `assistant to=self`-Turn; die Nutzerantwort folgt im separaten `assistant to=user`-Turn.
- Tiefe über `reasoning_strength` (`xhigh | high | medium | low`, Default `high`) — kein Sampling-Parameter. Zwei offiziell dokumentierte Wege: (a) bevorzugt als Chat-Template-Argument an `apply_chat_template` bzw. in llama.cpp via `--chat-template-kwargs '{"reasoning_strength":"low"}'` (pro Request `chat_template_kwargs`) — das Template rendert daraus die Zeile `Reasoning strength: <value>` in den System-Turn; (b) laut HF-Modellkarte direkt als Zeile `Reasoning strength: <value>` im System-Prompt — der prompt-seitige Hebel, wenn sich keine Template-kwargs übergeben lassen. Was bei gleichzeitiger Nutzung von (a) und (b) passiert, ist nicht dokumentiert (unbelegt) — nur einen Weg nutzen. OpenAIs `reasoning_effort` ist in llama.cpp nicht implementiert und steuert nichts.
- Frühere Traces per `reasoning_content`-Feld an der Assistant-Message zurückspeisen — das Template rendert daraus den `to=self`-Turn. Auf vLLM `--reasoning-parser muse_glimmer` setzen, sonst leckt der Thinking-Kanal in `content` statt nach `message.reasoning`.
- Reasoning-Traces können lang werden (konkrete Token-Längen beziffert Meta nirgends, unbelegt): `"stream": true` einplanen (Request-Timeouts) und `max_tokens` großzügig lassen — zu klein schneidet mitten im Reasoning ab, bevor die finale Antwort kommt.

## Prompting-Stil
- **Regel Nr. 1: immer `apply_chat_template()`** mit `add_generation_prompt=True` (bei Bildern `AutoProcessor` statt blankem Tokenizer). Handgebaute Prompt-Strings kosten Qualität: das Template setzt System-Metadata-Block, Reasoning-Strength-Zeile und `<|eom|>` vs. `<|eot|>` bei aufeinanderfolgenden gleichen Rollen. In llama.cpp zusätzlich `--jinja` — ohne das brechen Tool-Calling und Reasoning-Trennung.
- System-Prompt: konkret in der Aufgabe, Constraints (Format, Längenlimit, Ton) **vorab** nennen. Ausdrücklich vermeiden: „meta-instructions about how the model works internally" — also keine Anweisungen darüber, wie das Modell intern denken soll.
- Sampling laut Prompting-Guide und HF-Modellkarte: `temperature 1.0`, `top_p 0.95`, `top_k 64`. Warnung (vLLM-Recipe): „Don't run this model greedy. Sending `"temperature": 0` overrides the published settings."

## Stärken & Schwächen (prompt-relevant)
- Stärken: agentische End-to-End-Aufgaben (DeepSearch QA, MCP-Atlas, τ-Bench, SWE-Bench), zuverlässiger Tool-Use mit präzisen Schemas, mehrstufiges Reasoning über lange Workflows, Fehlerdiagnose/-erholung, multimodale Eingabe, 100+ Sprachen. 30B dense: 4-Bit unter 20 GB (24–32-GB-GPUs), bf16-Serving ~72 GB VRAM.
- Schwächen/Eigenheiten: **genau ein Tool-Call pro Turn, keine parallelen Calls** — jedes Tool-Ergebnis muss zurück, bevor das nächste Tool gewählt wird. Text+Bild rein, nur Text raus. Einen offiziellen Limitations-Abschnitt darüber hinaus gibt es nicht (unbelegt).

## Output- & Format-Konventionen
- Kontext: 128K Default („longer contexts supported"), nativ 131072 (llama.cpp: `-c 131072 -np 1 -a muse-glimmer --jinja`). **Max-Output-Tokens offiziell nirgends genannt (unbelegt)** — nur der Hinweis, `max_tokens` für Trace + Antwort mit Reserve zu setzen.
- Control-Tokens: `<|begin_of_text|>`/`<|end_of_text|>`, `<|start|>` (öffnet Turn: Rolle + optional `to=`), `<|message|>` (trennt Header von Inhalt), `<|eot|>` (Turn-Ende), `<|eom|>` (Turn läuft weiter), `<|image|>` (Bild-Sentinel).
- Tool-Calls im nativen ATEM-Format, gerendert aus OpenAI-Style-Schemas im `tools`-Argument des Templates: `<|start|>assistant to=<tool><|message|><atem:function_calls><atem:invoke name="…"><atem:parameter name="…">…</atem:parameter></atem:invoke></atem:function_calls><|eot|>`. Hinter einem OpenAI-kompatiblen vLLM-/llama.cpp-Server (Parser `muse_glimmer`, mit Unterstrichen) kommt das als normales `tool_calls` an — ATEM nie von Hand bauen.
- Structured Output / JSON-Schema-Mode und Assistant-Prefill sind offiziell nicht dokumentiert (unbelegt). Kein Meta-Model-API-Id (die Model API hostet laut Übersicht, Stand 2026-10-13, `muse-wonder-1.0`, `muse-spark-*`, `muse-image-1.0`, `muse-voice-transcribe-1.0` und `sam-3.1`, aber kein Glimmer; Meta nennt u. a. Fireworks AI, OpenRouter und Together AI als Launch-Partner, deren Model-Ids sind nicht dokumentiert, unbelegt) — Produktionskennung ist das HF-Repo `meta-models/Muse-Glimmer-30B` (dazu `-GGUF`, `-assistant` als DFlash-Draft, `-ExecuTorch-PTE`), Apache 2.0.

## Migrations-Hinweise
- **VON Muse Glimmer weg**: explizite Chain-of-Thought-Anweisungen wieder in den Prompt schreiben; ATEM-Blöcke ins Function-Call-Format des Ziels übersetzen; `reasoning_strength`/`reasoning_content`-Verdrahtung entfernen; parallele Tool-Calls reaktivieren, wo das Ziel sie unterstützt.
- **ZU Muse Glimmer migrieren** (typische Quelle Llama 4): Turn-Syntax `<|header_start|>role<|header_end|>` → `<|start|>role<|message|>` (+ `<|eom|>` für fortlaufende Turns); `ipython`-Rolle und Python-/JSON-Calls (`[get_weather(city="…")]`) → recipient-getaggte Turns `to=<tool>` mit ATEM; gebatchte Tool-Requests in sequentielle Turns umbauen (nur 1 Call/Turn); „think step by step"-Scaffolding streichen und stattdessen `reasoning_strength` setzen (Template-Argument, oder bei reiner Prompt-Migration die System-Prompt-Zeile `Reasoning strength: <value>`); Bild-Machinerie (`<|image_start|>`/`<|patch|>`/`<|tile_x_separator|>`) → ein `<|image|>` + `AutoProcessor`; **Kontext-Regression 10M (Scout) / 1M (Maverick) → ~131K** ⇒ Chunking/Retrieval nötig; `temperature 0` raus, 1.0 / 0.95 / 64 rein; keine handgebauten Prompt-Strings mehr.
- Achtung: Meta erklärt Llama 4 nirgends für deprecated und dokumentiert keinen Llama→Muse-Migrationspfad. Glimmer (Stand 2026-10-13) als aktuelles offenes Meta-Modell behandeln; für >131K Kontext bleibt Scout im Blick.

## Quellen
- https://dev.meta.ai/docs/muse-glimmer/prompting — Special-Token-Tabelle, `to=user`/`to=self`/`to=<tool>`, ATEM-Format, „one tool call per turn", `reasoning_strength` + `reasoning_content`, `apply_chat_template`-Pflicht, Sampling 1.0/0.95/64, System-Prompt-Regeln.
- https://dev.meta.ai/docs/muse-glimmer — Architektur (dense, decoder-only, multimodal mit Vision-Encoder), 30B, Apache 2.0, Text+Bild rein / Text raus, 128K Default, Launch-Partner-Liste (u. a. Fireworks AI, OpenRouter, Together AI).
- https://dev.meta.ai/docs/muse-glimmer/llama-cpp — nativer Kontext 131072, `--jinja`, `-a muse-glimmer`, `-c`/`-np`, `--chat-template-kwargs`, `reasoning_effort` nicht implementiert.
- https://dev.meta.ai/docs/muse-glimmer/vllm — ~72 GB VRAM, Tool-Call-Parser und `--reasoning-parser muse_glimmer`, Greedy-Warnung, Streaming-/`max_tokens`-Hinweis.
- https://dev.meta.ai/resources/blog/build-with-muse-glimmer — `apply_chat_template`/`add_generation_prompt`, `to=self`/`to=user`-Ablauf, 128K, 4-Bit unter 20 GB für 24–32-GB-GPUs, Speculative Decoding.
- https://dev.meta.ai/docs/muse-glimmer/get-the-model — die vier offiziellen Hugging-Face-Repos und GGUF-Dateinamen inkl. Vision-Projektor und DFlash-Draft.
- https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model — Distillations-Lineage aus Muse Spark, agentische Stärken/Benchmarks, 100+ Sprachen, kein Limitations-Abschnitt.
- https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama4 — Llama-4-Seite aller Migrations-Deltas: Header-Tokens, `ipython`-Rolle, Tool-Output-Format, Bild-Tokens, Scout 10M / Maverick 1M.
- https://dev.meta.ai/docs/overview — Model API hostet (Stand 2026-10-13) `muse-wonder-1.0`, `muse-spark-1.3`/`1.2`/`1.1`, `muse-spark-1.3-contributor`/`1.2-contributor`, `muse-image-1.0`, `muse-voice-transcribe-1.0`, `sam-3.1`; Muse Glimmer läuft nur aus den offenen Gewichten (kein Model-API-Id).
- https://dev.meta.ai/llama/docs/deployment/versioning — Llama 4 Scout/Maverick nicht deprecated, kein dokumentierter Llama→Muse-Migrationspfad.
- https://huggingface.co/meta-models/Muse-Glimmer-30B — offizielle Modellkarte (Meta Superintelligence Lab): ~29.6B Parameter inkl. Vision-Encoder, 131,072+ Kontext, Apache 2.0, Sampling 1.0/0.95/64, 100+ Sprachen, Best Practice „Reasoning strength can be defined as part of the system prompt as `Reasoning strength: <value>`".

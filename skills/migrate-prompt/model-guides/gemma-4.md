---
model: gemma-4
vendor: Google
family: Gemma
aliases: [gemma, gemma4, gemma-4-12b, gemma-4-12b-it, gemma-4-31b, gemma-4-31b-it, gemma-4-26b-a4b, gemma-4-26b-a4b-it, gemma-4-e4b, gemma-4-e4b-it, gemma-4-e2b, gemma-4-e2b-it, gemma_4]
last_verified: 2026-10-13
status: current
---

# Gemma 4

## Reasoning / Thinking
- Typ: **umschaltbar (an/aus), bei offenen Gewichten über den Prompt statt über einen API-Parameter** (Ausnahme: gehostete Gemini API, siehe unten). Google beschreibt die Familie als „highly capable reasoners, with configurable thinking modes"; die Model Card nennt einen „Built-in reasoning mode that lets the model think step-by-step before answering".
- Geschaltet wird über das Control-Token `<|think|>` **im System-Turn**: `<|turn>system\n<|think|><turn|>` = Thinking an, Token weglassen = aus. Über Transformers äquivalent: `processor.apply_chat_template(…, enable_thinking=True)`.
- Die Gedanken kommen als eigener Kanal zurück (`<|channel>thought … <channel|>`). Zum Auslesen ist `skip_special_tokens=False` laut Doku zwingend; `parse_response` trennt das Ergebnis in `thinking` und `answer`.
- Bei 12B, 26B A4B und 31B trägt das Chat-Template im OFF-Fall ein **leeres Thinking-Token** (`<|turn>model\n<|channel>thought\n<channel|>`) — es stabilisiert den Output, indem ungewollte Thought-Kanäle unterdrückt werden. Handgebaute Prompt-Strings ohne dieses Detail weichen vom trainierten Format ab.
- **Mehrturn-Regel:** die Gedanken des vorherigen Turns müssen vor dem nächsten Request aus der History gestrippt werden. Ausnahme: innerhalb eines Modell-Turns mit Function-Calls dürfen die Thoughts zwischen den Calls **nicht** entfernt werden. Thinking mitten im Gespräch abschalten = `<|think|>` beim Strippen mit entfernen.
- Kein Tiefen-Regler (Budget, effort-Stufen): laut Gemini-API-Doku unterstützt Gemma 4 „strictly" nur an/aus. In der gehosteten Gemini API wird das über `thinking_level` geschaltet — `"high"` = an, `"minimal"` = aus; weitere Stufen nennt die Doku nicht.

## Prompting-Stil
- **Wichtigste Änderung gegenüber Gemma 3: echte System-Rolle.** „Gemma 4 introduces built-in support for the system role." System-Anweisungen gehören wieder in einen eigenen `<|turn>system`-Turn statt an den Anfang der ersten User-Nachricht.
- Auch das Turn-Format ist neu: Klammern `<|turn>` / `<turn|>`, Rollen `system` / `user` / `model`. Die Gemma-3-Tokens `<start_of_turn>` / `<end_of_turn>` gelten hier nicht. Praktisch immer `apply_chat_template()` verwenden, statt Tokens von Hand zu setzen.
- Multimodales: Platzhalter `<|image|>` und `<|audio|>` markieren die Einfügestellen, die Embeddings stehen zwischen `<|image>`/`<image|>` bzw. `<|audio>`/`<audio|>`. Die Model Card empfiehlt, **Bildinhalt vor den Text** zu stellen.
- Tools werden deklariert, nicht in Prosa erklärt: `<|tool>declaration:function_name{description:…,parameters:{…}}<tool|>`; das Modell antwortet mit `<|tool_call>call:…<tool_call|>`, das Ergebnis geht als `<|tool_response>response:…<tool_response|>` zurück. Für Function-Calling rät die Doku ausdrücklich zu aktivem Thinking („By utilizing an internal reasoning process, the model significantly enhances its function-calling accuracy").
- Manuelles CoT-Scaffolding („Denke Schritt für Schritt", Few-shot-Reasoning-Beispiele) ist überflüssig geworden — aus Gemma-3-Zeiten übernommene Choreografie kann gestrichen und durch den Thinking-Schalter ersetzt werden.

## Stärken & Schwächen (prompt-relevant)
- Positionierung von DeepMind: „Our most intelligent open models, built from Gemini 3 research and technology to maximize intelligence-per-parameter". Apache 2.0, Gewichte über Google AI Studio, Hugging Face, Kaggle, Ollama, Vertex AI, Cloud Run sowie vLLM, llama.cpp, MLX, LM Studio und Unsloth.
- Fünf Varianten mit klar unterschiedlichem Profil: E2B (2,3 B effektiv) und E4B (4,5 B effektiv) für Edge/Mobile/Browser; 12B Unified (11,95 B, encoder-free, multimodal); 26B A4B als MoE (25,2 B total / 3,8 B aktiv, „designed for high-throughput, advanced reasoning"); 31B Dense (30,7 B). Der Prompt-Vertrag ist über alle Größen identisch, nur das leere Thinking-Token unterscheidet die großen von E2B/E4B.
- Benchmarks laut DeepMind (31B IT Thinking): Arena AI Text 1452 Elo, MMLU Multilingual 85,2 %, MMMU Pro 76,9 %, AIME 2026 89,2 %, LiveCodeBench 80,0 %, GPQA Diamond 84,3 %, τ2-bench 86,4 %. Google verortet 31B als #3 und 26B als #6 der offenen Modelle im Arena-AI-Text-Leaderboard.
- Sprachen: „out-of-the-box support for 35+ languages, pre-trained on 140+ languages" — Prompts müssen nicht englisch sein, jenseits der 35 gestützten Sprachen ist Qualität aber nicht zugesichert.
- Schwächen laut Model Card: kann faktisch falsche oder veraltete Aussagen erzeugen; „might struggle to grasp subtle nuances, sarcasm, or figurative language" → im Prompt explizit machen statt implizit voraussetzen. Und laut Function-Calling-Doku: „A Gemma model cannot execute code on its own" — die Anwendung muss Tool-Calls validieren und ausführen.
- Trainingsdaten-Cutoff laut Model Card **Januar 2025** — für zeitkritische Fakten Kontext mitliefern statt auf Modellwissen zu bauen.

## Output- & Format-Konventionen
- Kontextfenster: 128K bei E2B/E4B, 256K bei 12B Unified, 26B A4B und 31B. Maximale Output-Länge: nicht publiziert (unbelegt).
- Input Text + Bild bei allen Varianten (variable Auflösung und Seitenverhältnis), Audio nativ bei E2B, E4B und 12B; die Modellübersicht nennt zusätzlich Video. Output ist reiner Text.
- Structured Output: Google führt „structured JSON output" als eingebaute Fähigkeit auf. Ein serverseitiger Schema-Zwang existiert bei offenen Gewichten nicht — Formattreue kommt aus dem Prompt bzw. dem Serving-Stack (unbelegt, ob ein offizieller Schema-Modus dokumentiert ist).
- Empfohlene Sampling-Konfiguration laut Model Card, ausdrücklich „across all use cases": `temperature=1.0`, `top_p=0.95`, `top_k=64`.
- **Ids sind variantenspezifisch** — ein Artefakt mit der blanken id `gemma-4` existiert nicht; `gemma-4` ist hier nur der Familien-Eintrag. Offizielle Repos: `google/gemma-4-E2B-it`, `google/gemma-4-E4B-it`, `google/gemma-4-12B-it`, `google/gemma-4-26B-A4B-it`, `google/gemma-4-31B-it`.
- Gemini API (gehostet, laut Preisseite nur Free Tier; Paid Tier „Not available"): `gemma-4-31b-it`, `gemma-4-26b-a4b-it`. Dort läuft die System-Anweisung über das Feld `system_instruction` / `systemInstruction`, Thinking über `thinking_level`.
- Zusätzlich existieren seit 2026-04-16 MTP-Varianten (Multi-Token Prediction) für E2B, E4B, 31B und 26B A4B; ein davon abweichender Prompt-Vertrag ist nicht dokumentiert (unbelegt).

## Migrations-Hinweise
- **VON Gemma 4 weg**: alle Gemma-4-Tokenizer-Tokens entfernen (`<|turn>`/`<turn|>`, `<|think|>`, `<|channel>`, `<|image|>`/`<|audio|>`, die Tool-Tokens); Tool-Deklarationen aus der Token-Syntax in das JSON-Schema-Format des Zielanbieters übersetzen; `enable_thinking`-, `parse_response`- und Thought-Stripping-Logik entfällt; bei Zielmodellen ohne Thinking wieder explizites CoT-/Few-shot-Prompting ergänzen; Gemma-Sampling (temperature 1.0 / top_p 0.95 / top_k 64) nicht übernehmen — ob und welche Sampling-Parameter das Ziel erlaubt, legt allein der Ziel-Guide fest (manche Ziele lehnen Nicht-Default-Werte ab oder verlangen das Entfernen); bei Zielmodellen ohne System-Rolle — darunter Gemma 3 — die System-Anweisungen zurück an den Anfang der ersten User-Nachricht ziehen.
- **ZU Gemma 4 migrieren**: aus Gemma 3 kommend das gesamte Turn-Format tauschen (`<start_of_turn>`/`<end_of_turn>` → `<|turn>`/`<turn|>`), am sichersten über `apply_chat_template()` statt Handarbeit; eingebettete System-Anweisungen in einen echten `system`-Turn heben; manuelles „Schritt für Schritt"-CoT durch `<|think|>` bzw. `enable_thinking=True` ersetzen; im Multiturn-Betrieb Thought-Stripping implementieren (Ausnahme: Tool-Sequenzen innerhalb eines Turns); `skip_special_tokens=False` beim Dekodieren setzen, sonst greift der Reasoning-Parser nicht; bei 12B/26B/31B im OFF-Fall das leere Thinking-Token mitschreiben. Von API-Modellen kommend: es gibt keinen Effort-/Budget-Regler, nur an/aus (Gemini API: `thinking_level` `high`/`minimal`) — Kostensteuerung läuft über Variantenwahl und Thinking-Schalter. Bildinhalte vor den Text stellen. Kontext wächst gegenüber Gemma 3 von 128K auf 256K (12B/26B/31B); bei E2B/E4B bleibt es bei 128K.

## Quellen
- https://ai.google.dev/gemma/docs/core — Modellübersicht: fünf Architekturen (E2B/E4B, 12B encoder-free, 26B MoE „high-throughput, advanced reasoning", 31B dense), 128K/256K-Kontext, Modalitäten inkl. Video, „built-in support for the system role", „configurable thinking modes", eingebautes Function-Calling.
- https://ai.google.dev/gemma/docs/core/model_card_4 — Parameterzahlen (2,3 B / 4,5 B effektiv, 11,95 B, 25,2 B total mit 3,8 B aktiv, 30,7 B), Kontext pro Größe, Audio nur E2B/E4B/12B, „35+ languages … pre-trained on 140+", Trainingsdaten-Cutoff Januar 2025, Apache 2.0, „Built-in reasoning mode", Limitationen (Faktenfehler, Sarkasmus/bildhafte Sprache).
- https://ai.google.dev/gemma/docs/core/prompt-formatting-gemma4 — vollständige Control-Token-Tabelle: `<|turn>`/`<turn|>`, Rollen `system`/`user`/`model`, `<|image|>`/`<|audio|>`, `<|tool>`/`<|tool_call>`/`<|tool_response>`/`<|"|>`, `<|think|>`, `<|channel>`/`<channel|>`; Mehrturn-Stripping-Regel und die Tool-Call-Ausnahme.
- https://ai.google.dev/gemma/docs/capabilities/thinking — `enable_thinking=True` im Chat-Template, ON/OFF-Templates für E2B/E4B vs. 12B/26B/31B, leeres Thinking-Token zur Output-Stabilisierung, `parse_response` und `skip_special_tokens=False`, Thinking mitten im Gespräch über Entfernen von `<|think|>` abschalten; nur Zustände ON/OFF, kein Tiefen-Regler; Repo-Ids aller fünf `-it`-Checkpoints (`google/gemma-4-E2B-it` … `google/gemma-4-31B-it`).
- https://ai.google.dev/gemma/docs/capabilities/text/function-calling-gemma4 — Syntax für Tool-Deklaration, Tool-Call und Tool-Response, Empfehlung zu aktivem Thinking für höhere Function-Calling-Genauigkeit, „A Gemma model cannot execute code on its own".
- https://ai.google.dev/gemma/docs/releases — Release-Daten: E2B/E4B/31B/26B A4B am 2026-03-31, MTP-Varianten am 2026-04-16, 12B Unified am 2026-06-03; „text, audio and image input and long up to 256K context window".
- https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/ — Größenbezeichnungen, 128K/256K, „natively trained on over 140 languages", Apache 2.0, „function-calling, structured JSON output, and native system instructions", Arena-AI-Platzierungen #3/#6, Distributionskanäle.
- https://deepmind.google/models/gemma/gemma-4/ — Positionierungssatz „Our most intelligent open models …", 140 Sprachen, Benchmarkwerte für „Gemma 4 31B IT Thinking".
- https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api — gehostete Gemini-API-Ids `gemma-4-31b-it` / `gemma-4-26b-a4b-it`, `system_instruction`, Thinking „strictly" nur an/aus über `thinking_level` `high`/`minimal`.
- https://ai.google.dev/gemini-api/docs/pricing — Gemma 4: Free Tier „Free of charge", Paid Tier „Not available".
- https://huggingface.co/google/gemma-4-31B-it — offizielles Repo-Id-Schema, Best Practices: `temperature=1.0`, `top_p=0.95`, `top_k=64` „across all use cases", `<|think|>` am Anfang des System-Prompts, Bildinhalt vor dem Text.
- https://ai.google.dev/gemma/docs/core/prompt-structure — Vergleichsbasis Gemma 3 für die Migrations-Hinweise: Turn-Tokens `<start_of_turn>`/`<end_of_turn>`, nur die Rollen `user`/`model`, „the `system` role or a system turn is not supported" (System-Anweisung gehört an den Anfang der ersten User-Nachricht).
- https://ai.google.dev/gemma/docs/core/model_card_3 — Vergleichsbasis Gemma 3 für den Kontextsprung: „Total input context of 128K tokens for the 4B, 12B, and 27B sizes", 32K bei 1B/270M.

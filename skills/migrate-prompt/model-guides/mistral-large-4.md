---
model: mistral-large-4
vendor: Mistral AI
family: Mistral
aliases: [mistral-large-4-0, large-4, large4, Mistral-Large-4-1T-A52B]
last_verified: 2026-10-13
status: current
---

# Mistral Large 4

## Reasoning / Thinking
- Typ: **hybrides Instruct-und-Reasoning-Modell**, laut Ankündigung „unifies instruction, reasoning, and agentic capabilities in a single model". Reasoning wird **pro Request** über `reasoning_effort` gesteuert; die Reasoning-Doku führt `mistral-large-4-0` mit „No extra configuration required — just add the parameter to any chat completion request."
- Semantik für Mistral-Modelle laut Reasoning-Doku: `"high"` liefert einen vollständigen Thinking-Chunk vor der Antwort (mehr Tokens), `"none"` denkt minimal und lässt den Thinking-Chunk weg. Der Usage-Beispielcode der Model Card setzt `reasoning_effort="high"`.
- **Default-Wert für Large 4 ist nicht dokumentiert (unbelegt)**, ebenso, ob Large 4 weitere Werte als `"none"`/`"high"` akzeptiert (unbelegt). Den Regler deshalb immer explizit setzen statt auf einen Default zu bauen.
- Multi-Turn-Pflicht: die vollständige Assistant-Message **inklusive `ThinkChunk`** in die History zurückspielen. Doku-Warnung: „Do not strip ThinkChunk from assistant messages before replaying them. … Stripping them increases token efficiency but significantly degrades output quality."
- `reasoning_effort` gilt auch auf den Agents- und Conversations-Endpoints, dort im Feld `completion_args`.
- Eine Sampling-Empfehlung (temperature/top_p) für Large 4 publiziert Mistral nicht (unbelegt).

## Prompting-Stil
- Eine **Large-4-spezifische Prompting-Guidance gibt es nicht (unbelegt)**; es gilt Mistrals modellübergreifende Prompting-Doku.
- Rollen-zuerst-Framing: „You are a <role>, your task is to <task>." Anweisungen hierarchisch in Sektionen und Subsektionen gliedern, vollständig und so, als hätte der Leser keinerlei Vorwissen.
- Struktur über **Markdown und/oder XML-artige Tags** (Begründung der Doku: lesbar, parsebar, aus dem Training vertraut). Few-Shot als Beispielsektion im Prompt oder als vorangestellte user/assistant-Turns. System-Prompt = genereller Kontext und Verhalten, User-Prompt = Kontext der aktuellen Interaktion; ohne Kontrolle über den System-Prompt die generellen Anweisungen der User-Message voranstellen.
- Dokumentierte Anti-Patterns: unscharfe Quantoren und schwammige Wörter („too long", „make it better"), Widersprüche in langen System-Prompts (stattdessen Entscheidungsbaum), das Modell Wörter/Zeichen zählen lassen (Zahlen als Input mitgeben), numerische Bewertungsskalen (stattdessen Wortskalen), unnötiger Output.
- Agentische Prompts: laut Ankündigung betreibt das Modell „general-purpose agents that gather information, use tools, and produce finished deliverables"; Robustheit gegen indirekte Prompt-Injection beschreibt Mistral als in den eigenen Benchmarks gesättigt. Eine Empfehlung zur Tool-Anzahl oder zum Bildformat (wie das ~1:1 bei Large 3) gibt es für Large 4 nicht (unbelegt).

## Stärken & Schwächen (prompt-relevant)
- Größe: die Model Card nennt **52B aktive / 1.05T Gesamtparameter plus 1.6B Vision-Encoder** (granulares MoE); die Ankündigung rundet auf „1 trillion-parameter … with 52 billion active parameters". Bei Abweichungen gilt die Model Card.
- Stärken laut Vendor: Agentic Coding (61.7 % DeepSWE v1.1, 59.4 % SWE-Atlas-QnA, 28.3 % Terminal-Bench 4), Cybersecurity, Finanz-, Rechts- und wissenschaftliche Workflows; Launch-Blurb „state-of-the-art among open weights on cybersecurity, finance, and manufacturing". Nativ multimodal (Text + Bild rein).
- Mehrsprachig: Trainingsdaten aus „more than 160 languages, including every official language of the European Union".
- Vom Vendor selbst benannte Schwäche: die durchschnittliche Ablehnungsrate auf Cyber-Prompts (JailbreakBench, StrongREJECT, AgentHarm) „is higher than all OSS models". Wie stark das legitime Security-Prompts trifft, ist nicht beziffert (unbelegt).
- **Public Preview**: laut Ankündigung läuft der RL-Trainingslauf noch und das Modell „continues to improve rapidly"; laut Lifecycle-Doku bekommen Preview-Modelle stille Updates und „may be retired before reaching" GA (Deprecation-Frist für Preview: 1 Monat). Prompt-Verhalten kann sich also ohne Id-Wechsel ändern.
- Offene Gewichte sind angekündigt („Weights drop end of this month"); die Model Card verlinkt das Repo `Mistral-Large-4-1T-A52B` als „Coming soon" und nennt keine Lizenz (unbelegt).

## Output- & Format-Konventionen
- **1M Kontextfenster** (Model Card, Changelog). Maximales Output-Token-Limit und Knowledge Cutoff sind nicht dokumentiert (unbelegt).
- Offizielle API-Namen laut Model Card: `mistral-large-4` und `mistral-large-4-0`. Nach dem Lifecycle-Schema ist `-major` die neueste Minor der Generation und `-major-minor` fix. `mistral-large-latest` zeigt laut Large-3-Model-Card weiterhin auf `mistral-large-2512` (Large 3), **nicht** auf Large 4.
- Features laut Model Card: Structured Outputs, Function Calling, Document QnA, Prefix (Assistant-Prefill), Chat Completions, Batching, Agents & Conversations, Built-In Tools — **ohne Predicted Outputs**.
- Antwortform hängt am Modus: bei `"high"` ist `message.content` eine Liste aus `ThinkChunk` (`type: "thinking"`) und `TextChunk` (`type: "text"`), bei `"none"` ein plain String. Beim Streaming ist `delta.content` erst eine Liste (Thinking), dann ein Übergangs-Chunk mit schließendem `ThinkChunk` und erstem `TextChunk`, danach ein plain String.
- Für Format-Treue stehen laut Feature-Liste Structured Outputs und Prefix-Prefill zur Verfügung.

## Migrations-Hinweise
- **ZU Mistral Large 4 migrieren (v. a. von Large 3)**: Modell-Id auf `mistral-large-4-0` setzen; `mistral-large-latest` erreicht Large 4 nicht. `reasoning_effort` **explizit** setzen (Default unbelegt). Bei `"high"` übernimmt der `ThinkChunk` die Denkspur — handgeschriebenes Chain-of-Thought-Scaffolding aus Large-3-Prompts wird redundant und kostet Output-Tokens; ob es schadet, ist (unbelegt). Response-Parsing auf die Chunk-Liste umbauen und `ThinkChunk` über alle Turns mitschleifen. Kontext wächst von 256k auf 1M, Chunking/RAG-Splitting kann gelockert werden. Die Large-3-Regeln `temperature` < 0.1 und Bilder ~1:1 sind für Large 4 nicht dokumentiert (unbelegt) — neu kalibrieren statt übernehmen. Predicted Outputs führt die Large-4-Card nicht — darauf aufbauende Pipelines umstellen.
- Kosten neu rechnen: Listenpreis $1.36 Input / $0.14 Cached / $4.18 Output pro 1M Tokens gegenüber $0.5 / $1.5 bei Large 3, plus Reasoning-Tokens bei `"high"`. Der Launch-Rabatt („50% off for 2 weeks" ab 06.10.2026) ist befristet.
- **Preview-Caveat**: Pinning auf `mistral-large-4-0` schützt vor Generationswechseln, nicht vor stillen Preview-Updates; Prompts nach Updates erneut evaluieren. Large 3 ist laut `/models` weder deprecated noch mit Ersatz versehen — der Vendor dokumentiert keine Ablösung von Large 3 durch Large 4.
- **VON Mistral Large 4 weg**: `reasoning_effort` (inkl. `completion_args`) und die gesamte `ThinkChunk`-Behandlung entfernen; Ziele ohne Reasoning-Regler brauchen wieder explizites Step-by-step-Scaffolding im Prompt. Parsing zurück auf einen String. Mistral-Spezifika ersetzen: Prefix-Prefill, Built-In Tools, `/v1/conversations`. Bei Zielen unter 1M das Kontextbudget neu planen; bei Text-only-Zielen Bild-Content-Parts entfernen.

## Quellen
- https://docs.mistral.ai/models/mistral-large-4-0 — offizielle Model Card: 6. Oktober 2026, Public Preview, v26.10, API-Namen `mistral-large-4` / `mistral-large-4-0`, 52B aktiv / 1.05T gesamt + 1.6B Vision-Encoder, 1M Kontext, $1.36 / $0.14 / $4.18 (Sale $0.68 / $0.07 / $2.09), Feature-Liste ohne Predicted Outputs, Usage-Beispiel mit `reasoning_effort="high"`, Weights-Link `Mistral-Large-4-1T-A52B` „Coming soon", keine Lizenzangabe.
- https://docs.mistral.ai/studio/conversations/reasoning — `mistral-large-4-0` mit `reasoning_effort` ohne Zusatzkonfiguration, Semantik von `"high"`/`"none"`, `ThinkChunk`/`TextChunk`-Antwortform, Streaming-Verlauf, Multi-Turn-Replay-Warnung, `completion_args` auf Agents/Conversations; kein Default-Wert für Large 4.
- https://mistral.ai/news/mistral-large-4/ — Ankündigung (06.10.2026): Public Preview, „1 trillion-parameter … 52 billion active", hybrid instruct-and-reasoning, Coding-Werte, Agentik, Launch-Blurb (Cybersecurity/Finance/Manufacturing), Prompt-Injection-Robustheit, Cyber-Refusal-Rate, 160+ Sprachen, Gewichte bis Monatsende, laufendes RL-Training, $1.36 / $4.18.
- https://docs.mistral.ai/resources/changelogs — Eintrag vom 06.10.2026: „Mistral Large 4 (`mistral-large-4`) is now available in Public Preview", 1M Kontext, „Open weights are coming soon", „50% off for 2 weeks".
- https://docs.mistral.ai/inference/model-lifecycle — Alias-Ebenen (`-latest`, `-major`, `-major-minor`), Warnung vor stillen Alias-Updates, Public Preview mit stillen Updates und möglichem Retirement vor GA, Deprecation-Fristen.
- https://docs.mistral.ai/studio/conversations/chat-completion/prompting — modellübergreifende Prompting-Guidance: Rollen-Framing, Hierarchie, Markdown/XML-Tags, Few-Shot, System-vs-User-Split, Anti-Pattern-Liste; nennt kein spezifisches Modell.
- https://docs.mistral.ai/models/mistral-large-3-25-12 — Gegenprobe: API-Namen `mistral-large-2512` / `mistral-large-latest`, 256k Kontext, $0.5 / $1.5, GA ohne Deprecation-Hinweis.
- https://docs.mistral.ai/models — Large 4 als Featured Generalist; Large 3 steht nicht in der Deprecated-Tabelle.
- https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512 — Gegenprobe der Large-3-Regeln (`temperature` < 0.1, Bilder ~1:1), die für Large 4 nicht dokumentiert sind.

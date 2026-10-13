---
model: gpt-oss-120b
vendor: OpenAI
family: gpt-oss
aliases: [gpt-oss, gpt-oss-20b]
last_verified: 2026-10-13
status: current
---

# gpt-oss-120b (gilt auch für gpt-oss-20b)

## Reasoning / Thinking
- Effort-Stufen `low | medium | high` (beide Größen). Gesetzt wird die Stufe **in der System-Nachricht**, nicht über einen API-Parameter: „To control the reasoning you can specify in the system message the reasoning level as low, medium, or high" — empfohlene Zeile `Reasoning: high`. Default: „By default, the model will do medium level reasoning."
- Die Chain-of-Thought kommt roh im **`analysis`-Kanal**. Sie unterliegt nicht denselben Sicherheitsstandards wie die finale Antwort: „You should not show the chain-of-thought to your users, as they might contain harmful content."
- Mehrturn-Regel: „In general, you should drop any previous CoT content on subsequent sampling" — sobald ein Turn mit einer `final`-Nachricht endete. Ausnahme Tool-Calling: vorheriges CoT bleibt im Verlauf, damit das Modell weiterdenken kann.
- Kein `none`/`minimal`, kein `xhigh`/`max`, kein Token-Budget dokumentiert.

## Prompting-Stil
- **Harmony-Format ist Pflicht**: „gpt-oss should not be used without using the harmony format, as it will not work correctly." Über Inference-Provider (z. B. Ollama) oder eine API wird das Format automatisch gerendert; im eigenen Stack den `openai-harmony`-Renderer bzw. das Transformers-Chat-Template nutzen statt Tokens von Hand zu setzen.
- **Rollen und Rangfolge**: `system > developer > user > assistant > tool`.
- **System-Nachricht = Metadaten, nicht der übliche System-Prompt**: Identitätszeile („You are ChatGPT, a large language model trained by OpenAI."), Knowledge-Cutoff, aktuelles Datum, Reasoning-Stufe, gültige Kanäle (`analysis`, `commentary`, `final`) und ggf. eingebaute Tools (`browser`, `python`).
- **Developer-Nachricht = die eigentlichen Anweisungen**: „It contains the instructions that are provided to the model and optionally a list of function tools available for use." Aufgabeninstruktionen stehen unter `# Instructions`, Function-Tools unter `# Tools`, Output-Schemas unter `# Response Formats`.
- **Achtung Chat-Template**: „Note that the `Developer` role in Harmony maps to the `system` prompt in the chat template." Wer über das Transformers-Chat-Template (oder einen Provider) arbeitet, schreibt die Anweisungen also in die `system`-Nachricht; nur beim rohen Harmony-Rendering gehören sie in die `developer`-Nachricht.
- **Function-Tools** werden in einem TypeScript-artigen `namespace functions { … }`-Block deklariert (Kommentare als Beschreibung); das Modell adressiert den Call über `to=functions.<name>` und kann per `<|constrain|>` das Argumentformat (z. B. `json`) festlegen; das Tool-Ergebnis kommt als `tool`-Nachricht an den Assistant im `commentary`-Kanal zurück.

## Stärken & Schwächen (prompt-relevant)
- Offene Gewichte unter **Apache 2.0**. 120b: 117 B total / 5,1 B aktiv, „Most powerful open-weight model, fits into an H100 GPU" (≥ 60 GB VRAM bzw. Multi-GPU laut Transformers-Guide). 20b: 21 B total / 3,6 B aktiv, „Medium-sized open-weight model for low latency", ca. 16 GB VRAM mit MXFP4. Beide teilen Format, Kanäle, Effort-Regler und Limits — der Prompt-Vertrag ist identisch.
- **Nur Text** rein und raus; keine Bild- oder Audio-Eingabe. Knowledge-Cutoff **1. Juni 2024** — zeitkritische Fakten im Kontext mitliefern.
- Schwäche: `# Response Formats` „will, however, only influence the model's behavior but doesn't guarantee the full adherence to the schema" — Schema-Treue im Self-Hosting per constrained Sampling oder Validierung erzwingen.
- Eingebaute Tools `browser` (search/open/find) und `python` (zustandsbehaftetes Jupyter, 120 s Timeout) existieren nur, wenn der eigene Stack sie implementiert.
- Benchmark- und Qualitätsvergleiche gegenüber den API-Modellen werden hier nicht behauptet (unbelegt).

## Output- & Format-Konventionen
- Drei Kanäle: **`final`** = einzig für den Endnutzer bestimmt; **`analysis`** = CoT, nie anzeigen; **`commentary`** = Function-Tool-Calls (meist auch Built-in-Calls) und gelegentlich Preambles, die vor mehreren Tool-Calls den Plan beschreiben.
- Stop-Tokens: `<|return|>` = finale Antwort fertig, `<|call|>` = Tool-Call; `<|end|>` schließt einzelne Nachrichten. Beim Speichern in den Verlauf das abschließende `<|return|>` durch `<|end|>` ersetzen.
- Kontextfenster **131.072** Tokens, max. Output **131.072** (beide Größen).
- OpenAI-API-Seite: Endpunkte Responses und Batch (kein Chat Completions), Features Streaming, Structured Outputs, Function Calling; Tools Function Calling, Code Interpreter, MCP, Web Search. Einziger Snapshot `gpt-oss-120b` bzw. `gpt-oss-20b`.

## Migrations-Hinweise
- **ZU gpt-oss migrieren**: Der zentrale Schritt ist die Rollen-Umverteilung — Aufgabeninstruktionen, Persona und Regeln aus dem bisherigen System-Prompt in die Developer-Rolle (`# Instructions`) verschieben; die System-Nachricht nur noch für Metadaten und `Reasoning: <level>` nutzen. Beim Chat-Template/Provider landet die `system`-Nachricht automatisch in der Developer-Rolle. Tool-Schemas in die `# Tools`-Sektion der Developer-Nachricht, Output-Schemas nach `# Response Formats` (plus Validierung). API-Effort-Parameter (`reasoning.effort`, Thinking-Budgets) durch die `Reasoning:`-Zeile ersetzen; `xhigh`/`max` auf `high`, `none`/`minimal` auf `low` abbilden. Ob manuelles „Denke Schritt für Schritt"-Scaffolding neben dem Analysis-Kanal noch nützt, ist nicht dokumentiert (unbelegt). Bild-/Audio-Inputs und sehr lange Kontexte (> 131K) müssen anders gelöst werden.
- **Verfügbarkeit**: primär offene Gewichte (Download über Hugging Face, verlinkt auf der Modellseite). Die OpenAI-API-Ratenlimit-Tabelle zeigt für Build, Launch und Grow **0 RPM / 0 TPM** — produktiven Betrieb über die OpenAI-API nicht voraussetzen.
- **VON gpt-oss weg**: Harmony-Tokens, Kanal-Parsing und CoT-Stripping-Logik entfernen; Developer-Anweisungen zurück in den System-Prompt bzw. die Instruktions-Rolle des Zielanbieters ziehen; `Reasoning:`-Zeile in den Effort-/Thinking-Parameter des Ziels übersetzen; `namespace functions`-Deklarationen in JSON-Schema-Tools umschreiben; `# Response Formats` durch native Structured Outputs ersetzen; die Identitätszeile „You are ChatGPT …" nicht übernehmen.

## Quellen
- https://developers.openai.com/api/docs/models/gpt-oss-120b — „Most powerful open-weight model, fits into an H100 GPU", Apache 2.0, 117 B / 5,1 B aktiv, 131.072 Kontext und Output, Cutoff 1. Juni 2024, Effort low/medium/high, Text→Text, Endpunkte Responses + Batch, Features/Tools, Ratenlimits 0 RPM / 0 TPM, Snapshot, kein Deprecation-Hinweis, Hugging-Face-Download.
- https://developers.openai.com/api/docs/models/gpt-oss-20b — „Medium-sized open-weight model for low latency", 21 B / 3,6 B aktiv, gleiche Limits, Effort-Stufen, Endpunkte und Ratenlimits wie 120b.
- https://developers.openai.com/cookbook/articles/openai-harmony — Harmony-Pflicht, Rollen-Rangfolge, Inhalte von System- und Developer-Nachricht, `Reasoning: high`, Default medium, Kanäle final/analysis/commentary, CoT nicht anzeigen und im Folgeturn droppen (Tool-Ausnahme), `namespace functions`, `<|constrain|>`, Response Formats ohne Garantie, Built-in-Tools, Stop-Tokens.
- https://developers.openai.com/cookbook/articles/gpt-oss/run-transformers — Chat-Template rendert Harmony, „`Developer` role in Harmony maps to the `system` prompt in the chat template", VRAM-Bedarf (20b ca. 16 GB MXFP4, 120b ≥ 60 GB / eine H100).

---
model: doubao-seed-2-1-turbo
vendor: ByteDance
family: Doubao
aliases: [doubao-seed-2-1-turbo-260628, dola-seed-2-1-turbo-260628, doubao-seed-2.1-turbo, seed-2.1-turbo]
last_verified: 2026-10-13
status: current
---

# Doubao Seed 2.1 Turbo

## Reasoning / Thinking
- Typ: **Deep Thinking per Default an**. `thinking.type` kennt plattformweit `enabled | disabled | auto`; doubao-seed-2-1-turbo-260628 (Ark) wie dola-seed-2-1-turbo-260628 (BytePlus) stehen in der Support-Liste nur mit `enabled` (Default) und `disabled` — **kein `auto`**.
- Tiefe über `reasoning_effort` (Chat API) bzw. `reasoning.effort` (Responses API). Auf Ark gilt dieselbe Zeile wie für 2.1 Pro: alle sieben Stufen werden angenommen, **Default `high`**, `minimal` = aus, `none` → `minimal`, **`xhigh`/`max` → `high`**. Die Ark-Modellseite fasst das als vier wirksame Modi `minimal | low | medium | high` zusammen. Auf BytePlus ist die Effort-Tabellenzeile für die dola-ID ohne Default und Mapping ausgewiesen — dort `reasoning_effort` immer explizit setzen (Default unbelegt).
- **Thinking Summary per Default aktiv** (Ark und BytePlus): `reasoning_content` enthält nur eine Zusammenfassung, `encrypted_content` das verschlüsselte Original. `reasoning_effort` wirkt nur auf den Roh-Gedankengang; abgerechnet werden die Roh-Tokens. Höhere Paket-Latenz laut Doku — `timeout` hochsetzen.
- Tool-Calling: **`encrypted_content` unverändert zurückspielen** (Vorrang vor `reasoning_content`; nur die Zusammenfassung zurückzugeben senkt die Qualität in Agent-Läufen, gar nichts zurückzugeben wirft keinen Fehler); in der Responses API übernimmt `previous_response_id` das.
- Max. Denkkette 256k Tokens, sie teilt sich das Output-Budget mit der Antwort.

## Prompting-Stil
- Die Deep-Thinking-Empfehlungen gelten auf Ark und BytePlus inhaltsgleich: **Ziel, Szenario und Adressat** ergänzen statt nur die Aufgabe zu nennen; **Schritt-für-Schritt-Zerlegung und Beispiele reduzieren oder vermeiden** (engen die Reasoning-Logik ein); **System-Prompts reduzieren** und alles über `role: user` geben.
- Structured Output: Format über `response_format` (`json_schema`, `strict: true`), im Prompt weder "gib JSON aus" betonen noch das Schema wiederholen, sondern den fachlichen Inhalt beschreiben; `frequency_penalty`/`presence_penalty` dabei weglassen.
- Bilder gehen als `image_url`-Content-Teil neben dem Text in dieselbe User-Nachricht (Beispiel auf der Ark-Modellseite).

## Stärken & Schwächen (prompt-relevant)
- Positionierung laut Release-Notiz: **kostengünstige Low-Latency-Variante für Produktion im großen Maßstab**, voll ausgestattet, Wirkung "auf Augenhöhe" mit doubao-seed-2-1-pro; gedacht für große Mengen Online-Aufrufe in Coding-, Agent- und multimodalen Aufgaben und für Deployments, in denen Kosten, Durchsatz und Batch Vorrang haben. Die Seed2.1-Seite nennt Pro und Turbo als die zwei Größen der Familie.
- Laut Ark-Modellseite: Coding über die ganze Entwicklungskette inkl. lang laufender Coding-Agents auf Repo-Ebene; Agent-Ausführung end-to-end mit flexibleren Fallbacks und besserer Nutzung fremder CLIs; VLM mit stabilerer **GUI-Bedienung über Mobil, Desktop und Web** und feinerem Bild-/Videoverständnis.
- Fähigkeitstags: Deep Thinking, Textgenerierung, multimodales Verstehen (Input Text, Bild, Video → Text; **kein Audio**), GUI-Aufgaben, Tool-Calling, Structured Output. Tool-Matrix Ark komplett (Function Calling, Knowledge Base, MCP, Web-Search, Image Processing, Doubao-Assistant); BytePlus listet Function Calling und MCP.
- Schwächen/Eigenheiten: **nur 256k Kontext** (Pro 260915 und Lite: 1024k); **500 RPM / 1.000.000 TPM** wie Pro (Lite: 30.000 RPM); **Default-Antwortlänge 4k**; Structured Output ist beta und mit TPM-Garantiepaketen nicht nutzbar; kein `auto`, keine echte Stufe über `high`. Kein Knowledge Cutoff publiziert (unbelegt).
- Verfügbarkeit: einziges Seed-2.1-Modell auf BytePlus ModelArk (international).

## Output- & Format-Konventionen
- Model ID Ark (China): `doubao-seed-2-1-turbo-260628` (推荐模型, 首推), Base-URL in den Doku-Beispielen `https://ark.cn-beijing.volces.com/api/v3`. Model ID BytePlus (international): **`dola-seed-2-1-turbo-260628`**, Region ap-southeast-1 mit Base-URL `https://ark.ap-southeast.bytepluses.com/api/v3` (eu-west-1 führt laut BytePlus zusätzlich nur die seed-2-0- und seedream-5-0-lite-Modelle). `doubao-seed-2.1-turbo` ist nur Abrechnungsname auf der Preisseite (als Model ID unbelegt).
- Längen (Ark und BytePlus gleich): Kontext 256k, max. Input 256k, max. Antwort inkl. Denkkette 256k bei **Default 4k**, max. Denkkette 256k. Begrenzung über `max_completion_tokens` bzw. `max_output_tokens`.
- Structured Output: `json_schema` mit `strict: true` empfohlen, `json_object` verlangt den String `json` im Input; Feldreihenfolge folgt dem Schema; `$ref` nur lokal, `oneOf`/`allOf` ohne Semantikgarantie; nicht unterstützte Keywords werfen einen Fehler.
- Betrieb: Streaming empfohlen, sonst `timeout` über 30 Minuten. Caching: implizit über Responses + Chat API, explizit über Responses API (Prefix-, Session-Cache) — auf Ark und BytePlus.
- Preise Volcengine je Mio. Tokens (0–256k, flat): Online 3,00 ¥ Input / 0,60 ¥ Cache-Hit / 15,00 ¥ Output, Cache-Speicher 0,017 ¥ je Mio. Tokens/Stunde; Low-Latency (Fast) 6,00 / 1,20 / 30,00 ¥; Low-Priority (Flex) und Batch 1,50 / 0,60 / 7,50 ¥ — also halber Pro-Preis im Online-Tarif. BytePlus-Preise sind hier nicht erfasst (unbelegt).

## Migrations-Hinweise
- **Pro ↔ Turbo**: gleiche Parameterfläche (dieselben `thinking.type`-, Effort-, Summary- und Rückgaberegeln, gleiche Antwort-/Denkketten-Grenzen) — der Prompt selbst braucht meist keinen Umbau. Neu prüfen nur: Kontext (Pro 260915: 1024k, Turbo: 256k — Pro→Turbo-Prompts mit über 256k Input wieder chunken), Preis und Latenz; Qualitätsdifferenz per eigener Evaluation absichern (die Release-Notiz sagt nur "auf Augenhöhe").
- **ZU doubao-seed-2.1-turbo migrieren**: (1) Reasoning-Scaffolding und Few-Shot streichen, Ziel/Szenario ergänzen, System-Prompt abspecken. (2) `reasoning_effort` explizit setzen — `xhigh`/`max` anderer Anbieter landen still auf `high`; auf BytePlus ist kein Default dokumentiert. (3) Schnellpfade über `thinking: {"type":"disabled"}` oder `reasoning_effort: "minimal"`, da es kein `auto` gibt. (4) `max_completion_tokens`/`max_output_tokens` gegen den 4k-Default setzen. (5) Format in `response_format` verlagern. (6) In Tool-Ketten `encrypted_content` durchreichen. (7) Concurrency an 500 RPM / 1M TPM anpassen. (8) International immer die `dola-`-ID und die BytePlus-Base-URL verwenden. (9) Audio-Inputs entfallen — dafür ist innerhalb der Familie nur Lite dokumentiert.
- **VON doubao-seed-2.1-turbo weg**: `thinking.type`, `reasoning_effort` und `encrypted_content` sind Ark-spezifisch ausgeprägt — Denksteuerung anhand des Ziel-Guides neu abbilden statt 1:1 zu übernehmen oder pauschal zu entfernen; gestrichenes CoT-Scaffolding, Beispiele und Rollentrennung wieder ergänzen, wenn das Ziel kein Always-On-Reasoner ist; `response_format` in die Structured-Output-Form des Ziels übersetzen.

## Quellen
- https://docs.volcengine.com/docs/ark/model-list?lang=zh — Ark-Modellliste (Stand 2026.10.09): `doubao-seed-2-1-turbo-260628` unter 推荐模型 mit Fähigkeitstags, 256k Kontext / 256k Input / 256k Antwort bei Default 4k / 256k Denkkette, 500 RPM / 1000000 TPM; Tool- und Caching-Matrix; Pro 260915 und Lite mit 1024k als Vergleich; Turbo fehlt in der Audio-Tabelle.
- https://docs.volcengine.com/docs/ark/deep-thinking?lang=zh — Deep-Thinking-Seite (Stand 2026.10.09): `thinking.type`-Support (Turbo nur `enabled`/`disabled`), Effort-Tabelle (Turbo in derselben Zeile wie Pro: Default `high`, Mapping), Thinking-Summary-Liste, Rückgaberegeln für `encrypted_content`, Timeout- und Streaming-Hinweise, Prompt-Optimierungsempfehlungen.
- https://docs.volcengine.com/docs/ark/structured-output-beta?lang=zh — Structured Output (beta, Stand 2026.09.22): `json_schema`/`json_object`, Schema-Einschränkungen, Beta- und TPM-Paket-Vorbehalt, Penalty-Warnung, Prompt-Empfehlungen (附3).
- https://docs.volcengine.com/docs/ark/model-pricing?lang=zh — Preisseite (Stand 2026.10.10): `doubao-seed-2.1-turbo` in Online-, Low-Latency-, Low-Priority- und Batch-Tabellen; Pro-Preise als Vergleich.
- https://docs.volcengine.com/docs/ark/model-release-announcement?lang=zh — Release-Ankündigungen (Stand 2026.10.13): `doubao-seed-2-1-turbo-260628` als 新发布 unter 202606 — kostengünstig, niedrige Latenz, voll ausgestattet, vergleichbar mit doubao-seed-2-1-pro, für Produktion mit hohem Aufrufvolumen.
- https://ark.volcengine.com/region:cn-beijing/model/detail?Id=doubao-seed-2-1-turbo — Ark-Modellseite: 260628 als 首推, Input Text/Bild/Video → Text, Preise inkl. Fast- und Flex-Tarif, `reasoning_effort` mit vier Modi und Default `high`, Coding-/Agent-/VLM-Punkte (GUI über Mobil, Desktop, Web), Request-Beispiel mit `image_url`.
- https://seed.bytedance.com/en/seed2_1 — Seed2.1-Seite: Familie mit den zwei Größen Pro und Turbo.
- https://docs.byteplus.com/en/docs/modelark/model-list — BytePlus-ModelArk-Modellliste (Stand 2026-10-13): `dola-seed-2-1-turbo-260628` als einziges 2.1-Modell, Längen und Limits, Function Calling/MCP, Caching, Structured Output (beta); Regionen ap-southeast-1/eu-west-1 und Base-URLs.
- https://docs.byteplus.com/en/docs/modelark/deep-thinking — BytePlus-Deep-Thinking-Seite (Stand 2026-10-06): dola-Turbo mit `enabled` (Default)/`disabled`, in der Thinking-Summary-Liste, Effort-Tabellenzeile ohne Default/Mapping, Prompt-Empfehlungen wie auf Ark.

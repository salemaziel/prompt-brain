---
model: glm-5.3-flash
vendor: Z.ai
family: GLM
aliases: [glm-flash, glm-5.3-flashx, glm53-flash, zai-glm-5.3-flash, zai-org/GLM-5.3-Flash]
last_verified: 2026-10-13
status: current
---

# GLM-5.3-Flash

## Reasoning / Thinking
- Typ: **erzwungen an**. GLM-5.3 und GLM-5.3-Flash „no longer support disabling thinking" — `thinking.type: "disabled"` erzeugt einen Fehler; `"enabled"` ist der einzige zulässige Wert.
- Tiefe ausschließlich über `reasoning_effort`: `low` | `high` | `max` (Default und Empfehlung). Auf dem Standard-API-Endpoint führt jeder andere Wert zu einem Fehler („Any other input will result in an error"). Auf dem Coding-Plan-Endpoint werden `none`/`minimal`/`low` auf `low`, `medium`/`high` auf `high`, `xhigh`/`max` auf `max` gemappt. In den offenen Gewichten fällt ein fehlender oder unbekannter Wert still auf `max` zurück („defaults to max if not passed (or if set to any other value)").
- Es gibt **keinen Zero-Thinking-Pfad**; `low` ist die Untergrenze, nicht „aus". Thinking verbraucht zusätzliche Tokens — Token-Budget gegenüber thinking-freien Workloads neu bemessen.
- Reasoning-Ausgabe: non-streaming als `reasoning_content` neben `content`, im Stream als `delta.reasoning_content` vor `delta.content`.
- `clear_thinking`: Preserved Thinking ist auf dem Standard-API-Endpoint per Default aus, auf dem Coding-Plan-Endpoint per Default an; im Chat-Template der offenen Gewichte steht `clear_thinking` auf `false`. Die Modellseite empfiehlt `clear_thinking: false` (Agent-/Coding-Läufe), die Modellkarte für reine Chat-Szenarien ausdrücklich `clear_thinking=true`. Bei Preserved Thinking das historische `reasoning_content` vollständig und unverändert zurückschicken.

## Prompting-Stil
- Z.ai zeigt Flash vor allem in **visuell geschlossenen Schleifen**: Ergebnis erzeugen → rendern/ausführen → gegen Referenz (Screenshot, Vorlage, Original-App) vergleichen → nachbessern. Die offiziellen Beispiel-Prompts (UI-Nachbau aus Screenshots, Office-Decks, Finanzanalyse, Video-Schnitt, Blender-Szenen, Godot-Prototyp, Computer Use, CAD) schreiben diese Prüfschleife jeweils explizit vor, teils mit Mindestzahl an Runden („build → fixed-camera render → inspect → refine → re-render").
- Prüfbare Deliverables und Belegpflicht vorgeben: Ausgabeformate konkret benennen (z. B. PPTX + PDF, MP4 + SRT, STEP/STL), Unsicherheiten als Annahmen auflisten lassen; das Office-Beispiel fordert wörtlich „Do not fabricate any business data; cite the source for all referenced information."
- Bei UI-Arbeit zuerst das Design-System aus den Referenzbildern analysieren lassen, dann bauen, dann gerenderte Seiten gegen die Referenz abgleichen.
- Agent-Prompts im offiziellen Vier-Block-Schema: **Goal**, **Context** (Dateien, Fehlermeldungen, Beispiele), **Constraints** (Engineering-Regeln), **Done when** (Abnahmekriterium); „put temporary instructions in the prompt, and put long-lived rules in project-level configuration files"; bei komplexen Aufgaben erst Plan, dann Umsetzung; eine Session pro Aufgabe.
- Eine Flash-spezifische Prompt-Engineering-Seite existiert nicht; weitergehende Stilaussagen sind unbelegt.

## Stärken & Schwächen (prompt-relevant)
- Stärken: erstes nativ multimodales Modell der GLM-5-Serie (Video, Bild, Text, Datei als Input), laut Z.ai stärker als GLM-5.2 bei sehr niedrigen Kosten; DeepSWE v1.1 63.4 (GLM-5.2: 46.2), AutomationBench 48.8 (26.2), Z.ai Code Bench v1.0 29.0 bei Max-Effort (Claude Opus 4.8: 29.5).
- Architektur laut Modellkarte: 320B Parameter gesamt, 18B aktiv, hybride Sparse-/Linear-Attention, **neu trainiertes Basismodell** (nicht das 5.2/5.3-Basismodell); laut Modellseite 3,01× weniger Attention-Rechenaufwand und 4,44× kleinerer KV-Cache als GLM-5.3. Offene Gewichte unter MIT-Lizenz.
- `glm-5.3-flashx` ist dieselbe Modelllinie mit ca. 200 Tokens/s, aber teurer und (noch) nicht im GLM Coding Plan; `glm-5.3-flash` ist im Coding Plan mit dreifachem Kontingent gegenüber GLM-5.3 verfügbar.
- Schwächen/Eigenheiten: enge `reasoning_effort`-Enum ohne `medium`/`xhigh`; Verhaltensunterschiede gegenüber glm-5.3 trotz gleicher Versionsnummer, weil das Basismodell ein anderes ist — wie stark, sagt keine Quelle (unbelegt); kein publizierter Knowledge Cutoff (unbelegt).

## Output- & Format-Konventionen
- 1M Tokens Kontext, `max_tokens` bis 128K; Input Video/Bild/Text/Datei, Output Text. Die offene Modellkarte nennt nur Bild + Text.
- Multimodale Inhalte als Content-Blöcke in `messages[].content[]`: `image_url` (URL empfohlen oder Base64-Data-URL; mehrere Blöcke möglich), `video_url`, `file` (`file_url`/`file_id`/`file_data`). Ein `file`-Block darf nicht mit `image_url`/`video_url` im selben Request kombiniert werden. Limits laut API-Referenz: Bilder < 5 MB und ≤ 6000×6000 px (JPG/PNG/JPEG), Videos ≤ 200 MB (MP4/MKV/MOV), Dateien ≤ 50 MB, bis zu 50 Datei-URLs.
- Das Vision-Request-Schema (Modelle `glm-5.3-flashx` — dort Default — und `glm-5.3-flash`) kennt nur die Rollen `user`, `system`, `assistant`, keine `tool`-Rolle und keine `tool_calls` am Assistant; `tools` nur Typ `function` (max. 128), `tool_choice` nur `"auto"`; `stop` laut Beschreibung derzeit nur ein Stop-Wort.
- Widerspruch in der Doku: Die Modellseite listet Structured Output (JSON) und empfiehlt `stream: true` plus `tool_stream: true`, das Vision-Schema der API-Referenz enthält aber weder `response_format` noch `tool_stream` — ob beides für Flash wirkt, ist unbelegt. Wie Tool-Ergebnisse ohne `tool`-Rolle zurückgegeben werden, ist ebenfalls unbelegt.
- Empfohlene Parameter laut Modellseite: `temperature` 1, `top_p` 0.95, `reasoning_effort: max`.
- Preise pro MTok: Flash $0.15 Input / $0.03 Cached Input / $0.50 Output; FlashX $0.37 / $0.075 / $1.25; Cached-Input-Storage befristet kostenlos (Stand 2026-10-13). Release-Notes-Eintrag: 2026-08-26.

## Migrations-Hinweise
- **ZU glm-5.3-flash migrieren**: `thinking.type: "disabled"` entfernen (Fehler) und Non-Thinking-Pfade auf `enabled` + `reasoning_effort: low` umstellen; nur `low`/`high`/`max` verwenden — `none`/`minimal` nie als „aus" übernehmen, weil sie auf der Standard-API fehlschlagen und beim Self-Hosting still auf `max` laufen. `model` explizit auf `glm-5.3-flash` oder `glm-5.3-flashx` setzen (Preis-/Tempo-Entscheidung; FlashX nicht im Coding Plan). Bilder, Videos und Dokumente als `image_url`/`video_url`/`file`-Blöcke übergeben, Datei- und Bild-/Video-Blöcke auf getrennte Requests verteilen. JSON-Mode (`response_format`) ist für dieses Modell nicht im API-Schema belegt — Formatvorgaben in den Prompt-Vertrag verlagern und das Ergebnis validieren. Mehrere Stop-Sequenzen auf eine reduzieren, `tool_choice` außer `auto` entfernen. Visuelle Aufgaben um eine explizite Render-und-Vergleichs-Schleife ergänzen.
- **Von glm-5.3 / glm-5.2**: Thinking-Vertrag wie bei glm-5.3; Prompts trotzdem neu evaluieren, da Flash auf einem neu trainierten Basismodell beruht (glm-5.3 nutzt dagegen das Basismodell von GLM-5.2).
- **VON glm-5.3-flash weg**: Bild-, Video- und Datei-Eingaben brauchen ein multimodales Ziel — glm-5.3 und glm-5.2 sind text-only. Zielmodelle ohne erzwungenes Thinking brauchen ein explizites Thinking-Setup; Z.ai-spezifische Felder (`clear_thinking`, `tool_stream`, `reasoning_content`-Handling) entfernen bzw. auf die Zielkonventionen mappen; die Render-und-Vergleichs-Schleife im Prompt beibehalten, wenn das Ziel visuell prüfen kann, sonst durch textuelle Testkriterien ersetzen; 1M-Kontext- und 128K-Output-Annahmen gegen das Zielfenster prüfen.

## Quellen
- https://docs.z.ai/guides/vlm/glm-5.3-flash — Modell-IDs `glm-5.3-flash`/`glm-5.3-flashx`, „the first native multimodal model in the GLM-5 series", 1M Kontext, 128K Output, Input Video/Bild/Text/Datei, Fähigkeitenliste inkl. Structured Output, FlashX ca. 200 Tokens/s und nicht im Coding Plan, Coding-Plan-Kontingent 3× GLM-5.3, empfohlene Parameter (`temperature` 1, `top_p` 0.95, `reasoning_effort: max`, `clear_thinking: false`, `stream` + `tool_stream`), `image_url`-Blöcke mit URL oder Base64, die acht Best-Practice-Beispiele samt „Do not fabricate any business data; cite the source for all referenced information", DeepSWE/AutomationBench/Z.ai-Code-Bench-Zahlen, 3,01×/4,44× gegenüber GLM-5.3.
- https://docs.z.ai/guides/capabilities/thinking — erzwungenes Thinking für GLM-5.3/5.3-FLASH („no longer support disabling thinking"), `reasoning_effort` `max`/`high`/`low` mit „Any other input will result in an error", Coding-Plan-Mapping, `reasoning_content` non-streaming und im Stream.
- https://docs.z.ai/guides/capabilities/thinking-mode — Preserved Thinking: Default aus auf dem Standard-API-Endpoint, an auf dem Coding-Plan-Endpoint, Pflicht zur unveränderten Rückgabe des `reasoning_content`.
- https://docs.z.ai/api-reference/llm/chat-completion — Vision-Request-Schema: Modell-Enum `glm-5.3-flashx` (Default) / `glm-5.3-flash`, Rollen ohne `tool`, Content-Blöcke `text`/`image_url`/`video_url`/`file`, Datei-/Bild-Kombinationsverbot, Größenlimits, `max_tokens` bis 128K, `tools` nur `function`, `tool_choice` nur `auto`, `stop` mit „Currently, only one stop word is supported", kein `response_format`/`tool_stream`.
- https://docs.z.ai/guides/overview/pricing — GLM-5.3-Flash $0.15/$0.03/$0.50, GLM-5.3-FlashX $0.37/$0.075/$1.25, Cached-Input-Storage „Limited-time Free".
- https://docs.z.ai/release-notes/new-released — 2026-08-26 GLM-5.3-Flash, native visuelle Fähigkeiten („observe interfaces, rendering results, and interaction feedback").
- https://huggingface.co/zai-org/GLM-5.3-Flash — offizielle Modellkarte: MIT-Lizenz, 320B/18B aktiv, hybride Sparse-/Linear-Attention, „starts from a newly trained base model", Bild + Text, `reasoning_effort` low/high/max mit Fallback auf `max`, `clear_thinking`-Default `false` im Chat-Template und Chat-Empfehlung `clear_thinking=true`.
- https://docs.z.ai/devpack/resources/best-practice — Goal/Context/Constraints/Done when, drei Kontext-Ebenen, Regel zu temporären vs. langlebigen Anweisungen, Plan vor Umsetzung, Session-Hygiene (modellunabhängig formuliert).

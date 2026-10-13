---
model: glm-5.2
vendor: Z.ai
family: GLM
aliases: [glm52, zhipu-glm-5.2, zai-glm-5.2, zai-org/GLM-5.2, zai-glm-5-2]
last_verified: 2026-10-13
status: legacy
successor: glm-5.3
---

# GLM-5.2

## Reasoning / Thinking
- Typ: **schaltbar, Modell entscheidet selbst**. `thinking: {"type": "enabled" | "disabled"}`, Default `enabled`; GLM-5.2 gehört zu den Modellen, die „auto-decide whether to think" — anders als GLM-5.3/5.3-Flash, die Thinking erzwingen.
- Tiefe über `reasoning_effort` (erst ab GLM-5.2 unterstützt), Default `max`. Die volle Enum wird angenommen und gemappt: `none`/`minimal` → Thinking aus, `low`/`medium` → `high`, `xhigh` → `max`. Effektiv gibt es also nur **aus / `high` / `max`** — ein portiertes `low` läuft hier bereits auf `high`. Das Coding-Plan-Mapping für 5.2 ist identisch.
- Welche Effort-Stufen und welcher Fallback in den offenen Gewichten gelten, nennt die Modellkarte nicht (nur „multiple thinking effort levels") — unbelegt.
- Reasoning-Ausgabe: non-streaming als `reasoning_content` neben `content`, im Stream als `delta.reasoning_content` vor `delta.content`.
- Preserved Thinking (`clear_thinking: false`) ist auf dem Standard-API-Endpoint per Default aus, auf dem Coding-Plan-Endpoint per Default an; wird es genutzt, muss das historische `reasoning_content` vollständig und unverändert zurückgeschickt werden („All consecutive reasoning_content blocks must exactly match the original sequence").

## Prompting-Stil
- Z.ai positioniert 5.2 als Flaggschiff „built for the era of long-horizon tasks"; die Modellseite empfiehlt ein agentisches Arbeitsmuster:
  - **Codebase-Audit zuerst**: das Modell das Projekt lesen und eine Architekturkarte samt API-Verträgen, Datenflüssen und technischen Schulden ausgeben lassen.
  - **Vor Refactorings Plan einfordern**: „the execution plan, impact scope, risk boundaries, and verification method" vor jeder Änderung.
  - **Engineering-Standards in `CLAUDE.md`/`Agent.md`** ablegen (Lint-Regeln, Build-Befehle, Testanforderungen) statt im Einzelprompt.
  - **Explizite Constraints** nennen (z. B. keine neuen Dependencies, API-Verträge nicht ändern, nicht eigenmächtig committen).
  - **Verifikation anordnen**: Build, Lint und Tests laufen lassen und Ergebnisse plus nicht abgedeckte Risiken berichten.
- Allgemeines Z.ai-Agent-Schema: **Goal**, **Context**, **Constraints**, **Done when**; temporäre Anweisungen in den Prompt, langlebige Regeln in Projektkonfigurationsdateien; eine Session pro Aufgabe.

## Stärken & Schwächen (prompt-relevant)
- Stärken: lange, mehrstufige Aufgaben mit „1M lossless context" — laut Release Notes weniger Drift und Zielverlust in langen Läufen; Terminal-Bench 2.1 81.0 (GLM-5.1: 62.0), SWE-bench Pro 62.1 (GLM-5.1: 58.4); offene Gewichte (MIT-Lizenz, 753B Parameter).
- Gegenüber dem Nachfolger: GLM-5.3 nutzt dasselbe Basismodell und gewinnt allein durch Post-Training — +50 % auf Z.ai Code Bench, Terminal-Bench 3.0 4.6 (5.2) → 28.3, CyberGym 77,2 % → 84,5 %, höhere Token-Effizienz bei Max-Effort (5.2: 23,4 % bei ~96K Output-Tokens pro Task; 5.3: 34,5 % bei ~75K).
- Schwächen/Eigenheiten: **text-only** (Input und Output Text); grobe Effort-Auflösung durch das Mapping (kein echtes `low`/`medium`); kein publizierter Knowledge Cutoff (unbelegt).

## Output- & Format-Konventionen
- 1M Tokens Kontext, 128K Output (`max_tokens` bis 131072); Input Text, Output Text.
- API-Defaults: `temperature` 1 (0–1), `top_p` 0.95 (0.01–1), `do_sample` `true`. Die Codebeispiele der Modellseite nutzen `temperature` 1.0 (ein Streaming-Beispiel 0.6) — eine eigene Sampling-Empfehlung gibt die Seite nicht.
- Structured Output über `response_format: {"type": "json_object"}`; `stop`: Schema max. 4, laut Beschreibung derzeit nur ein Stop-Wort; `tools` max. 128 Funktionen, `tool_choice` nur `"auto"`; `tool_stream` für Tool-Call-Streaming unterstützt. Cache-Treffer unter `usage.prompt_tokens_details.cached_tokens`.
- Preis pro MTok: Input $1.40, Cached Input $0.26, Output $4.40 (identisch mit GLM-5.3); Cached-Input-Storage befristet kostenlos (Stand 2026-10-13). Release-Notes-Eintrag: 2026-06-16.
- Mistral hostet das Modell unverändert als `zai-glm-5-2`.

## Migrations-Hinweise
- **Lifecycle**: Z.ai führt GLM-5.2 weiterhin in der Preisliste unter „Latest Models" und nennt kein Abschaltdatum; die offizielle Migrationsseite „Migrate to GLM-5.3" deckt aber ausdrücklich den Umstieg von GLM-5.2, und die Modellkarte verweist auf GLM-5.3 als neuere Version. Bei Mistral ist `zai-glm-5-2` seit 29.09.2026 deprecated, Ersatz GLM 5.3.
- **VON glm-5.2 zu glm-5.3** (offizielle Checkliste): (1) `thinking.type: "disabled"` → `enabled` + `reasoning_effort: low`, sonst schlägt der Request fehl. (2) `none`/`minimal`/`medium`/`xhigh` entfernen — auf 5.3 nur `low`/`high`/`max`; ein 5.2-`low`/`medium` lief faktisch auf `high`, also `high` setzen, wenn das Verhalten gleich bleiben soll. (3) `model` auf `glm-5.3`, `max_tokens` an 128K anpassen. (4) `temperature` 1.0 / `top_p` 0.95, danach nur einen der beiden Werte tunen. (5) Im Stream `delta.reasoning_content` und `delta.content` getrennt verarbeiten; Tool-Calls mit `stream` + `tool_stream` und Argument-Konkatenation. (6) Verifikation: Antwortqualität, „excessive randomness or excessive conservatism", Tool-Streaming, Latenz und Kosten unter langem Kontext und tiefem Thinking. Prompt-Inhalte tragen weiter (gleiches Basismodell), nur der Thinking-Vertrag bricht — und es gibt keinen Zero-Thinking-Pfad mehr, Token-Budget neu bemessen.
- **VON glm-5.2 zu anderen Anbietern**: das 5.2-Mapping auflösen — `low`/`medium` bedeuteten hier `high`, `xhigh` bedeutete `max`, `none`/`minimal` bedeuteten Thinking aus; auf die Effort-Leiter des Ziel-Guides abbilden statt die Rohwerte zu übernehmen. `clear_thinking`, `tool_stream` und `reasoning_content`-Handling auf die Zielkonventionen mappen.
- **ZU glm-5.2 migrieren**: Thinking-Steuerung auf `thinking.type` plus `reasoning_effort` abbilden (fein abgestufte Effort-Werte kollabieren auf aus/`high`/`max`); Bild-/Multimodal-Eingaben sind nicht möglich (für Bilder `glm-5.3-flash`); mehrere Stop-Sequenzen auf eine reduzieren; `tool_choice` außer `auto` entfernen; JSON-Schema-Vorgaben auf `json_object` plus Prompt-Vertrag umstellen. Für neue Integrationen den Nachfolger `glm-5.3` bevorzugen.

## Quellen
- https://docs.z.ai/guides/llm/glm-5.2 — id `glm-5.2`, „built for the era of long-horizon tasks", 1M Kontext, 128K Output, Text-in/Text-out, Fähigkeiten (Thinking, Streaming, Function Calling, Context Caching, Structured Output), Codekommentar „disabled or enabled, default is enabled", Best Practices (Codebase-Audit, Plan mit „the execution plan, impact scope, risk boundaries, and verification method", `CLAUDE.md`/`Agent.md`, explizite Constraints, Verifikation), Benchmarks Terminal-Bench 2.1 und SWE-bench Pro, Sampling in den Beispielen.
- https://docs.z.ai/guides/capabilities/thinking — GLM-5.2 „auto-decide whether to think", `reasoning_effort` ab GLM-5.2, Default `max`, 5.2-Mapping (`none`/`minimal` aus, `low`/`medium` → `high`, `xhigh` → `max`) für API und Coding Plan, `reasoning_content` non-streaming und im Stream.
- https://docs.z.ai/guides/capabilities/thinking-mode — Preserved-Thinking-Defaults je Endpoint und „All consecutive reasoning_content blocks must exactly match the original sequence".
- https://docs.z.ai/api-reference/llm/chat-completion — Text-Schema mit `glm-5.2` im Modell-Enum: `thinking.type` Default `enabled`, `reasoning_effort`-Enum und 5.2-Mapping, `temperature`/`top_p`-Defaults, `max_tokens` bis 131072, `stop` (max. 4, „Currently, only one stop word is supported"), `tools` max. 128, `tool_choice` nur `auto`, `response_format` `json_object`, `tool_stream` für GLM-5.2, `usage.prompt_tokens_details.cached_tokens`.
- https://docs.z.ai/guides/overview/migrate-to-glm-new — „Migrate to GLM-5.3": Umstieg von GLM-5.2 und älter, Checkliste (Modell-String, Thinking, Effort, Sampling, Streaming, Tool-Streaming, Limits, Verifikation inkl. „excessive randomness or excessive conservatism").
- https://docs.z.ai/guides/llm/glm-5.3 — Breaking Change zu `thinking.type: "disabled"`, „same base model as GLM-5.2", Vergleichszahlen 5.2 vs. 5.3 (Z.ai Code Bench, Terminal-Bench 3.0, CyberGym 77,2 % → 84,5 %, Token-Effizienz).
- https://docs.z.ai/guides/overview/pricing — GLM-5.2 unter „Latest Models": $1.4/$0.26/$4.4, Cached-Input-Storage „Limited-time Free".
- https://docs.z.ai/release-notes/new-released — 2026-06-16 GLM-5.2, „Supports 1M lossless context", weniger Drift und Zielverlust in langen Aufgaben.
- https://huggingface.co/zai-org/GLM-5.2 — offizielle Modellkarte: MIT-Lizenz, 753B Parameter, „multiple thinking effort levels" ohne Werteliste, Hinweis „A newer version of this model is available" (GLM-5.3).
- https://docs.mistral.ai/models/zai-glm-5-2 — Mistral-Hosting `zai-glm-5-2` ohne Modifikationen, „This model is deprecated. Use Z.ai GLM 5.3 for new integrations.", Deprecation 29.09.2026, Ersatz Z.ai GLM 5.3.
- https://docs.z.ai/devpack/resources/best-practice — Goal/Context/Constraints/Done when, temporäre vs. langlebige Anweisungen, Session-Hygiene (modellunabhängig formuliert).

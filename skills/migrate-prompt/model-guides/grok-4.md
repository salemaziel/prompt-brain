---
model: grok-4
vendor: xAI
family: Grok
aliases: [grok4, grok-4-latest, grok-4-0709, xai.grok-4]
last_verified: 2026-10-13
status: legacy
successor: grok-4.3
---

# Grok 4

## Reasoning / Thinking
- **Typ: Reasoning-Modell ohne Abschalter.** xAI führt `grok-4-0709` in der Retirement-Tabelle unter den Reasoning-Modellen (Routing auf `grok-4.3` mit `low`, nicht mit `none`), OCI nennt „Has Reasoning: Yes". Einen Schalter zum Abschalten dokumentiert keine offizielle Quelle; dass es überhaupt keinen Non-Reasoning-Modus gibt, ist darüber hinaus (unbelegt — nur Sekundärquelle; die xAI-Modellseiten für grok-4 sind offline).
- **Tiefensteuerung: nicht parametrisierbar.** Das ursprüngliche `grok-4` unterstützt **kein** `reasoning_effort`. Wird der Parameter über die API gesendet, liefert das Modell eine Fehlerantwort. (Hinweis: `reasoning_effort` ist bei xAI für andere Modelle dokumentiert — laut OCI für Grok 3 mini, laut Modellseite für `grok-4.3` (`none`…`xhigh`, Default `low`), laut Reasoning-Seite für `grok-4.5`/`grok-4.6`/`grok-4.7`; für `grok-4.20` ist kein `reasoning_effort` dokumentiert — nicht für `grok-4`.)
- **Praktische Tiefensteuerung:** Da kein Effort-Schalter existiert, regelt man die Reasoning-Tiefe indirekt über das Output-Budget — für anspruchsvolle Reasoning-Aufgaben das `max_tokens`/Maximum-Output-Limit erhöhen, damit genügend Spielraum für interne Thinking-Tokens bleibt.
- **Thinking-Traces nicht abrufbar:** dass Grok 4 seinen internen Denkprozess nicht offenlegt und kein separates `reasoning_content`-/Chain-of-Thought-Feld liefert, ist (unbelegt — nur Sekundärquelle; die xAI-Modellseiten für grok-4 sind offline).

## Prompting-Stil
- **Tool-augmentiertes Reasoning ist nativ.** Grok 4 wurde per Reinforcement Learning darauf trainiert, beim Denken Tools zu nutzen — u. a. einen Code-Interpreter und Web-Browsing — und dabei autonom eigene Suchanfragen zu formulieren. Prompts sollten dem Modell daher klar sagen, *welche* Tools/Quellen es nutzen darf, statt jeden Zwischenschritt vorzuschreiben.
- **Live Search ist opt-in, nicht automatisch.** Web-Suche läuft über den Tools-Parameter (z. B. `tools=[web_search()]` im xAI-SDK bzw. `{"type": "web_search"}` in der Responses-API). Ohne aktiviertes Such-Tool hat Grok laut Modellübersicht keinen Zugriff auf aktuelle Ereignisse.
- **Funktionsumfang:** Function Calling und Structured Outputs werden unterstützt; multimodaler Input aus Text und Bildern (Output: Text).
- **System-Prompt-Eigenheiten:** Spezifische, von xAI dokumentierte Aussagen zu System-Prompt-Treue oder Instruktionsbefolgung *für grok-4 konkret* liegen aus Primärquellen nicht vor (unbelegt). xAI hebt „strict prompt adherence" und die niedrigste Halluzinationsrate erst für Grok 4.20 bzw. starkes Instruction Following für Grok 4.3 explizit hervor — nicht rückwirkend für grok-4.

## Stärken & Schwächen (prompt-relevant)
- **Stärken:** Starkes mehrstufiges Reasoning, multimodales Verständnis und Zugriff auf aktuelle Informationen (via Tool-/Web-Integration); agentische Nutzung möglich, da das Modell autonom Code-Interpreter und Browser einsetzt. Trainiert auf verifizierbaren Daten in vielen Domänen.
- **Schwächen / Einschränkungen (prompt-relevant):**
  - Keine Feinsteuerung der Denktiefe (`reasoning_effort` nicht verfügbar) — weniger Kontrolle über Latenz vs. Gründlichkeit als bei grok-4.3 und den 4.5+-Modellen.
  - Kein dokumentierter Reasoning-Trace → schwerer zu debuggen (unbelegt, s. o.).
  - `presence_penalty`, `frequency_penalty` und `stop` sind bei xAI-Reasoning-Modellen nicht nutzbar — entsprechend nicht für die Output-Steuerung von grok-4 einplanen.
  - Wissensstichtag November 2024; für neuere Fakten ist das Such-Tool nötig.

## Output- & Format-Konventionen
- Liefert die finale Antwort; strukturierte Ausgaben über Structured Outputs (JSON-Schema) statt über manuell geparste Freitext-Formate anfordern.
- Formatvorgaben (Tabelle, JSON, Länge) gehören explizit in den Prompt; zur Begrenzung der Antwortlänge `max_tokens` nutzen, da `stop`-Sequenzen nicht zur Verfügung stehen.
- **Kontextfenster:** Laut xAI-Ankündigung bietet die Grok-4-API **256.000 Tokens** (Text + Bilder). Auf Drittplattformen ist das nutzbare Fenster teils niedriger — Oracle OCI nennt für `xai.grok-4` „128.000 Tokens"; das ist eine plattformspezifische Grenze.

## Migrations-Hinweise
- **Abgeschaltet (xAI-API):** `grok-4-0709` wurde am 15. Mai 2026, 12:00 PT zurückgezogen; der Slug löst weiter auf, Requests darauf bedient xAI seitdem automatisch mit `grok-4.3` bei `reasoning_effort: low` (Abrechnung zu grok-4.3-Preisen) — ein unveränderter grok-4-Prompt läuft also bereits auf flacherem Reasoning. Der 15.08.2026 ist nur das Retirement-Datum auf Oracle OCI (`xai.grok-4`).
- **WEG von Grok 4 (xAI-Empfehlung: grok-4.3; alternativ Grok 4.20):**
  - grok-4.3: `none`/`low`/`medium`/`high` (Default `low` laut Modellseite); für grok-4.20 ist kein `reasoning_effort` dokumentiert. Bei Bedarf an tieferem Reasoning `medium`/`high` explizit setzen statt das geroutete `low` zu akzeptieren.
  - Deutlich größeres Kontextfenster verfügbar (grok-4.3 und grok-4.20: 1.000.000 Tokens).
  - xAI bewirbt für Grok 4.20 strikte Prompt-Adhärenz und niedrige Halluzinationsraten → bestehende, defensiv formulierte Prompts können oft verschlankt werden.
  - Für Code und Chat empfiehlt xAI inzwischen grok-4.7 (500k Kontext, kein `none`, Default `high`).
- **ZU Grok 4 (von einem Nicht-Reasoning- oder älteren Grok-Modell):**
  - Auf der xAI-API nicht mehr möglich — Requests landen auf grok-4.3 (s. o.); auf OCI seit dem 15.08.2026 ebenfalls retired. Die folgenden Punkte gelten nur noch für etwaige Restbestände auf anderen Plattformen (unbelegt).
  - Modell denkt immer — keine Annahme treffen, einen Effort-/Thinking-Schalter setzen zu können; `reasoning_effort` führt zum Fehler und muss aus Requests entfernt werden.
  - `presence_penalty`/`frequency_penalty`/`stop` aus bestehenden Requests entfernen (bei Reasoning-Modellen nicht erlaubt).
  - Für Live-Web-Zugriff das Such-Tool explizit aktivieren; nicht auf automatisches Browsen verlassen.
  - Prompts können knapper/zielorientierter werden (Ziel statt Schritt-für-Schritt-Mikromanagement), da das Modell Tool-Auswahl und Suchqueries selbst übernimmt.

## Quellen
- https://x.ai/news/grok-4 — offizielle Grok-4-Ankündigung (09.07.2025): RL-Training zur Tool-Nutzung (Code-Interpreter, Web-Browsing, eigene Suchqueries), verifizierbare Trainingsdaten in vielen Domänen, Grok-4-API mit „a 256,000 context window" und multimodalem Verständnis.
- https://docs.x.ai/developers/migration/may-15-retirement — Retirement von `grok-4-0709` am 15.05.2026 12:00 PT, Slug löst weiter auf, Routing auf `grok-4.3` mit `low`, Abrechnung zu grok-4.3-Preisen, Empfehlung grok-4.3 für Reasoning-Workloads.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — `reasoning_effort` dokumentiert für grok-4.7/4.6/4.5 (nicht für grok-4); Fehler bei `presencePenalty`/`frequencyPenalty`/`stop` bei Reasoning-Modellen.
- https://docs.x.ai/developers/tools/web-search — Web-Suche über das Tool `web_search` (xAI-SDK und Responses API).
- https://docs.x.ai/developers/models — aktuelles Roster ohne grok-4; kein Echtzeitwissen ohne aktivierte Such-Tools; Empfehlung grok-4.7 für Code und Chat.
- https://docs.x.ai/developers/models/grok-4.3 — Efforts `none`–`xhigh`, Default `low`, 1M Kontext, „strong tool calling and instruction following".
- https://docs.x.ai/developers/models/grok-4.20-0309-reasoning — 1M Kontext, keine Effort-Stufen gelistet, „the lowest hallucination rate on the market with strict prompt adherence".
- https://docs.oracle.com/en-us/iaas/Content/generative-ai/xai-grok-4.htm — Oracle-OCI-Doku: Reasoning ja, `reasoning_effort` nicht unterstützt (Fehler bei Übergabe; für Grok 3 mini vorhanden), Output-Limit für Reasoning erhöhen, Function Calling + Structured Outputs, Wissensstichtag November 2024, plattformseitig 128k, Deprecation 15.05.2026 / Retirement 15.08.2026.

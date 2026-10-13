---
model: kimi-k2.7-code
vendor: Moonshot AI
family: Kimi
aliases: [kimi-k2.7-code-highspeed, kimi-k2.7, k2.7-code, kimi-k2-7-code]
last_verified: 2026-10-13
status: current
---

# Kimi K2.7 Code (gilt auch für kimi-k2.7-code-highspeed)

## Reasoning / Thinking
- Typ: **Denken immer an, nicht abschaltbar**. `thinking.type: "disabled"` liefert einen Fehler; die Parameter-Referenz sagt, man muss `thinking` gar nicht übergeben — „just switch the `model`, and the model always emits `reasoning_content`". Einen Non-Thinking-/Instant-Modus gibt es nicht.
- **Preserved Thinking ist erzwungen**: `thinking.keep` gilt als `"all"`, egal ob weggelassen oder gesetzt; jeder andere Wert ist ein Fehler. Deshalb MUSS das historische `reasoning_content` jeder früheren Assistant-Message unverändert in `messages` bleiben — nicht nur innerhalb einer Tool-Schleife, sondern über Turns hinweg.
- **Kein `reasoning_effort`** (nur kimi-k3 kennt den Regler). Die Denktiefe lässt sich per Parameter nicht steuern; Moonshot nennt gegenüber K2.6 im Schnitt rund 30 % weniger Thinking-Tokens bzw. eine um 30 % reduzierte Overthinking-Tendenz.
- `reasoning_content` und `content` teilen sich `max_tokens` (Default 32.768); für Multi-Step-Tool-Calls empfiehlt der Thinking-Guide `max_tokens >= 16000` und Streaming. Im Stream kommt `reasoning_content` immer vor `content`.
- `kimi-k2.7-code-highspeed` ist laut Parameter-Referenz dasselbe Modell mit identischen Parameter-Constraints und identischem Thinking-Verhalten; nur die Ausgabegeschwindigkeit unterscheidet sich.

## Prompting-Stil
- Keine K2.7-spezifische Prompting-Anleitung; es gelten die allgemeinen Plattform-Empfehlungen: Rolle im System-Message setzen, Abschnitte mit Delimitern (Triple Quotes, XML-Tags, Überschriften) trennen, Arbeitsschritte explizit ausschreiben, Few-Shots für schwer beschreibbare Stile, Längenvorgaben als Absatz- oder Bullet-Zahl statt Wortzahl („The model can't read your mind").
- **Kein Sampling-Steuerknüppel**: temperature, top_p, n und die Penalties sind fixiert (s. u.). Varianz und Formattreue müssen über Prompt, `response_format` und Tool-Schemas kommen; Moonshot rät, die Defaults gar nicht erst zu übergeben.
- **Tools**: `tool_choice` nur `"auto"` (Default) oder `"none"` — `"required"` und das Erzwingen eines bestimmten Tools liefern einen Fehler. Wer ein Tool erzwingen will, muss das im Prompt formulieren. Das `reasoning_content` der laufenden Tool-Schleife im Kontext behalten (Weglassen ist kein Fehler, verschlechtert aber laut Quickstart Kontinuität und Tool-Call-Qualität).
- Wiederholte identische Tool-Calls behandelt Moonshot plattformweit Client-seitig: Message-Layout prüfen (Assistant-Message unverändert anhängen, `tool_call_id` exakt), dann `<system-reminder>`-Hinweise ab 3, verschärft ab 5 und erneut ab 8 identischen Wiederholungen — in der Agent-Schleife, nicht im statischen System-Prompt.
- Agent-Framework: Laut Modellkarte arbeitet K2.7 Code „best with Kimi Code CLI as its agent framework".

## Stärken & Schwächen (prompt-relevant)
- Stärken: dediziertes Coding-Modell; folgt Anweisungen in langen Kontexten zuverlässiger als K2.6 und erreicht höhere Erfolgsraten bei Long-horizon-Coding (Ankündigung: Sequenzen mit 4.000+ Tool-Calls und 12+ Stunden kontinuierlicher Ausführung). Bild- und Videoeingabe (Bilder png/jpeg/webp/gif, Videos u. a. mp4/mov/avi), auch in Tool-Ergebnissen.
- Structured Output: laut Moonshot die **stabilste** Unterstützung auf der Plattform, inkl. verschachtelter Objekte/Arrays sowie `anyOf`/`oneOf`/`$ref`/`additionalProperties: true`; hält das Schema auch ohne `strict` meist ein. Für Structured-Output-Calls empfiehlt Moonshot ausdrücklich `kimi-k2.7-code` statt `kimi-k2.6`.
- Schwächen: kein `tool_choice: "required"`; keine öffentlichen Bild-URLs (nur base64 bzw. Datei-Upload, Request-Body max. 100 MB); kein separat abrechenbarer Cache-Write und keine TTL-Wahl (laut Caching-FAQ nur kimi-k3); Video-Chat ist laut Modellkarte experimentell und nur über die offizielle API verfügbar; `partial=true` mit komplexen Schemas kann die Struktur brechen.
- Highspeed-Variante: laut Quickstart derzeit ressourcenbegrenzt, die Geschwindigkeit kann schwanken.

## Output- & Format-Konventionen
- Kontextfenster 262.144 Tokens (256K); `max_tokens` Default 32.768. Modalitäten Text/Bild/Video → Text.
- **Fixierte Sampling-Parameter**: temperature 1.0, top_p 0.95, n 1, presence_penalty 0, frequency_penalty 0 — jeder andere Wert ist ein Fehler.
- `response_format`: `json_schema` mit `strict: true` (Moonshot: „Always explicitly set strict: true"); nur `choices[0].message.content` parsen, nie `reasoning_content` oder das ganze Response-Objekt.
- Schnittstelle: Chat Completions (OpenAI-kompatibel). Die Responses-API und das `model`-Enum der Messages-API-Referenz führen nur `kimi-k3`; Moonshots Claude-Code-Anleitung setzt `kimi-k2.7-code` dennoch über den Anthropic-Endpunkt `https://api.moonshot.ai/anthropic` ein (als HAIKU-Tier).
- Preise je 1M Tokens: `kimi-k2.7-code` $0.19 Cache-Hit / $0.95 Cache-Miss / $4.00 Output; `kimi-k2.7-code-highspeed` $0.38 / $1.90 / $8.00. Highspeed liefert ca. 180 Tokens/s, bis 260 Tokens/s bei kurzem Kontext.
- Offene Gewichte (`moonshotai/Kimi-K2.7-Code`, Modified MIT): 1 T Parameter gesamt / 32 B aktiv, MoE mit 384 Experten (8 gewählt, 1 geteilt), MoonViT-Vision-Encoder, natives INT4, gleiche Architektur wie K2.5/K2.6. Für vLLM/SGLang empfiehlt die Karte temperature 1.0 und top_p 0.95; Instant-Modus wird nicht unterstützt.

## Migrations-Hinweise
- **ZU kimi-k3**: laut FAQ nur `model` tauschen und weiterhin die kompletten Assistant-Messages (inkl. `reasoning_content`) unverändert zurückgeben; optional `reasoning_effort` setzen (`low|high|max`, Default `max` — bewusst wählen statt den teuersten Default zu erben). Auf K3 wird `tool_choice: "required"` möglich, ein Cache-Write fällt separat an, und der Kontext wächst auf 1M.
- **VON kimi-k2.6 hierher**: `thinking`-Konfiguration entfernen (nur `{"type":"enabled","keep":"all"}` wäre gültig), die 0.6-Temperatur-Annahme des K2.6-Non-Thinking-Modus streichen (Non-Thinking-Prompts haben hier kein Äquivalent), und die Pipeline so umbauen, dass historisches `reasoning_content` in `messages` zurückgeht — für K2.6 war das ohne `keep: "all"` optional. Komplexe JSON-Schemas, die auf K2.6 vereinfacht oder per Markdown-Stripping abgesichert wurden, können hier strenger formuliert werden.
- **ZU kimi-k2.6**: `tool_choice: "required"` gibt es auf keinem der beiden Modelle; Structured Output auf K2.6 vereinfachen (kein `oneOf`/`$ref`) und eine zweite Validierungsschicht einplanen.
- **VON anderen Anbietern**: Sampling- und Effort-Regler (temperature, top_p, Reasoning-Budgets) ersatzlos streichen — sie sind fix bzw. nicht vorhanden; Tool-Erzwingung in Prompt-Anweisungen umformulieren; Prefill als abschließende Assistant-Message mit `partial: true` ausdrücken (Partial Mode; laut Structured-Output-Guide auf kimi-k2.7-code nutzbar, bei komplexen Schemas aber nicht strukturtreu); Bild-URLs auf base64 oder Datei-Upload umstellen.
- **VON kimi-k2.7-code weg**: Denkverhalten im Ziel explizit anfordern, falls es nicht immer denkt; `reasoning_content`-Rückgabe nur behalten, wenn das Ziel sie dokumentiert; Sampling-Parameter wieder als echte Stellschrauben einplanen.

## Quellen
- https://platform.kimi.ai/docs/models.md — Roster: `kimi-k2.7-code` „dedicated coding model … Context 256k", `kimi-k2.7-code-highspeed` mit ca. 180 bzw. bis 260 Tokens/s; beide nicht in der Abkündigungstabelle.
- https://platform.kimi.ai/docs/api/models-overview.md — Parameter-Matrix: `thinking` nur `{"type":"enabled","keep":"all"}`, kein `reasoning_effort`, kein `tool_choice: "required"`, temperature/top_p/n/Penalties fix; highspeed = dasselbe Modell mit identischen Constraints; FAQ zum Umstieg kimi-k2.7-code → kimi-k3; beim Wechsel von kimi-k2.6 muss historisches `reasoning_content` zurückgegeben werden.
- https://platform.kimi.ai/docs/guide/kimi-k2-7-code-quickstart.md — Positionierung (Instruktionstreue in langen Kontexten, 30 % weniger Overthinking), kein Non-Thinking-Modus, `max_tokens`-Default 32768, fixierte Sampling-Werte, `tool_choice` nur auto/none, `reasoning_content` in Tool-Schleifen behalten, Bild-/Videoformate, keine Bild-URLs, 100-MB-Request-Limit, Highspeed-Ressourcenhinweis.
- https://platform.kimi.ai/docs/guide/use-thinking-models.md — Thinking immer an, Preserved Thinking erzwungen (`thinking.keep` gilt als `"all"`), historisches `reasoning_content` MUSS erhalten bleiben, `reasoning_content` + `content` ≤ `max_tokens`, `max_tokens >= 16000` und Streaming empfohlen.
- https://platform.kimi.ai/docs/guide/response_format.md — `kimi-k2.7-code` mit der stabilsten Structured-Output-Unterstützung (`anyOf`/`oneOf`/`$ref`/`additionalProperties: true`), Empfehlung von kimi-k2.7-code für Structured Output, `strict: true`, nur `content` parsen, `partial=true` nur bei einfachen Schemas.
- https://platform.kimi.ai/docs/guide/prompt-best-practice.md — allgemeine Plattform-Prompting-Empfehlungen (Rolle, Delimiter, Schritte, Few-Shots, Längensteuerung).
- https://platform.kimi.ai/docs/guide/tool-call-repeat.md — Message-Layout-Check und Reminder-Eskalation bei 3 / 5 / 8 identischen Tool-Calls.
- https://platform.kimi.ai/docs/pricing/chat-k3.md und https://platform.kimi.ai/docs/guide/context-caching.md — Preise und 262.144-Token-Kontext für beide Varianten; Cache-Write nur für kimi-k3, nicht für die K2.x-Modelle.
- https://platform.kimi.ai/docs/api/messages.md, https://platform.kimi.ai/docs/api/responses.md und https://platform.kimi.ai/docs/guide/claude-code-kimi.md — `model`-Enum der Messages-API und Responses-API nur `kimi-k3`; Claude-Code-Setup mit `kimi-k2.7-code` als HAIKU-Tier über `https://api.moonshot.ai/anthropic`.
- https://platform.kimi.ai/docs/platform-changelog.md — Juni 2026: Release von Kimi K2.7 Code über die Open-Platform-API, danach die HighSpeed-Variante.
- https://huggingface.co/moonshotai/Kimi-K2.7-Code — offizielle Modellkarte: aufbauend auf K2.6, ca. 30 % weniger Thinking-Tokens, 1 T / 32 B aktiv, 384 Experten, MoonViT, natives INT4, Modified MIT; erzwungenes Thinking und Preserve-Thinking, Video experimentell, temperature 1.0 / top_p 0.95 empfohlen, kein Instant-Modus, „works best with Kimi Code CLI as its agent framework".
- https://forum.moonshot.ai/t/here-comes-kimi-k2-7-code-better-coding-with-more-efficiency/441 — offizielle Ankündigung vom 16.06.2026: Long-horizon-Coding mit 4.000+ Tool-Calls und 12+ Stunden, ca. 30 % weniger Thinking-Tokens als K2.6, HighSpeed ca. 180 / bis 260 Tokens/s, fixierte Sampling-Parameter.

---
model: kimi-k2.6
vendor: Moonshot AI
family: Kimi
aliases: [k2.6, kimi-k2-6, moonshotai/Kimi-K2.6]
last_verified: 2026-10-13
status: current
---

# Kimi K2.6

## Reasoning / Thinking
- Typ: **umschaltbar**. `thinking.type`: `"enabled"` (Default) | `"disabled"`; mit dem OpenAI-SDK über `extra_body={"thinking": {"type": "disabled"}}`. K2.6 ist damit das einzige aktuelle Kimi-API-Modell mit Non-Thinking-Modus (kimi-k3 und kimi-k2.7-code denken immer).
- `thinking.keep`: `null` (Default — historisches `reasoning_content` früherer Turns wird ignoriert, kürzerer Kontext, geringere Kosten) | `"all"` (Preserved Thinking). `keep` betrifft nur frühere Turns, nicht ob im aktuellen Turn gedacht wird; Moonshot empfiehlt `keep: "all"` zusammen mit `type: "enabled"`.
- **Kein `reasoning_effort`** — die Denktiefe ist nur an/aus, nicht stufbar.
- `reasoning_content` und `content` teilen sich `max_tokens` (Default 32.768); für Multi-Step-Tool-Calls empfiehlt der Thinking-Guide `max_tokens >= 16000` und Streaming. Im Stream kommt `reasoning_content` immer vor `content`.
- Innerhalb einer Tool-Schleife das gesamte `reasoning_content` mitsenden; Weglassen ist kein Fehler, verschlechtert laut Quickstart aber Kontinuität und Tool-Call-Qualität.

## Prompting-Stil
- Keine K2.6-spezifische Prompting-Anleitung; es gelten die allgemeinen Plattform-Empfehlungen: Rolle im System-Message setzen, Abschnitte mit Delimitern (Triple Quotes, XML-Tags, Überschriften) trennen, Arbeitsschritte explizit ausschreiben, Few-Shots für schwer beschreibbare Stile, Längenvorgaben als Absatz- oder Bullet-Zahl statt Wortzahl („The model can't read your mind").
- **Kein Sampling-Steuerknüppel**: temperature hängt fix am Modus, top_p/n/Penalties sind fixiert (s. u.). Varianz und Formattreue müssen über Prompt, `response_format` und Tool-Schemas kommen; Moonshot rät, die Defaults nicht zu übergeben.
- **Tools**: `tool_choice` nur `"auto"` (Default) oder `"none"`; laut Parameter-Referenz ist `"required"` auf kimi-k2.6 generell nicht unterstützt und liefert einen Fehler, der Quickstart begründet die Einschränkung mit aktivem Thinking. Tool-Erzwingung gehört daher in die Prompt-Anweisung.
- Wiederholte identische Tool-Calls behandelt Moonshot plattformweit Client-seitig: Message-Layout prüfen, dann `<system-reminder>`-Hinweise ab 3, verschärft ab 5 und erneut ab 8 identischen Wiederholungen — in der Agent-Schleife, nicht im statischen System-Prompt.
- Agent-Framework: Laut Modellkarte arbeitet K2.6 „best with Kimi Code CLI as its agent framework".

## Stärken & Schwächen (prompt-relevant)
- Stärken: Allzweckmodell für Text, Bild und Video, Dialog- und Agent-Aufgaben; Long-horizon-Coding über Sprachen (Rust, Go, Python) und Domänen (Frontend, DevOps, Performance) hinweg (Ankündigung: 4.000+ Tool-Calls, über 12 Stunden kontinuierliche Ausführung); Coding-Driven Design aus Prompts und visuellen Vorlagen; Agent-Swarm bis 300 Sub-Agenten × 4.000 Schritte.
- Schwäche Structured Output: bei komplexen Schemas laut Moonshot gelegentlich instabil — `content` kann in einen Markdown-Codeblock gehüllt sein, `oneOf`/`$ref` werden nicht strikt befolgt, bei `strict=false` oder `partial=true` erscheinen Felder außerhalb des Schemas, statt `null` kommen teils leere Strings. Moonshot empfiehlt einfache Schemas, eine zweite Validierungsschicht und für Structured Output `kimi-k2.7-code`.
- Weitere Schwächen: keine öffentlichen Bild-URLs (nur base64 bzw. Datei-Upload, Request-Body max. 100 MB); kein separat abrechenbarer Cache-Write und keine TTL-Wahl (laut Caching-FAQ nur kimi-k3); Video-Chat laut Modellkarte experimentell und nur über die offizielle API.
- Eingebaute Web-Suche `$web_search` ist plattformweit abgekündigt (Abschaltung 20.10.2026); der K2.6-Quickstart nennt sie zudem als vorübergehend inkompatibel mit dem Thinking-Modus. Ersatz sind die REST-APIs `/v1/tools/search`, `/v1/tools/search_pro`, `/v1/tools/fetch`.

## Output- & Format-Konventionen
- Kontextfenster 262.144 Tokens (256K); `max_tokens` Default 32.768. Modalitäten Text/Bild/Video → Text.
- **Fixierte Sampling-Parameter**: temperature 1.0 (Thinking) bzw. 0.6 (Non-Thinking), top_p 0.95, n 1, presence_penalty 0, frequency_penalty 0 — jeder andere Wert ist ein Fehler.
- `response_format`: `json_schema` mit `strict: true` (Moonshot: „Always explicitly set strict: true"); nur `choices[0].message.content` parsen und auf K2.6 Markdown-Marker vor dem Parsen entfernen.
- Schnittstelle: Chat Completions (OpenAI-kompatibel). Die Responses-API und das `model`-Enum der Messages-API-Referenz führen nur `kimi-k3`.
- Preise je 1M Tokens: $0.16 Cache-Hit / $0.95 Cache-Miss Input, $4.00 Output.
- Offene Gewichte (`moonshotai/Kimi-K2.6`, Modified MIT): 1 T Parameter gesamt / 32 B aktiv, MoE mit 384 Experten (8 gewählt, 1 geteilt), MoonViT-Vision-Encoder, natives INT4. Für vLLM/SGLang empfiehlt die Karte temperature 1.0 (Thinking) bzw. 0.6 (Instant) und top_p 0.95; Instant dort über `chat_template_kwargs: {"thinking": False}`.

## Migrations-Hinweise
- **ZU kimi-k3**: laut FAQ `model` tauschen, die K2.x-`thinking`-Konfiguration entfernen, optional `reasoning_effort` (`low|high|max`, Default `max`) setzen und in Multi-Turn- und Tool-Abläufen die komplette Assistant-Message inkl. `reasoning_content` unverändert zurückgeben (auf K3 Pflicht, auf K2.6 ohne `keep: "all"` optional). Non-Thinking-Prompts haben auf K3 kein Äquivalent — K3 denkt immer, nächster Hebel ist `reasoning_effort: "low"`.
- **ZU kimi-k2.7-code**: `thinking` entfernen (nur `{"type":"enabled","keep":"all"}` wäre gültig), die 0.6-Temperatur-Annahme streichen und historisches `reasoning_content` zwingend zurückgeben; vereinfachte JSON-Schemas dürfen dort wieder `oneOf`/`$ref` nutzen.
- **VON anderen Anbietern**: Sampling- und Effort-Regler ersatzlos streichen; ein „schnelles" Ziel ohne Reasoning auf `thinking.type: "disabled"` abbilden, gestuftes Reasoning-Budget gibt es nicht; `tool_choice: "required"` bzw. erzwungene Tools in Prompt-Anweisungen umformulieren; Bild-URLs auf base64 oder Datei-Upload umstellen; komplexe Schemas vereinfachen.
- **VON kimi-k2.6 weg**: den Thinking-Schalter auf den Mechanismus des Ziels abbilden; Markdown-Stripping und Zweitvalidierung nur behalten, wenn das Ziel ähnliche Schwächen dokumentiert; Sampling-Parameter wieder als echte Stellschrauben einplanen.

## Quellen
- https://platform.kimi.ai/docs/models.md — Roster: `kimi-k2.6` „Supports both visual and text input, thinking and non-thinking modes, and dialogue and Agent tasks. Context 256k"; nicht in der Abkündigungstabelle.
- https://platform.kimi.ai/docs/api/models-overview.md — Parameter-Matrix: `thinking` enabled/disabled/`keep: "all"`, kein `reasoning_effort`, kein `tool_choice: "required"`, temperature 1.0/0.6 fix, top_p/n/Penalties fix; FAQ „Switching from `kimi-k2.6` to `kimi-k3`"; `extra_body`-Beispiel.
- https://platform.kimi.ai/docs/guide/kimi-k2-6-quickstart.md — Positionierung als Allzweckmodell, Long-horizon-Coding, `max_tokens`-Default 32768, `thinking`-Default, fixierte Sampling-Werte, `tool_choice` nur auto/none bei aktivem Thinking, `reasoning_content` in Tool-Schleifen behalten, `$web_search`-Inkompatibilität mit Thinking, keine Bild-URLs, 100-MB-Request-Limit.
- https://platform.kimi.ai/docs/guide/use-thinking-models.md — `thinking.type`/`thinking.keep` mit Defaults, Preserved Thinking, `reasoning_content` + `content` ≤ `max_tokens`, `max_tokens >= 16000` und Streaming empfohlen.
- https://platform.kimi.ai/docs/guide/response_format.md — K2.6-Instabilitäten bei komplexen Schemas (Markdown-Codeblock, `oneOf`/`$ref`, Felder außerhalb des Schemas, leere Strings), Empfehlung von kimi-k2.7-code für Structured Output, `strict: true`.
- https://platform.kimi.ai/docs/guide/prompt-best-practice.md — allgemeine Plattform-Prompting-Empfehlungen (Rolle, Delimiter, Schritte, Few-Shots, Längensteuerung).
- https://platform.kimi.ai/docs/guide/tool-call-repeat.md — Message-Layout-Check und Reminder-Eskalation bei 3 / 5 / 8 identischen Tool-Calls.
- https://platform.kimi.ai/docs/pricing/chat-k3.md und https://platform.kimi.ai/docs/guide/context-caching.md — $0.16 / $0.95 / $4.00 je 1M Tokens, 262.144-Token-Kontext; Cache-Write nur für kimi-k3, nicht für kimi-k2.6.
- https://platform.kimi.ai/docs/guide/use-web-search.md und https://platform.kimi.ai/docs/pricing/websearch.md — `$web_search` abgekündigt, Abschaltung 20.10.2026; Ersatz `/v1/tools/search`, `/v1/tools/search_pro`, `/v1/tools/fetch`.
- https://platform.kimi.ai/docs/api/messages.md und https://platform.kimi.ai/docs/api/responses.md — `model`-Enum bzw. unterstütztes Modell jeweils nur `kimi-k3`.
- https://platform.kimi.ai/docs/platform-changelog.md — April 2026: Release von Kimi K2.6 über die Open-Platform-API.
- https://huggingface.co/moonshotai/Kimi-K2.6 — offizielle Modellkarte: Key Features (Long-Horizon Coding, Coding-Driven Design, Agent Swarm 300 × 4.000), 1 T / 32 B aktiv, 384 Experten, MoonViT, natives INT4, Modified MIT; Video experimentell, temperature 1.0 / 0.6 und top_p 0.95 empfohlen, Preserve-Thinking standardmäßig aus, „works best with Kimi Code CLI as its agent framework".
- https://forum.moonshot.ai/t/meet-kimi-k2-6-advancing-open-source-coding/369 — offizielle Ankündigung vom 21.04.2026: 4.000+ Tool-Calls und über 12 Stunden kontinuierliche Ausführung, Agent-Swarm 300 × 4.000 Schritte.

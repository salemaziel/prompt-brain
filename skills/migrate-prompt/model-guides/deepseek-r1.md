---
model: deepseek-r1
vendor: DeepSeek
family: DeepSeek
aliases: [deepseek-reasoner, r1]
last_verified: 2026-10-13
status: legacy
successor: deepseek-v4.1-flash
---

# DeepSeek-R1

## Reasoning / Thinking
- **Typ: immer an (Reasoning-Modell).** DeepSeek-R1 ist ein dediziertes Reasoning-Modell, das vor der eigentlichen Antwort eine Chain-of-Thought (CoT) in einem `<think>...</think>`-Block erzeugt. Es gibt keinen Schalter zum vollständigen Abschalten des Thinkings.
- **Kein System-Prompt.** Offizielle Empfehlung: „Avoid adding a system prompt; all instructions should be contained within the user prompt." Sämtliche Anweisungen gehören also in den User-Prompt, nicht in eine System-Rolle.
- **Kein few-shot.** Laut Paper ist R1 promptsensitiv: „Few-shot prompting consistently degrades its performance." Empfehlung: „We recommend users directly describe the problem and specify the output format using a zero-shot setting for optimal results."
- **Temperatur-Empfehlung: 0.5–0.7, empfohlen 0.6** („to prevent endless repetitions or incoherent outputs"); im Paper wird zur Evaluation `temperature = 0.6` und `top_p = 0.95` verwendet.
- **`<think>`-Start erzwingen.** „To ensure that the model engages in thorough reasoning, we recommend enforcing the model to initiate its response with `<think>\n` at the beginning of every output." Hintergrund: Die R1-Serie umgeht teils das Thinking, indem sie einen leeren Block (`<think>\n\n</think>`) ausgibt, was die Leistung verschlechtert.
- **Mathe-Prompts.** Für mathematische Aufgaben wird ein expliziter Hinweis empfohlen: „Please reason step by step, and put your final answer within `\boxed{}`."
- **API: `reasoning_content`.** Über die API (Modellname `deepseek-reasoner`) liefert das Modell die CoT separat im Feld `reasoning_content` (gleiche Strukturebene wie `content`, das die finale Antwort enthält). In Folge-Runden wurde die CoT der Vorrunden NICHT in den Kontext übernommen; das Feld `reasoning_content` musste laut früherer Reasoning-Doku vor dem nächsten Request aus der Message entfernt werden, sonst gab es einen 400-Fehler (unbelegt — die Seite ist offline; die heutige Thinking-Mode-Doku sagt für Requests ohne `tools`, dass zurückgereichtes `reasoning_content` ignoriert wird).
- **Hinweis zur API-Identität:** Die API-ID `deepseek-reasoner` ist seit 2026-07-24 15:59 UTC abgeschaltet (zuletzt auf den Thinking-Modus von `deepseek-v4-flash` geroutet); R1 ist nur noch als Open-Weights-Modell nutzbar. Alias-Semantik laut Change Log: `deepseek-reasoner` = R1 (ab 2025-01-20), R1-0528 (ab 2025-05-28), Thinking-Modus von V3.1/V3.1-Terminus/V3.2-Exp/V3.2 (ab 2025-08-21) und V4-Flash (ab 2026-04-24) — Prompts nach 2025-08-21 zielten auf ein Hybrid-Modell mit System-Prompt- und Tool-Support. Die API-Angaben in diesem Guide beschreiben den historischen Endpunkt. Das ursprüngliche Open-Weights-Modell „DeepSeek-R1" (arXiv 2501.12948, HF-Modelkarte) ist davon zu unterscheiden; die obigen Reasoning-Empfehlungen stammen aus dessen Modelkarte/Paper.

## Prompting-Stil
- **Mäßig präskriptiv, aber mit klaren Regeln.** DeepSeek gibt wenige, dafür harte Vorgaben: kein System-Prompt, kein few-shot, Temperatur im engen Band 0.6, Ausgabeformat explizit im User-Prompt verlangen.
- **Empfohlen:** Aufgabe direkt und in einfacher Sprache beschreiben (zero-shot); gewünschtes Ausgabeformat ausdrücklich angeben; bei Mathe `\boxed{}`-Direktive ergänzen; Antwort mit `<think>\n` beginnen lassen.
- **Abgeraten:** Few-shot-Beispiele („consistently degrades performance"), System-Prompts, sehr hohe oder sehr niedrige Temperatur (außerhalb 0.5–0.7).
- **Evaluation:** Mehrere Durchläufe fahren und mitteln, da das Modell promptsensitiv ist.

## Stärken & Schwächen (prompt-relevant)
- **Stärken:** Starkes mehrstufiges Reasoning (Mathematik, Code, Logik) dank RL-Training; profitiert von schlanken, direkten Zero-Shot-Anweisungen; liefert nachvollziehbare CoT, die über `reasoning_content` getrennt abgreifbar ist.
- **Schwächen / Fallstricke:** Promptsensitiv — few-shot und überladener Kontext schaden eher; neigt bei manchen Anfragen dazu, das Thinking zu überspringen (leerer `<think>`-Block); kann bei Temperatur außerhalb 0.5–0.7 in Wiederholungen/Inkohärenz kippen; System-Prompt laut Modelkarte zu vermeiden.
- **API-Einschränkungen (historisch, API `deepseek-reasoner`):** Original-R1-API: kein Function Calling, kein FIM, `logprobs` → Fehler (unbelegt — die frühere Reasoning-Doku ist offline); laut Change Log brachte das R1-0528-Upgrade „JSON Output & Function Calling Support".

## Output- & Format-Konventionen
- **`<think>...</think>` + Antwort.** Roh-Output enthält den CoT-Block, gefolgt von der finalen Antwort. Über die API wird die CoT als `reasoning_content` ausgeliefert, die Endantwort als `content`.
- **`max_tokens`** (historisch, API `deepseek-reasoner`) umfasste die CoT mit. Default 32K Tokens, Maximum 64K Tokens (unbelegt — die frühere Reasoning-Doku ist offline).
- **Kontextlänge** des Modells: 128K Tokens (HF-Modelkarte).
- **Mathe-Ausgabe** in `\boxed{}`, wenn per Direktive angefordert.
- **Nicht wirksame Sampling-Parameter über die API (historisch, API `deepseek-reasoner`; unbelegt — die frühere Reasoning-Doku ist offline):** `temperature`, `top_p`, `presence_penalty`, `frequency_penalty` lösen keinen Fehler aus, haben aber keine Wirkung; `logprobs`, `top_logprobs` lösen einen Fehler aus. (Die Temperatur-Empfehlung 0.6 gilt für lokale/Open-Weights-Nutzung bzw. Drittanbieter-Inferenz.)

## Migrations-Hinweise
- **WEG von DeepSeek-R1 (zu Nicht-Reasoning-/Instruct-Modellen):**
  - System-Prompt wieder einführen: Bei Zielmodellen mit System-Rolle Anweisungen aus dem User-Prompt in einen System-Prompt heben.
  - Few-shot reaktivieren: Bei vielen Instruct-Modellen helfen Beispiele wieder.
  - Thinking-Spezifika entfernen: `<think>\n`-Erzwingung, `\boxed{}`-Direktive und das Parsen von `reasoning_content` entfernen bzw. anpassen.
  - Temperatur neu wählen: Das enge Band 0.6 ist R1-spezifisch; Zielmodell nach dessen eigenen Defaults konfigurieren.
- **ZU DeepSeek-R1 (von Instruct-/Chat-Modellen):**
  - System-Prompt auflösen: Inhalte des System-Prompts in den User-Prompt verschieben (Modelkarte: „Avoid adding a system prompt").
  - Few-shot entfernen: Beispielblöcke streichen, stattdessen Aufgabe + Ausgabeformat direkt (zero-shot) beschreiben.
  - Temperatur auf 0.5–0.7 (0.6) setzen, top_p ~0.95.
  - Output mit `<think>\n` beginnen lassen; bei Mathe `\boxed{}`-Direktive ergänzen.
  - Mehrrunden-Handling anpassen: CoT der Vorrunde nicht in den Kontext zurückspielen; nur für den historischen `deepseek-reasoner`-Endpunkt: `reasoning_content` vor dem nächsten API-Call entfernen (sonst 400 — unbelegt, Doku offline).
  - Nur für Original-R1: Function Calling / FIM nicht nutzen (unbelegt, s. o.; R1-0528 bekam laut Change Log Function Calling); falls genutzt, durch Prompt-Formatierung ersetzen.

## Quellen
- https://huggingface.co/deepseek-ai/DeepSeek-R1 — Offizielle Modelkarte: Usage Recommendations (kein System-Prompt, Temperatur 0.5–0.7/0.6, `<think>\n`-Erzwingung, leerer-Think-Block-Hinweis, `\boxed{}`-Direktive), Kontextlänge 128K.
- https://github.com/deepseek-ai/DeepSeek-R1/blob/main/README.md — Identischer Usage-Recommendations-Abschnitt im offiziellen Repo.
- https://arxiv.org/html/2501.12948v1 — DeepSeek-R1-Paper (§5): „it is sensitive to prompts", „Few-shot prompting consistently degrades its performance", zero-shot-Empfehlung; Evaluations-Setup: `temperature = 0.6`, `top_p = 0.95`.
- https://api-docs.deepseek.com/guides/thinking_mode — Nachfolgeseite der offline genommenen Reasoning-Doku (`guides/reasoning_model`): `reasoning_content` neben `content`, ohne `tools` wird zurückgereichtes `reasoning_content` ignoriert, im Thinking-Modus wirkungslose Sampling-Parameter. Die R1-spezifischen API-Angaben (32K/64K, `logprobs`-Fehler, 400 bei zurückgereichtem `reasoning_content`) belegt sie nicht.
- https://api-docs.deepseek.com/news/news260424 — Abschaltung von `deepseek-reasoner` am 2026-07-24 15:59 UTC, bis dahin Routing auf den Thinking-Modus von `deepseek-v4-flash`.
- https://api-docs.deepseek.com/updates — Alias-Historie `deepseek-reasoner` (R1, R1-0528, V3.1 bis V3.2, V4-Flash), R1-0528 mit „JSON Output & Function Calling Support".

# AI intent parser

`parseSearchIntent(userMessage): Promise<SearchIntent>` is a server-only interpreter using the official OpenAI JavaScript SDK Responses API. AI interprets language; deterministic engines calculate facts. This module never searches, calculates finances/distances, ranks, recommends, or calls an analyst.

## Configuration

Set `OPENAI_API_KEY` in the server environment or ignored `.env.local`. Never use a NEXT_PUBLIC variable or commit a key. Optional `OPENAI_INTENT_MODEL` overrides the default `gpt-4.1-mini`, selected as a small instruction-following model supporting structured output. The override must support Responses JSON schema output. No environment files or keys are created by this implementation. Clients initialize only on invocation, so builds need no key.

Official references: [model](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Contract and validation

The existing SearchIntent is unchanged: hardConstraints (city, maximumPurchasePriceSek, minimumRooms, maximumMonthlyCashRequirementSek, maximumWalkingTimeMinutes), locationPreferences (desiredNearbyAmenities), financialPreferences (availableDownPaymentSek, preferredMonthlyCashRequirementSek, assumedAnnualInterestRate), and tradeOffPreferences (willingToPayMoreForLocation).

The strict API schema requires nullable keys, forbids extra properties, and restricts amenities to shopping/public_transport. The independent local validator accepts omitted or null optional information, removes nulls and empty sections, rejects unknown keys, invalid types and negative/nonfinite numbers, and preserves known zero/false values. It does not coerce numeric strings or infer defaults. It normalizes only explicit Gothenburg/Göteborg city aliases to Göteborg; other names are trimmed and Unicode-normalized without geographic inference.

Examples of intended extraction (not live-model test results):

- “Gothenburg” → `{ hardConstraints: { city: "Göteborg" } }`.
- “Cannot exceed 20k/month” → hard maximum 20000; “prefer around 18k but could go higher” → preferred amount 18000 only.
- “I have 700,000 SEK available; assume 3%” → down payment 700000 and annual decimal rate 0.03.
- “I'd pay more for location” → boolean true, no numeric premium.
- “Within a 15 minute walk of transit” → walking-time constraint 15 and public_transport preference. Search currently rejects this unsupported routing constraint.
- “Affordable and central” → no invented amount or distance; unrepresentable intent is omitted.

The current contract cannot express mandatory amenity proximity without an explicit walking-time boundary. “Must be close to public transport” therefore retains public_transport as the closest supported location preference; it is not enforced as a hard filter. Soft price/room/city preferences have no dedicated fields and must not be promoted to hard constraints. These are representational limitations, not inferred requirements.

## Security and errors

The entrypoint imports `server-only`. User text is a separate user message; it never sets instructions, schema, model, or API configuration. No tools, database, property data, chat history, or domain engines are supplied. Requests use store:false, a 30-second timeout, no automatic retries, and an output-token cap. Input must be nonempty and at most 10,000 characters. Messages, keys, and upstream error bodies are not logged by this module.

Empty input, missing keys, provider errors, refusals, incomplete responses, absent output, malformed JSON, and validation failures throw clear errors rather than returning an empty intent. An empty intent is valid only when successful model output has no representable facts.

Provider failures retain safe HTTP-status or connection/timeout context without upstream message bodies. The installed SDK requires Node 22 or newer; the existing tests use Node 24.

Prompt instructions and schema validation reduce risks but cannot guarantee semantic correctness or immunity to prompt injection. A schema-valid result can still misinterpret or invent a value; local validation checks structure, not evidence in the user's language. User confirmation/semantic evaluation will be a later product decision. The parser makes no claim that a property is affordable. No live semantic accuracy evaluation is performed in this task.

## Tests

Run `node --test tests/intent-parser.test.mjs` and `node --test tests/*.test.mjs`, followed by lint/build. Pure validation tests run without credentials. The integration fixture runs in a child Node process with the react-server condition, exercising the public parser and real SDK against mocked fetch; no network calls occur. Another check confirms the server-only marker blocks a normal import. Mock tests verify transport/validation, not model language comprehension.

No UI, route, agent, memory, RAG, scoring, or comparison explanation is added.

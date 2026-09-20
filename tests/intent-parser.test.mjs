import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { validateSearchIntent, validateUserMessage, parseIntentJson, intentSchema } from "../server/ai/intent-schema.ts";

test("valid intent preserves hard versus preferred amounts and explicit trade-offs", () => {
  const input = { hardConstraints: { city: " Gothenburg ", maximumMonthlyCashRequirementSek: 20000, minimumRooms: 3 }, financialPreferences: { preferredMonthlyCashRequirementSek: 18000, availableDownPaymentSek: 700000, assumedAnnualInterestRate: 0.03 }, locationPreferences: { desiredNearbyAmenities: ["shopping", "public_transport"] }, tradeOffPreferences: { willingToPayMoreForLocation: true } };
  const before = structuredClone(input);
  assert.deepEqual(validateSearchIntent(input), { ...input, hardConstraints: { ...input.hardConstraints, city: "Göteborg" } });
  assert.deepEqual(input, before);
});

test("missing and null optional fields produce no invented defaults", () => {
  assert.deepEqual(validateSearchIntent({}), {});
  assert.deepEqual(validateSearchIntent({ hardConstraints: { city: null }, financialPreferences: null }), {});
  assert.deepEqual(validateSearchIntent({ financialPreferences: { preferredMonthlyCashRequirementSek: 18000 } }), { financialPreferences: { preferredMonthlyCashRequirementSek: 18000 } });
  assert.deepEqual(validateSearchIntent({ tradeOffPreferences: { willingToPayMoreForLocation: false } }), { tradeOffPreferences: { willingToPayMoreForLocation: false } });
});

test("all numeric fields reject negative, nonfinite and nonnumeric values", () => {
  for (const [section, schema] of Object.entries(intentSchema.properties)) {
    for (const [field, definition] of Object.entries(schema.properties)) {
      if (!definition.type.includes("number")) continue;
      for (const value of [-1, NaN, Infinity, "20000", true]) {
        assert.throws(() => validateSearchIntent({ [section]: { [field]: value } }), /finite nonnegative/);
      }
      assert.deepEqual(validateSearchIntent({ [section]: { [field]: 0 } }), { [section]: { [field]: 0 } });
    }
  }
});

test("unsupported categories, fields and malformed shapes fail", () => {
  for (const input of [null, [], "text", { financialPreferences: [] }, { locationPreferences: { desiredNearbyAmenities: ["gym"] } }, { tradeOffPreferences: { premiumSek: 2000 } }, { score: 87 }, { hardConstraints: { city: " " } }, { tradeOffPreferences: { willingToPayMoreForLocation: "true" } }, JSON.parse('{"__proto__":{}}')]) {
    assert.throws(() => validateSearchIntent(input), /Invalid intent/);
  }
  assert.throws(() => parseIntentJson("not JSON"), /malformed JSON/);
  assert.throws(() => parseIntentJson('{"hardConstraints":{"minimumRooms":1e400}}'), /finite/);
});

test("input is bounded and city normalization is deliberately narrow", () => {
  for (const input of ["", "  ", null, "x".repeat(10001)]) assert.throws(() => validateUserMessage(input));
  assert.equal(validateUserMessage(" near shops "), "near shops");
  assert.deepEqual(validateSearchIntent({ hardConstraints: { city: "GÖTEBORG" } }), { hardConstraints: { city: "Göteborg" } });
  assert.deepEqual(validateSearchIntent({ hardConstraints: { city: "Mölndal" } }), { hardConstraints: { city: "Mölndal" } });
});

test("strict schema has required nullable fields and prohibits extra keys", () => {
  assert.equal(intentSchema.additionalProperties, false);
  assert.deepEqual(intentSchema.required, Object.keys(intentSchema.properties));
  for (const section of Object.values(intentSchema.properties)) {
    assert.equal(section.additionalProperties, false);
    assert.deepEqual(section.required, Object.keys(section.properties));
    for (const field of Object.values(section.properties)) assert.ok(field.type.includes("null"));
  }
});

test("server-only SDK integration with mocked transport (no network)", () => {
  const child = spawnSync(process.execPath, ["--conditions=react-server", "--test", "tests/fixtures/intent-parser-api.mjs"], { encoding: "utf8" });
  assert.equal(child.status, 0, child.stdout + child.stderr);
});

test("parser cannot load in ordinary client-compatible Node condition", () => {
  const child = spawnSync(process.execPath, ["--input-type=module", "-e", "import './server/ai/intent-parser.ts'"], { encoding: "utf8" });
  assert.notEqual(child.status, 0);
  assert.match(child.stderr, /Client Component/);
});

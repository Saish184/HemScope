import assert from "node:assert/strict";
import test from "node:test";
import { compareProperties } from "../domain/properties/property-comparison.ts";
import { analyzeProperty } from "../domain/properties/property-analysis.ts";
import { properties } from "../src/data/properties.ts";
import { locations } from "../src/data/locations.ts";

const buyer = { availableDownPaymentSek: 600_000, assumedAnnualInterestRate: 0.0275 };
const analyses = [properties[11], properties[1], properties[0]].map((property) =>
  analyzeProperty(property, buyer, locations, ["shopping", "public_transport"]),
);

test("empty comparison has a new empty properties array", () => {
  const input = [];
  const result = compareProperties(input);
  assert.deepEqual(result, { properties: [] });
  assert.notEqual(result.properties, input);
});

test("one analysis retains its identity and every nested fact", () => {
  const result = compareProperties([analyses[0]]);
  assert.equal(result.properties.length, 1);
  assert.equal(result.properties[0], analyses[0]);
  assert.equal(result.properties[0].financial, analyses[0].financial);
  assert.equal(result.properties[0].location, analyses[0].location);
  assert.deepEqual(result.properties[0], analyses[0]);
});

test("multiple properties retain caller order without ranking or deduplication", () => {
  const input = [...analyses, analyses[1]];
  const result = compareProperties(input);
  assert.deepEqual(result.properties.map((a) => a.property.id), [
    "demo-property-12", "demo-property-02", "demo-property-01", "demo-property-02",
  ]);
  result.properties.forEach((analysis, index) => assert.equal(analysis, input[index]));
});

test("input array is not mutated and output array edits are independent", () => {
  const input = Object.freeze([...analyses]);
  const before = structuredClone(input);
  const result = compareProperties(input);
  result.properties.reverse();
  result.properties.pop();
  assert.deepEqual(input, before);
  assert.equal(input.length, 3);
});

test("comparison is deterministic and adds no score, rank, or winner fields", () => {
  const before = structuredClone(analyses);
  const result = compareProperties(analyses);
  assert.deepEqual(compareProperties(analyses), result);
  assert.deepEqual(Object.keys(result), ["properties"]);
  assert.deepEqual(result.properties, before);
  assert.deepEqual(analyses, before);
});

test("comparison does not read or recalculate financial or location facts", () => {
  // Access guards catch calculations or inspection, without coupling to formulas.
  const guarded = new Proxy(analyses[0], {
    get() { throw new Error("Comparison must not inspect analysis fields"); },
  });
  const result = compareProperties([guarded]);
  assert.equal(result.properties[0], guarded);
});

test("missing and unrequested location facts remain distinct", () => {
  const missing = analyzeProperty(properties[0], buyer, [], ["shopping"]);
  const unrequested = analyzeProperty(properties[1], buyer, locations, []);
  const result = compareProperties([missing, unrequested]);
  assert.deepEqual(result.properties[0].location, { shopping: null });
  assert.deepEqual(result.properties[1].location, {});
});

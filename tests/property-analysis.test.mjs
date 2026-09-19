import assert from "node:assert/strict";
import test from "node:test";
import { analyzeProperty } from "../domain/properties/property-analysis.ts";
import { calculateFinancialResult } from "../domain/finance/financial-engine.ts";
import { findNearestLocation } from "../domain/location/location-engine.ts";
import { properties } from "../src/data/properties.ts";
import { locations } from "../src/data/locations.ts";

const property = properties.find((p) => p.id === "demo-property-06");
const buyer = { availableDownPaymentSek: 600_000, assumedAnnualInterestRate: 0.0275 };

test("analysis preserves the original property and complete financial engine output", () => {
  const result = analyzeProperty(property, buyer, locations, []);
  assert.deepEqual(Object.keys(result).sort(), ["financial", "location", "property"]);
  assert.equal(result.property, property);
  assert.deepEqual(result.financial, calculateFinancialResult(property, buyer));
  assert.deepEqual(result.location, {});
});

test("shopping analysis preserves nearest POI and its unrounded distance", () => {
  const result = analyzeProperty(property, buyer, locations, ["shopping"]);
  assert.equal(result.location.shopping.location.id, "coop-backaplan");
  assert.ok(result.location.shopping.distanceMeters > 3100 && result.location.shopping.distanceMeters < 3200);
  assert.deepEqual(result.location.shopping, findNearestLocation(property, locations, "shopping"));
  assert.equal(Object.hasOwn(result.location, "public_transport"), false);
});

test("transport analysis is independent of shopping", () => {
  const result = analyzeProperty(property, buyer, locations, ["public_transport"]);
  assert.equal(result.location.public_transport.location.id, "gamlestaden");
  assert.ok(result.location.public_transport.distanceMeters > 100 && result.location.public_transport.distanceMeters < 200);
  assert.deepEqual(result.location.public_transport, findNearestLocation(property, locations, "public_transport"));
  assert.equal(Object.hasOwn(result.location, "shopping"), false);
});

test("multiple requested amenities coexist and duplicates collapse to one key", () => {
  const result = analyzeProperty(property, buyer, locations, ["shopping", "public_transport", "shopping"]);
  assert.deepEqual(Object.keys(result.location), ["shopping", "public_transport"]);
  for (const amenity of ["shopping", "public_transport"]) {
    assert.deepEqual(result.location[amenity], findNearestLocation(property, locations, amenity));
  }
});

test("missing matches are null, distinct from unrequested amenities", () => {
  const transportOnly = locations.filter((poi) => poi.type === "public_transport");
  const result = analyzeProperty(property, buyer, transportOnly, ["shopping", "public_transport"]);
  assert.equal(result.location.shopping, null);
  assert.equal(result.location.public_transport.location.id, "gamlestaden");
  assert.deepEqual(analyzeProperty(property, buyer, [], ["shopping", "public_transport"]).location, { shopping: null, public_transport: null });
});

test("unrequested POI categories are not evaluated", () => {
  const invalidShopping = { ...locations.find((poi) => poi.type === "shopping"), latitude: NaN };
  const input = [...locations.filter((poi) => poi.type === "public_transport"), invalidShopping];
  assert.doesNotThrow(() => analyzeProperty(property, buyer, input, ["public_transport"]));
  assert.deepEqual(analyzeProperty(property, buyer, input, []).location, {});
  assert.throws(() => analyzeProperty(property, buyer, input, ["shopping"]), RangeError);
});

test("financial validation errors propagate without replacement totals", () => {
  for (const invalid of [{ ...property, costProfile: undefined }, { ...property, monthlyAssociationFeeSek: null }]) {
    let expected;
    try { calculateFinancialResult(invalid, buyer); } catch (error) { expected = error; }
    assert.ok(expected instanceof Error);
    assert.throws(() => analyzeProperty(invalid, buyer, locations, ["shopping"]), { name: expected.name, message: expected.message });
  }
  assert.throws(() => analyzeProperty(property, { ...buyer, assumedAnnualInterestRate: -1 }, locations, []), /assumedAnnualInterestRate/);
});

test("location engine tie policy and coordinate validation are preserved", () => {
  const shopping = locations.find((poi) => poi.type === "shopping");
  const tied = [{ ...shopping, id: "first" }, { ...shopping, id: "second" }];
  const result = analyzeProperty(property, buyer, tied, ["shopping"]);
  assert.equal(result.location.shopping.location.id, "first");
  assert.deepEqual(result.location.shopping, findNearestLocation(property, tied, "shopping"));
  assert.throws(() => analyzeProperty({ ...property, location: { latitude: 91, longitude: 0 } }, buyer, locations, ["shopping"]), RangeError);
});

test("analysis is deterministic and leaves all inputs unchanged", () => {
  const requested = ["shopping", "public_transport"];
  const before = structuredClone({ properties, locations, buyer, requested });
  for (const candidate of properties) {
    assert.deepEqual(analyzeProperty(candidate, buyer, locations, requested), analyzeProperty(candidate, buyer, locations, requested));
  }
  assert.deepEqual({ properties, locations, buyer, requested }, before);
});

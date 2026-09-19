import assert from "node:assert/strict";
import test from "node:test";
import { calculateDistanceMeters, calculatePropertyLocationDistances, findNearestLocation } from "../domain/location/location-engine.ts";
import { properties } from "../src/data/properties.ts";
import { locations } from "../src/data/locations.ts";

const nordstan = locations.find((point) => point.id === "nordstan");
const central = locations.find((point) => point.id === "centralstation");
const gamlestadenProperty = properties.find((property) => property.area === "Gamlestaden");

test("identical coordinates have zero distance", () => {
  assert.equal(calculateDistanceMeters(nordstan, nordstan), 0);
});

test("Nordstan and Centralstation are roughly 250 meters apart and distance is symmetric", () => {
  const distance = calculateDistanceMeters(nordstan, central);
  assert.ok(distance > 200 && distance < 300);
  assert.ok(Math.abs(distance - calculateDistanceMeters(central, nordstan)) < 1e-9);
});

test("global reference arcs catch degree/radian errors and handle the date line", () => {
  const quarterEarth = calculateDistanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 90 });
  assert.ok(quarterEarth > 10_000_000 && quarterEarth < 10_020_000);
  const antipodes = calculateDistanceMeters({ latitude: 35, longitude: 10 }, { latitude: -35, longitude: -170 });
  assert.ok(Number.isFinite(antipodes) && antipodes > 20_000_000 && antipodes < 20_040_000);
  const dateLine = calculateDistanceMeters({ latitude: 0, longitude: 179.9 }, { latitude: 0, longitude: -179.9 });
  assert.ok(dateLine > 22_000 && dateLine < 22_300);
});

test("property distances retain every POI and input order without mutation", () => {
  const before = structuredClone({ properties, locations });
  const results = calculatePropertyLocationDistances(gamlestadenProperty, locations);
  assert.deepEqual(results.map((result) => result.location.id), locations.map((location) => location.id));
  assert.ok(results.every((result) => Number.isFinite(result.distanceMeters) && result.distanceMeters >= 0));
  assert.deepEqual({ properties, locations }, before);
  assert.deepEqual(calculatePropertyLocationDistances(gamlestadenProperty, []), []);
});

test("dataset selection finds Gamlestaden transport and excludes it from shopping", () => {
  const transport = findNearestLocation(gamlestadenProperty, locations, "public_transport");
  assert.equal(transport.location.id, "gamlestaden");
  assert.ok(transport.distanceMeters > 100 && transport.distanceMeters < 200);
  const shopping = findNearestLocation(gamlestadenProperty, locations, "shopping");
  assert.equal(shopping.location.id, "coop-backaplan");
  assert.equal(shopping.location.type, "shopping");
  assert.ok(shopping.distanceMeters > 3_000 && shopping.distanceMeters < 3_500);
  assert.ok(transport.distanceMeters < shopping.distanceMeters);
});

test("nearest selection uses distance, not input order or neighborhood labels", () => {
  const property = { ...gamlestadenProperty, area: "Unrelated label", location: nordstan };
  const result = findNearestLocation(property, [...locations].reverse(), "shopping");
  assert.equal(result.location.id, "nordstan");
  assert.equal(result.distanceMeters, 0);
});

test("empty and missing amenity sets return null", () => {
  assert.equal(findNearestLocation(gamlestadenProperty, [], "shopping"), null);
  assert.equal(findNearestLocation(gamlestadenProperty, [central], "shopping"), null);
});

test("repeated results are deterministic and exact ties choose the first input", () => {
  const before = structuredClone({ properties, locations });
  for (const property of properties) {
    assert.deepEqual(calculatePropertyLocationDistances(property, locations), calculatePropertyLocationDistances(property, locations));
    for (const amenity of ["shopping", "public_transport"]) {
      assert.deepEqual(findNearestLocation(property, locations, amenity), findNearestLocation(property, locations, amenity));
    }
  }
  const tied = [{ ...nordstan, id: "first" }, { ...nordstan, id: "second" }];
  assert.equal(findNearestLocation(gamlestadenProperty, tied, "shopping").location.id, "first");
  assert.deepEqual({ properties, locations }, before);
});

test("invalid coordinates fail explicitly instead of returning misleading results", () => {
  for (const invalid of [
    { latitude: NaN, longitude: 0 }, { latitude: 0, longitude: Infinity },
    { latitude: 91, longitude: 0 }, { latitude: -91, longitude: 0 },
    { latitude: 0, longitude: 181 }, { latitude: 0, longitude: -181 },
  ]) {
    assert.throws(() => calculateDistanceMeters(invalid, nordstan), RangeError);
    assert.throws(() => calculateDistanceMeters(nordstan, invalid), RangeError);
    assert.throws(() => calculatePropertyLocationDistances({ location: invalid }, []), RangeError);
    assert.throws(() => findNearestLocation({ location: invalid }, [], "shopping"), RangeError);
  }
  const invalidPoi = { ...nordstan, latitude: NaN };
  assert.throws(() => calculatePropertyLocationDistances(gamlestadenProperty, [invalidPoi]), RangeError);
  assert.throws(() => findNearestLocation(gamlestadenProperty, [invalidPoi], "shopping"), RangeError);
  assert.equal(findNearestLocation(gamlestadenProperty, [invalidPoi], "public_transport"), null);
});

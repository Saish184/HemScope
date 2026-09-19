import assert from "node:assert/strict";
import test from "node:test";
import { properties } from "../src/data/properties.ts";
import { locations } from "../src/data/locations.ts";

test("demo inputs have unique identities and plausible local coordinates", () => {
  assert.equal(properties.length, 12);
  assert.equal(locations.length, 19);
  for (const collection of [properties, locations]) {
    assert.equal(new Set(collection.map((item) => item.id)).size, collection.length);
    for (const item of collection) {
      const point = "location" in item ? item.location : item;
      assert.ok(Number.isFinite(point.latitude));
      assert.ok(Number.isFinite(point.longitude));
      assert.ok(point.latitude > 57.6 && point.latitude < 57.8);
      assert.ok(point.longitude > 11.8 && point.longitude < 12.1);
    }
  }
});

test("properties contain synthetic factual inputs and separate cost assumptions only", () => {
  const allowedFields = ["id", "address", "city", "area", "purchasePriceSek", "rooms", "sizeSqm", "monthlyAssociationFeeSek", "propertyType", "location", "costProfile"].sort();
  for (const property of properties) {
    assert.deepEqual(Object.keys(property).sort(), allowedFields);
    assert.match(property.address, /^HemScope Demo Property \d{2}$/);
    assert.equal(property.propertyType, "apartment");
    for (const key of ["purchasePriceSek", "rooms", "sizeSqm", "monthlyAssociationFeeSek"]) {
      assert.ok(Number.isFinite(property[key]) && property[key] > 0);
    }
    assert.deepEqual(Object.keys(property.location).sort(), ["latitude", "longitude"]);
    assert.deepEqual(Object.keys(property.costProfile).sort(), ["monthlyElectricityEstimateSek", "monthlyInsuranceEstimateSek", "monthlyInternetEstimateSek"]);
    for (const value of Object.values(property.costProfile)) {
      assert.ok(Number.isFinite(value) && value >= 0);
    }
  }
});

test("POIs use only supported categories and preserve key supplied references", () => {
  for (const location of locations) {
    assert.deepEqual(Object.keys(location).sort(), ["id", "latitude", "longitude", "name", "type"]);
    assert.ok(location.name.length > 0);
    assert.ok(["shopping", "public_transport"].includes(location.type));
  }
  assert.equal(locations.filter((point) => point.type === "shopping").length, 5);
  const nordstan = locations.find((point) => point.id === "nordstan");
  assert.equal(nordstan.latitude, 57.70862);
  assert.equal(nordstan.longitude, 11.96912);
  const chalmers = locations.find((point) => point.id === "chalmers");
  assert.equal(chalmers.latitude, 57.69002);
  assert.equal(chalmers.longitude, 11.97309);
});

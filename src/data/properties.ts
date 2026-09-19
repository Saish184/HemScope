import type { Property } from "../../types/property";

/**
 * These are synthetic training/demo properties calibrated against publicly
 * available Göteborg market observations. They are not live listings.
 * Coordinates are synthetic area-level placements, not verified residences.
 * Cost profiles are illustrative assumptions, not quotes or calculated totals.
 * Calibration and geographic provenance: see ./README.md.
 */
export const properties = [
  {
    "id": "demo-property-01",
    "address": "HemScope Demo Property 01",
    "city": "Göteborg",
    "area": "Linné",
    "purchasePriceSek": 4385000,
    "rooms": 3,
    "sizeSqm": 67,
    "monthlyAssociationFeeSek": 3186,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.6932,
      "longitude": 11.9528
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 325,
      "monthlyInsuranceEstimateSek": 179,
      "monthlyInternetEstimateSek": 299
    }
  },
  {
    "id": "demo-property-02",
    "address": "HemScope Demo Property 02",
    "city": "Göteborg",
    "area": "Majorna",
    "purchasePriceSek": 2285000,
    "rooms": 2,
    "sizeSqm": 46,
    "monthlyAssociationFeeSek": 4518,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.69,
      "longitude": 11.9225
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 265,
      "monthlyInsuranceEstimateSek": 149,
      "monthlyInternetEstimateSek": 329
    }
  },
  {
    "id": "demo-property-03",
    "address": "HemScope Demo Property 03",
    "city": "Göteborg",
    "area": "Majorna",
    "purchasePriceSek": 4595000,
    "rooms": 3,
    "sizeSqm": 69,
    "monthlyAssociationFeeSek": 4872,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.6965,
      "longitude": 11.9287
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 348,
      "monthlyInsuranceEstimateSek": 185,
      "monthlyInternetEstimateSek": 349
    }
  },
  {
    "id": "demo-property-04",
    "address": "HemScope Demo Property 04",
    "city": "Göteborg",
    "area": "Johanneberg",
    "purchasePriceSek": 3895000,
    "rooms": 3,
    "sizeSqm": 72,
    "monthlyAssociationFeeSek": 5096,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.6858,
      "longitude": 11.9824
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 372,
      "monthlyInsuranceEstimateSek": 198,
      "monthlyInternetEstimateSek": 299
    }
  },
  {
    "id": "demo-property-05",
    "address": "HemScope Demo Property 05",
    "city": "Göteborg",
    "area": "Kålltorp",
    "purchasePriceSek": 2845000,
    "rooms": 2,
    "sizeSqm": 57,
    "monthlyAssociationFeeSek": 4387,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.7145,
      "longitude": 12.0265
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 287,
      "monthlyInsuranceEstimateSek": 159,
      "monthlyInternetEstimateSek": 319
    }
  },
  {
    "id": "demo-property-06",
    "address": "HemScope Demo Property 06",
    "city": "Göteborg",
    "area": "Gamlestaden",
    "purchasePriceSek": 2145000,
    "rooms": 1,
    "sizeSqm": 37,
    "monthlyAssociationFeeSek": 2864,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.73,
      "longitude": 12.0061
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 218,
      "monthlyInsuranceEstimateSek": 129,
      "monthlyInternetEstimateSek": 279
    }
  },
  {
    "id": "demo-property-07",
    "address": "HemScope Demo Property 07",
    "city": "Göteborg",
    "area": "Hisingen",
    "purchasePriceSek": 2595000,
    "rooms": 3,
    "sizeSqm": 81,
    "monthlyAssociationFeeSek": 6842,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.724,
      "longitude": 11.936
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 418,
      "monthlyInsuranceEstimateSek": 209,
      "monthlyInternetEstimateSek": 349
    }
  },
  {
    "id": "demo-property-08",
    "address": "HemScope Demo Property 08",
    "city": "Göteborg",
    "area": "Eriksberg",
    "purchasePriceSek": 4245000,
    "rooms": 2,
    "sizeSqm": 65,
    "monthlyAssociationFeeSek": 5267,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.7045,
      "longitude": 11.9168
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 312,
      "monthlyInsuranceEstimateSek": 175,
      "monthlyInternetEstimateSek": 299
    }
  },
  {
    "id": "demo-property-09",
    "address": "HemScope Demo Property 09",
    "city": "Göteborg",
    "area": "Frölunda",
    "purchasePriceSek": 1895000,
    "rooms": 2,
    "sizeSqm": 54,
    "monthlyAssociationFeeSek": 5793,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.6542,
      "longitude": 11.9107
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 298,
      "monthlyInsuranceEstimateSek": 155,
      "monthlyInternetEstimateSek": 329
    }
  },
  {
    "id": "demo-property-10",
    "address": "HemScope Demo Property 10",
    "city": "Göteborg",
    "area": "Högsbo",
    "purchasePriceSek": 2745000,
    "rooms": 3,
    "sizeSqm": 74,
    "monthlyAssociationFeeSek": 6128,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.6705,
      "longitude": 11.9332
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 386,
      "monthlyInsuranceEstimateSek": 195,
      "monthlyInternetEstimateSek": 309
    }
  },
  {
    "id": "demo-property-11",
    "address": "HemScope Demo Property 11",
    "city": "Mölndal",
    "area": "Mölndal",
    "purchasePriceSek": 3495000,
    "rooms": 4,
    "sizeSqm": 91,
    "monthlyAssociationFeeSek": 6584,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.6592,
      "longitude": 12.01
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 465,
      "monthlyInsuranceEstimateSek": 229,
      "monthlyInternetEstimateSek": 349
    }
  },
  {
    "id": "demo-property-12",
    "address": "HemScope Demo Property 12",
    "city": "Göteborg",
    "area": "Linné",
    "purchasePriceSek": 6985000,
    "rooms": 4,
    "sizeSqm": 103,
    "monthlyAssociationFeeSek": 3946,
    "propertyType": "apartment",
    "location": {
      "latitude": 57.6961,
      "longitude": 11.9536
    },
    "costProfile": {
      "monthlyElectricityEstimateSek": 492,
      "monthlyInsuranceEstimateSek": 249,
      "monthlyInternetEstimateSek": 379
    }
  }
] satisfies Property[];


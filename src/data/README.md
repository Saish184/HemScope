# Demo dataset and provenance

These are synthetic training/demo properties calibrated against publicly available Göteborg market observations. They are not live listings.

## Scope and calibration

12 apartment/bostadsrätt examples across Linné, Majorna, Johanneberg, Kålltorp, Gamlestaden, Hisingen, Eriksberg, Frölunda, Högsbo, and Mölndal. Mölndal is a neighboring municipality included deliberately in the broader Göteborg demo. Property coordinates are manually chosen plausible placements, not actual residential addresses or verified buildings.

[Svensk Mäklarstatistik Göteborg](https://www.maklarstatistik.se/omrade/riket/vastra-gotalands-lan/goteborg/), updated 8 September 2026 and checked 19 September 2026: bostadsrätter at 51,656 SEK/m² over 12 months, 52,402 SEK/m² over three months, and 3,285,000 SEK mean sale price over 12 months.

The brief's six Hemnet examples (Majorna twice, Johanneberg, Centrala Hisingen, Kålltorp, Eriksberg) provide additional user-supplied calibration, especially fees around 4,427–5,285 SEK/month. These individual sales were not independently reverified and no listing was copied.

Synthetic prices range from 1,895,000 to 6,985,000 SEK; price/m² ranges approximately 32,037–67,816. Mean price is approximately 3,509,167 SEK. This deliberately varied sample is not a statistical representation of the market. Lower values in Frölunda/Hisingen/Högsbo and higher central/Eriksberg values provide comparison scenarios. Fees range from 2,864 to 6,842 SEK/month; deliberate high-fee and low-fee examples widen the supplied references. Demo 01 versus 07 contrasts purchase price and fee; demo 06 offers a small apartment close to the Gamlestaden reference point; demo 05 has sparser coverage in this POI sample.

Electricity (218–492), insurance (129–249), and internet (279–379 SEK/month) are illustrative monthly assumptions, not researched tariffs or financial outputs. They assume these costs are charged separately from the association fee. A future engine must handle included services and missing profiles explicitly to avoid double counting. No interest, mortgage, amortization, total monthly cost, or proximity result is stored.

## Geographic reference sources

19 POIs: 5 shopping and 14 public transport. Only the existing two categories are used; grocery retail is included under broad shopping. Points represent a stop position, building, or shopping area, not necessarily an entrance. Do not infer routes, current service availability, or frequency from these points.

The first ten coordinates are the verified reference inputs supplied in the task, retained without alteration; their original external source URLs were not supplied. The remaining nine were checked against the linked public geographic pages on 19 September 2026.

| ID | Name | Latitude | Longitude | Source |
| --- | --- | --- | --- | --- |
| nordstan | Nordstan | 57.70862 | 11.96912 | Task-supplied verified reference |
| centralstation | Göteborg Centralstation | 57.70858 | 11.9733 | Task-supplied verified reference |
| linneplatsen | Linnéplatsen tram stop | 57.69013 | 11.95205 | Task-supplied verified reference |
| marklandsgatan | Marklandsgatan tram stop | 57.67486 | 11.93685 | Task-supplied verified reference |
| korsvagen | Korsvägen | 57.696625 | 11.986909 | Task-supplied verified reference |
| gamlestaden | Gamlestaden | 57.729148 | 12.004411 | Task-supplied verified reference |
| frolunda-torg | Frölunda Torg | 57.65174 | 11.91278 | Task-supplied verified reference |
| sannaplan | Sannaplan | 57.68434 | 11.91679 | Task-supplied verified reference |
| vagnhallen-majorna | Vagnhallen Majorna | 57.68898 | 11.91269 | Task-supplied verified reference |
| wieselgrensplatsen-shopping | Wieselgrensplatsen / Willys shopping area | 57.72152 | 11.93739 | Task-supplied verified reference |
| chalmers | Chalmers tram stop | 57.69002 | 11.97309 | [Geographic reference](https://mapcarta.com/N1752632594) |
| jarntorget | Järntorget tram stop | 57.7002 | 11.95262 | [Geographic reference](https://mapcarta.com/N60142086) |
| coop-backaplan | Stora Coop Backaplan | 57.7233 | 11.9544 | [Geographic reference](https://mapcarta.com/N1184106551) |
| molndal-station | Mölndal railway stop | 57.6559 | 12.01863 | [Geographic reference](https://mapcarta.com/17728590) |
| molndal-galleria | Mölndal Galleria | 57.65493 | 12.01359 | [Geographic reference](https://mapcarta.com/W657874085) |
| stigbergstorget | Stigbergstorget tram stop | 57.699031 | 11.933889 | [Geographic reference](https://commons.wikimedia.org/wiki/Category:Stigbergstorget_tram_stop) |
| masthuggstorget | Masthuggstorget tram stop | 57.69933 | 11.94267 | [Geographic reference](https://mapcarta.com/N1691294724) |
| olskrokstorget | Olskrokstorget tram stop | 57.71465 | 11.99937 | [Geographic reference](https://mapcarta.com/N1331318533) |
| hjalmar-brantingsplatsen | Hjalmar Brantingsplatsen | 57.7206 | 11.95326 | [Geographic reference](https://mapcarta.com/N96546390) |

Stigbergstorget's source gives 57°41′56.51″N, 11°56′02″E, converted to decimal degrees and rounded to six decimals. Chalmers uses the separately sourced tram-stop position; the supplied university coordinate is not relabeled as public transport.

Additional geographic data is based on OpenStreetMap contributors via Mapcarta, except the Stigbergstorget Wikimedia Commons reference. [OpenStreetMap attribution and ODbL](https://www.openstreetmap.org/copyright). Links are provenance only: the application makes no runtime requests.

## Model boundaries and limitations

- Property.location is Coordinates; Location is a named, categorized POI extending Coordinates.
- Property.costProfile optionally embeds PropertyCostProfile. No separate ID registry is needed yet. Missing profiles are unknown, not zero.
- BuyerProfile remains down payment and annual assumed interest rate only.
- SearchIntent.hardConstraints.maximumWalkingTimeMinutes remains a user requirement for future routing. A geodesic engine cannot claim to satisfy it or convert distance into actual walking time; candidate retrieval rejects this unsupported constraint.
- A future distance threshold should use an explicit meter-based contract; do not silently reinterpret the walking-time field.
- Nearest means nearest among these sampled POIs, not necessarily nearest in the real world. Sparse coverage, especially east Göteborg and Eriksberg, must not be described as a real absence of amenities.
- Straight-line distance can cross water, highways, and other barriers. It is not walking distance.
- Data lives in the requested src/data folder; existing app, types, and domain directories stay at the root. No application migration is implied.
- No UI integration, financial/location engine, database, or runtime service is introduced.

## Checks

Run `node --test tests/demo-data.test.mjs` on Node 24 (native TypeScript stripping), `npm run lint`, and `npm run build`. Both arrays use TypeScript `satisfies` checks against their domain contracts.

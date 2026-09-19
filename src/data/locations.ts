import type { Location } from "../../types/location";

/**
 * Representative geographic reference points, not a complete amenity inventory.
 * Coordinates are WGS84 decimal degrees; no proximity or walking time is stored.
 * Source details and attribution are recorded in ./README.md.
 */
export const locations = [
  // User-supplied verified reference coordinate; see README.md.
  {"id":"nordstan","name":"Nordstan","type":"shopping","latitude":57.70862,"longitude":11.96912},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"centralstation","name":"Göteborg Centralstation","type":"public_transport","latitude":57.70858,"longitude":11.9733},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"linneplatsen","name":"Linnéplatsen tram stop","type":"public_transport","latitude":57.69013,"longitude":11.95205},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"marklandsgatan","name":"Marklandsgatan tram stop","type":"public_transport","latitude":57.67486,"longitude":11.93685},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"korsvagen","name":"Korsvägen","type":"public_transport","latitude":57.696625,"longitude":11.986909},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"gamlestaden","name":"Gamlestaden","type":"public_transport","latitude":57.729148,"longitude":12.004411},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"frolunda-torg","name":"Frölunda Torg","type":"shopping","latitude":57.65174,"longitude":11.91278},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"sannaplan","name":"Sannaplan","type":"public_transport","latitude":57.68434,"longitude":11.91679},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"vagnhallen-majorna","name":"Vagnhallen Majorna","type":"public_transport","latitude":57.68898,"longitude":11.91269},
  // User-supplied verified reference coordinate; see README.md.
  {"id":"wieselgrensplatsen-shopping","name":"Wieselgrensplatsen / Willys shopping area","type":"shopping","latitude":57.72152,"longitude":11.93739},
  // https://mapcarta.com/N1752632594
  {"id":"chalmers","name":"Chalmers tram stop","type":"public_transport","latitude":57.69002,"longitude":11.97309},
  // https://mapcarta.com/N60142086
  {"id":"jarntorget","name":"Järntorget tram stop","type":"public_transport","latitude":57.7002,"longitude":11.95262},
  // https://mapcarta.com/N1184106551
  {"id":"coop-backaplan","name":"Stora Coop Backaplan","type":"shopping","latitude":57.7233,"longitude":11.9544},
  // https://mapcarta.com/17728590
  {"id":"molndal-station","name":"Mölndal railway stop","type":"public_transport","latitude":57.6559,"longitude":12.01863},
  // https://mapcarta.com/W657874085
  {"id":"molndal-galleria","name":"Mölndal Galleria","type":"shopping","latitude":57.65493,"longitude":12.01359},
  // https://commons.wikimedia.org/wiki/Category:Stigbergstorget_tram_stop
  {"id":"stigbergstorget","name":"Stigbergstorget tram stop","type":"public_transport","latitude":57.699031,"longitude":11.933889},
  // https://mapcarta.com/N1691294724
  {"id":"masthuggstorget","name":"Masthuggstorget tram stop","type":"public_transport","latitude":57.69933,"longitude":11.94267},
  // https://mapcarta.com/N1331318533
  {"id":"olskrokstorget","name":"Olskrokstorget tram stop","type":"public_transport","latitude":57.71465,"longitude":11.99937},
  // https://mapcarta.com/N96546390
  {"id":"hjalmar-brantingsplatsen","name":"Hjalmar Brantingsplatsen","type":"public_transport","latitude":57.7206,"longitude":11.95326},
] satisfies Location[];


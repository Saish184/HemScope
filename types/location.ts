/** Geographic coordinates in decimal degrees (WGS84). */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type AmenityType = "shopping" | "public_transport";

/** A named point of interest, distinct from a property's coordinates. */
export interface Location extends Coordinates {
  id: string;
  name: string;
  type: AmenityType;
}

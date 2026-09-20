import type { SearchIntent } from "../../types/search-intent";

type Kind = "number" | "city" | "amenities" | "boolean";
const fields = {
  hardConstraints: { city: "city", maximumPurchasePriceSek: "number", minimumRooms: "number", maximumMonthlyCashRequirementSek: "number", maximumWalkingTimeMinutes: "number" },
  locationPreferences: { desiredNearbyAmenities: "amenities" },
  financialPreferences: { availableDownPaymentSek: "number", preferredMonthlyCashRequirementSek: "number", assumedAnnualInterestRate: "number" },
  tradeOffPreferences: { willingToPayMoreForLocation: "boolean" },
} as const satisfies Record<keyof SearchIntent, Record<string, Kind>>;

function fieldSchema(kind: Kind) {
  if (kind === "number") return { type: ["number", "null"], minimum: 0 };
  if (kind === "city") return { type: ["string", "null"] };
  if (kind === "boolean") return { type: ["boolean", "null"] };
  return { type: ["array", "null"], items: { type: "string", enum: ["shopping", "public_transport"] } };
}

/** Strict API schema uses nullable required fields; normalization omits unknowns. */
export const intentSchema = {
  type: "object",
  additionalProperties: false,
  required: Object.keys(fields),
  properties: Object.fromEntries(Object.entries(fields).map(([section, entries]) => [section, {
    type: ["object", "null"], additionalProperties: false,
    required: Object.keys(entries),
    properties: Object.fromEntries(Object.entries(entries).map(([key, kind]) => [key, fieldSchema(kind)])),
  }])),
};

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid intent: ${path} must be an object.`);
  return value as Record<string, unknown>;
}

/** Validates untrusted JSON and returns a fresh, sparse SearchIntent. No defaults. */
export function validateSearchIntent(value: unknown): SearchIntent {
  const root = object(value, "root");
  const result: Record<string, Record<string, unknown>> = {};
  for (const section of Object.keys(root)) {
    if (!Object.hasOwn(fields, section)) throw new Error(`Invalid intent: unsupported section ${section}.`);
    if (root[section] === null) continue;
    const source = object(root[section], section);
    const allowed = fields[section as keyof typeof fields] as Record<string, Kind>;
    const target: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(source)) {
      if (!Object.hasOwn(allowed, key)) throw new Error(`Invalid intent: unsupported field ${section}.${key}.`);
      if (raw === null) continue;
      const kind = allowed[key];
      let normalized: unknown = raw;
      if (kind === "number" && (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0)) throw new Error(`Invalid intent: ${key} must be a finite nonnegative number.`);
      if (kind === "boolean" && typeof raw !== "boolean") throw new Error(`Invalid intent: ${key} must be boolean.`);
      if (kind === "city") {
        if (typeof raw !== "string" || !raw.trim()) throw new Error("Invalid intent: city must be nonempty text.");
        const city = raw.trim().normalize("NFC");
        normalized = ["gothenburg", "göteborg"].includes(city.toLowerCase()) ? "Göteborg" : city;
      }
      if (kind === "amenities") {
        if (!Array.isArray(raw) || !raw.every((item) => item === "shopping" || item === "public_transport")) throw new Error("Invalid intent: unsupported amenity value.");
        normalized = [...new Set(raw)];
      }
      target[key] = normalized;
    }
    if (Object.keys(target).length) result[section] = target;
  }
  // Each field above has been checked against the closed SearchIntent shape.
  return result as SearchIntent;
}

export function parseIntentJson(text: string): SearchIntent {
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error("Intent parser returned malformed JSON."); }
  return validateSearchIntent(value);
}

export function validateUserMessage(message: string): string {
  if (typeof message !== "string" || !message.trim()) throw new Error("userMessage must be nonempty text.");
  if (message.length > 10_000) throw new Error("userMessage exceeds the 10,000 character limit.");
  return message.trim();
}

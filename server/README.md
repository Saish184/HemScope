# Server functionality

Future database access, external integrations, and application orchestration belong here. Keep these modules out of client components; use `import "server-only"` when introducing server implementation files. Future HTTP endpoints belong in `app/api/<feature>/route.ts` and should delegate to this layer and the deterministic domain modules.

AI may interpret language and explain validated results. Validate its structured output before using it. Queries, filtering, calculations, comparisons, and validation must remain deterministic software. No integrations or endpoints are implemented yet.

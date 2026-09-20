# Server functionality

Future database access, external integrations, and application orchestration belong here. Keep these modules out of client components; use `import "server-only"` when introducing server implementation files. Future HTTP endpoints belong in `app/api/<feature>/route.ts` and should delegate to this layer and the deterministic domain modules.

The server-only AI intent parser in `ai/intent-parser.ts` interprets language into a validated SearchIntent using the OpenAI SDK. See `ai/README.md` for environment setup and limitations. Queries, filtering, calculations, comparisons, and validation remain deterministic software. No endpoints or AI explanations are implemented yet.

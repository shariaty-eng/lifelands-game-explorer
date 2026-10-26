# Lifelands Game Explorer

A Persian (RTL) Game Explorer built as a frontend technical assignment for Lifelands. The section fetches games from the live API, lets users search and filter the loaded games, sort results, save favorites, and share the current view through URL query parameters.

## Links

- **Repository:** `GITHUB_REPOSITORY_URL`
- **Live demo:** `DEPLOYED_URL`

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript (`strict: true`)
- Tailwind CSS
- Vitest + jsdom
- Zod (server-side API validation)
- Native browser APIs: `URLSearchParams`, `AbortController`, `localStorage`

Exact versions are in `package.json`.

## Features

- Initial page of games fetched in a Server Component.
- Persian text normalization before matching: Arabic/Persian yeh and kaf normalization, Persian/Arabic digit conversion, ZWNJ/ZWJ removal, whitespace normalization, and trimming.
- Client-side, 300 ms debounced search over game title and company name.
- Multi-select vendor filters and category filtering.
- A landscape-only filter (extra filter required by Task 6.3), rendered from `FILTER_CONFIG`.
- Sorting by supported numeric game fields and a derived quality score.
- Favorites stored in `localStorage`, including a favorites-only filter.
- Query-string state for search, filters, and sorting.
- Load-more pagination using the API's page-based response, with deduplication and `AbortController` cancellation.
- Responsive RTL layout, explicit image dimensions, image fallback, visible keyboard focus, and empty/error states.
- Unit tests for normalization, filtering, quality scoring, filter-state parsing, and favorites.

## Getting started

Requirements: Node.js 20+ and npm.

```bash
git clone GITHUB_REPOSITORY_URL
cd lifelands-game-explorer
npm install
npm run dev
```

### Useful scripts

```bash
npm run test
npm run lint
npm run build
```

## API and data flow

The upstream API is:

```text
GET https://lifelands.ir/api/v1/games?pageId=1
```

The server fetches the first page directly via lib/api.ts. The client requests additional pages through the local /api/games route handler, which acts as a same-origin proxy. The browser never calls the upstream Lifelands API directly.

The observed API response includes pageId, eachPerPage, searchValue, total, and games. The sample response reported total: 728 and eachPerPage: 12.

Search scope: The upstream API does not expose a documented server-side search parameter. Search is therefore applied client-side to the games currently loaded in the browser. A shared search URL restores the search text and filters, but matching is limited to the pages that have been loaded so far. Users can load more pages to broaden the search. This is an intentional, documented limitation.

## Architecture

### Server Components

- app/layout.tsx: document metadata, RTL direction, fonts, shared layout.

- app/page.tsx: server entry point; fetches the initial page via lib/api.ts and renders the structure.

- components/HeroSection.tsx: static introductory content.

- components/GameGridSkeleton.tsx: loading placeholder rendered by the component-level Suspense boundary.

### Client Components

- components/GameExplorer.tsx: coordinates interactive search, filtering, sorting, favorites, and load-more behavior. Uses parseFilterMode to derive sort state from the URL and useUrlStateBatch for atomic multi-parameter URL updates.

- components/FilterBar.tsx: renders search, sort, vendor, category, favorites-only, and landscape-only controls. Vendor options and category group come from FILTER_CONFIG.

- components/SearchInput.tsx: accessible search input.

- components/SortSelect.tsx: sorting controls.

- components/GameCard.tsx: individual game card and favorite interaction.

- components/EmptyState.tsx and components/LoadMoreButton.tsx: interactive states and pagination controls.

### Hooks and pure logic

- hooks/useDebounce.ts: debounces rapidly changing values.

- hooks/useUrlState.ts: reads and writes query-string state. useUrlStateBatch performs atomic multi-parameter updates.

- hooks/useFavorites.ts: persists favorite IDs in local storage.

- hooks/useGamesQuery.ts: loads additional pages, deduplicates by \_id, cancels superseded requests with AbortController, and computes hasMore from pagination metadata.

- lib/api.ts: server-side fetch and Zod validation of the API envelope and game data.

- lib/normalize.ts: pure Persian text normalization.

- lib/filter.ts: pure filtering, category collection, and sorting.

- lib/filter-state.ts: pure parseFilterMode from URLSearchParams to the FilterMode union.

- lib/filter-config.ts: FILTER_CONFIG array describing vendor, category, and landscape filters.

- lib/quality.ts: derived quality score.

- lib/image.ts: resolves image paths and card dimensions.

- types/game.ts: API and domain types, Vendor union, and isVendor type guard.

- lib/ is independent of React and tested in isolation.

## Design decisions and trade-offs

### Load more instead of numbered pagination

Load-more lets users explore further games without leaving the current view. Additional requests are page-based, deduplicated by \_id, and use AbortController to cancel superseded requests. hasMore is computed as currentPage \* eachPerPage < total, which is more robust than comparing the current array length to total when responses are partial or metadata changes.

### URL state

Search, vendor selection, category, sort key, sort direction, favorites-only mode, and landscape-only mode are represented in query parameters, so a view can be bookmarked and shared. Back/forward navigation restores the visible controls and results.

A custom useUrlState is retained because the assignment explicitly asks for it. In a production application I would prefer nuqs for typed parsers, optimistic local state, and debounced URL updates. The custom hook includes useUrlStateBatch for atomic updates of multiple parameters (used by the clear-filters action), which avoids navigation races between concurrent setters.

### Persian normalization

Text is normalized before comparison so visually equivalent Persian and Arabic characters match consistently. Digits are converted to Latin digits, joiner characters are removed, and whitespace is collapsed. This normalization is used for matching only, not for changing displayed text.

### Vendor types

The API returns vendor values as strings, so vitrinThirdPartyVendors remains string[] — this avoids falsely claiming the API can only return known vendors. A separate Vendor union and isVendor type guard define the vendors the UI explicitly supports. This separates untrusted external data from the application's supported filter options.

### Discriminated filter state

FilterMode is a discriminated union:

```ts
type FilterMode =
  | { mode: "search"; query: string }
  | { mode: "sort"; sortKey: SortKey; direction: "asc" | "desc" };
```

parseFilterMode(searchParams) in lib/filter-state.ts parses the URL into this union. In GameExplorer, parseFilterMode is used to derive sortKey and sortDir. TypeScript rejects invalid combinations at compile time — for example, an object literal with mode: "search" cannot also carry sortKey. Invalid sort values from the URL are normalized to quality.

### Config-driven filters

FILTER_CONFIG in lib/filter-config.ts describes the vendor (multi-select), category (single-select), and landscape (boolean) filters. FilterBar renders vendor options and the category group from this configuration. Adding a new filter means editing FILTER_CONFIG and the generic filter logic in lib/filter.ts. The landscape-only filter was added specifically to demonstrate this and is documented here as the extra filter required by Task 6.3.

### Server revalidation and Suspense

The initial fetch uses next: { revalidate: 300 } (5 minutes). This balances reducing upstream requests and keeping the catalogue reasonably fresh — the game catalogue changes infrequently (new games appear every few days).

The component-level <Suspense> boundary around the asynchronous games section lets the static hero render independently while the games section waits for data. loading.tsx is not used: a route-segment-level loading UI would replace the whole segment (including the hero), which is broader than necessary. A component-level boundary is more targeted.

### Quality score

The quality score is a documented heuristic, not an API fact:

```text
quality =
0.5 * clamp(score / 5, 0, 1) +
0.3 * clamp(rating, 0, 1) +
0.2 * clamp(log10(1 + like) / log10(1 + 1000), 0, 1)
```

score is on a 0–5 scale and rating is already in 0–1. MAX_LIKE = 1000 compresses the long-tail like distribution logarithmically. level is intentionally excluded because it represents game difficulty/level, not quality. Weights (0.5/0.3/0.2) prioritize score (closest to perceived quality), then rating (engagement), then like (popularity, noisier).

### Empty vendor arrays

Games with an empty vendor array are placed in a separate «نامشخص» filter bucket. This avoids silently hiding valid games while preserving the meaning of selecting a specific vendor. Users explicitly include games without a known vendor by selecting that bucket.

### total versus eachPerPage

games.length < total alone is unreliable: duplicate pages, partial responses, changing totals, or unexpected page sizes can make it inaccurate. Appended games are deduplicated by \_id, and hasMore uses currentPage \* eachPerPage < total. Inconsistent metadata is handled defensively without crashing.

### Race safety

AbortController is used because a newer page request should cancel an older in-flight request. Only the currently active controller updates loading state, AbortError is ignored, and the controller is aborted on unmount. This was chosen over a request-ID guard because it cancels the network request itself rather than just ignoring the response.

### Runtime API validation

The raw API response is validated at runtime with Zod in lib/api.ts (server-only, so it does not enter the client bundle). The ApiEnvelopeSchema validates { state, data }, and PaginatedGamesSchema validates the game data. A compile-time \_SchemaCheck type assertion ensures the Zod schema and the PaginatedGames interface stay in sync. The manual isVendor type guard is kept (Task 5.2) and is not replaced by Zod.

## TypeScript decisions

Vendor union (Task 5.2): Vendor = "soroush" | "rubika" plus isVendor(value): value is Vendor. The raw field remains string[] to avoid type lies. See "Vendor types" above.

Discriminated filter state (Task 5.3): FilterMode union prevents invalid combinations at compile time. parseFilterMode is used in GameExplorer. See "Discriminated filter state" above.

Mapped sort keys (Task 5.4): NumericKeys<T> extracts numeric fields of Game; SortKey = GameNumericKey | "quality". sortGames accepts only valid keys.

Generic envelope (Task 5.1): ApiResponse<T> models { state, data }. PaginatedGames models the page shape. lib/api.ts returns a properly typed PaginatedGames.

## Accessibility and performance

Real <label> associated with the search input.

fieldset and legend group related filters; aria-pressed on toggle buttons.

Visible keyboard focus styles and logical tab order.

aria-live="polite" on the result count.

No custom dropdown is used, so custom Escape-to-close behavior is not applicable; native <select> retains browser keyboard behavior.

Derived filtering/sorting results are memoized. GameCard is memoized and receives stable props, so toggling one favorite does not re-render every card.

next/image with explicit dimensions and sizes; lazy loading below the fold; visible fallback for failed images without collapsing the card.

useCallback on handlers passed to memoized children.

## Testing

```bash
npm run test
```

The suite covers:

- Persian character and digit normalization.

- Search matching against title and company name.

- Vendor (including unspecified bucket), category, favorites-only, and landscape filtering.

- Sorting and quality-score boundaries.

- Favorites persistence and toggling.

- parseFilterMode parsing and invalid input normalization.

- Image URL resolution and card dimensions.

## Known limitations

Search scope: The upstream API does not expose a documented server-side search parameter. Search is applied to the loaded pages only. Shared search URLs restore the text but do not guarantee matching games outside the loaded pages. Users can load more pages to broaden the search.

Initial page is always page 1: app/page.tsx fetches pageId=1. Deep-linking directly to page 5 is not supported; users reach later pages via load-more.

Quality heuristic is subjective: The 0.5/0.3/0.2 weights and MAX_LIKE = 1000 are documented choices, not objective facts.

## AI usage disclosure

I used ChatGPT and Claude as assistance during development and review. I asked them to help analyze the assignment requirements, review the component and hook design, identify edge cases, suggest fixes, and draft implementation approaches and documentation.

AI-assisted review covered useUrlState concurrency, search debouncing, URL synchronization, useGamesQuery and AbortController, API response typing, Suspense and revalidation behavior, filter configuration, TypeScript unions, pagination metadata, accessibility, and performance.

I evaluated each suggestion against the assignment requirements and the observed API response. Specific decisions I made or verified myself:

- I kept vitrinThirdPartyVendors as string[] instead of Vendor[] because the external API may return vendor values the UI does not support. The Vendor union and isVendor guard are separate and used only in filter logic.

- I kept AbortController for cancellation instead of adding TanStack Query, because the assignment requires demonstrating race-safe asynchronous behavior with AbortController or a request-ID guard.

- I added useUrlStateBatch for atomic multi-parameter URL updates after identifying that concurrent individual setters caused navigation races.

- I chose nuqs as the preferred production tool for URL state but retained the custom useUrlState for assignment compliance.

- I treated the quality score as a documented heuristic and excluded level because it represents difficulty, not quality.

- I chose the «نامشخص» bucket for empty vendor arrays after weighing hiding vs. always-including, because it preserves filter meaning while not silently dropping valid games.

- I used Zod only in lib/api.ts (server-side) to keep validation out of the client bundle, while retaining the manual isVendor type guard for Task 5.2.

- I added the landscape-only filter through FILTER_CONFIG to demonstrate config-driven filters (Task 6.3).

- AI suggestions were starting points for investigation, not proof of correctness. I am responsible for the final code and for explaining its behavior and trade-offs during the technical review.

## Assignment decisions at a glance

| Requirement         | Approach                                                                            |
| ------------------- | ----------------------------------------------------------------------------------- |
| Initial fetch       | Server Component via lib/api.ts                                                     |
| Further pages       | Same-origin route handler and load-more                                             |
| Search              | Client-side normalization and 300 ms debounce; limited to loaded pages (documented) |
| URL state           | Custom useUrlState + useUrlStateBatch; nuqs preferred in production                 |
| Race safety         | AbortController, with stale-response protection                                     |
| Vendor values       | Raw string[] + Vendor union + isVendor guard                                        |
| Empty vendor array  | Explicit «نامشخص» bucket                                                            |
| Quality             | Documented weighted heuristic                                                       |
| Validation          | Zod schema server-side                                                              |
| Loading UI          | Component-level Suspense around the games section                                   |
| Extra filter        | Landscape-only via FILTER_CONFIG                                                    |
| Discriminated state | FilterMode parsed via parseFilterMode                                               |

## Rebuild prompt for another AI

The following prompt is a self-contained specification. If given to another AI coding assistant, it should be able to rebuild this project. It is included here so the implementation can be reproduced or audited.
You are rebuilding a frontend technical assignment: a "Game Explorer" section for a Persian (RTL) game platform called Lifelands. The section is one part of a page — not a full landing page — but the engineering inside it must be real, readable, and defensible.

## Tech stack (mandatory)

- Next.js 16 (App Router)
- React 19
- TypeScript with `strict: true`. No `any`, no `@ts-ignore`, no `as unknown as`.
- Styling: Tailwind CSS (or CSS Modules). RTL is mandatory.
- Tests: Vitest + jsdom. At minimum 3 tests for `normalizePersian` and 2 for `filterGames`.
- Server-side validation: Zod (server-only, not in the client bundle).
- Do not install a full UI kit or dashboard template. Do not copy the `Game` type from a tutorial — derive it from the real API response.

## API

`GET https://lifelands.ir/api/v1/games?pageId=1`

Response shape (observed):

```json
{
  "state": true,
  "data": {
    "pageId": 1,
    "eachPerPage": 12,
    "searchValue": "",
    "total": 728,
    "games": [ { "_id": "...", "title": "...", "image": "game/file-....webp", "companyName": "...", "category": { "title": "...", "categoryId": { "_id": "...", "title": "..." }, "_id": "..." }, "score": 4.6, "rating": 0.51, "level": 42, "like": 7, "seenCount": 7762, "runCount": 2076, "vitrinThirdPartyVendors": ["soroush", "rubika"], "isLandscape": true, "createdAtIso": "...", "updatedAtIso": "...", ... } ],
    "gamesWithoutConsole": [ ... ]
  }
}
```

Notes:

description is sometimes missing; type it as description?: string | null.

vitrinThirdPartyVendors is string[] in the raw response. Do not type it as a union — type lies. Keep the union separate.

The API does not expose a documented server-side search parameter. Search is client-side only on loaded pages.

#### Functional requirements

- Fetch the first page in a Server Component (App Router). No useEffect for initial load.

- Client-side search with 300 ms debounce over title and companyName.

Persian text normalization before matching (mandatory):

- Unify ی/ي and ک/ك

- Convert Persian/Arabic digits to Latin

- Remove ZWNJ (and ZWJ)

- Collapse whitespace and trim

- Filter by vitrinThirdPartyVendors (multi-select) and category.title.

- Sort by score, runCount, seenCount, like, and a derived quality.

- Favorites toggle persisted in localStorage. A favorites-only filter.

- URL as source of truth for search, filters, sort. Shared links restore exact state. Back/forward works.

- Loading & empty states. Skeleton on initial load, empty state with a recovery action.

- Load-more (not numbered pagination). Justify in README.

- Keyboard accessible. Tab order, visible focus rings. No custom dropdown — native <select>; so Escape-to-close is not applicable.

#### Critical requirements

- TypeScript strict: true. No any, @ts-ignore, as unknown as.

- Server Component for initial fetch. No useEffect-based initial load.

- A complete README.md with project explanation, tech stack, how to run, design decisions, TypeScript decisions, trade-offs, AI usage disclosure.

- No console.log in final code. No unused files, dead code, or commented-out blocks.

- Deployed link must work.

- Do not call the Lifelands API directly from the browser. Use a same-origin route handler or server proxy.

- Do not mark the whole page 'use client'. Only leaf interactivity.

- Do not skip normalization. Persian text handling is a core part of the task.

- Do not commit .env, API keys, or node_modules. Use .gitignore.

- Do not use setTimeout to "fix" race conditions. Use AbortController or a request-ID guard.

#### TypeScript tasks

5.1: Generic ApiResponse<T> = { state: boolean; data: T }. Define PaginatedGames and Game. Every consumed field typed. No any.

5.2: Vendor union + isVendor(value): value is Vendor type guard. Explain in README why plain string[] is insufficient.

5.3: FilterMode discriminated union:

```ts
type FilterMode =
  | { mode: "search"; query: string }
  | { mode: "sort"; sortKey: SortKey; direction: "asc" | "desc" };
```

Show that TypeScript rejects invalid combinations at compile time. Use parseFilterMode(searchParams): FilterMode in the actual code (not just define the type).

5.4: NumericKeys<T> mapped type extracting numeric fields of Game. SortKey = GameNumericKey | "quality". sortGames accepts only valid keys.

#### Engineering tasks

6.1: All filtering, sorting, normalization in lib/ with zero React imports. Unit-testable. At least 3 tests for normalizePersian, 2 for filterGames.

6.2: Hooks useDebounce<T>(value, delay): T, useUrlState<T>(key, defaultValue): [T, (v: T) => void], useFavorites(): { favorites: Set<string>; toggle: (id: string) => void }. Each usable in isolation. No hook imports another hook's internals.

6.3: Filters defined in a FILTER_CONFIG array (vendor, category, plus an extra filter you were not asked for — e.g. isLandscape). UI renders from this config. Adding a filter = editing one file. Note the extra filter in README.

6.4: Race-safe async with AbortController (preferred) or request-ID guard. Explain choice. Simulate a second-page fetch; if the user types or changes a filter while a fetch is in flight, the stale response must not overwrite fresh state.

#### Next.js tasks

7.1: Server Component fetches initial page. Pass to Client Component that owns interactivity. Do not mark the whole page 'use client'. In README, list exactly which components are Server Components and why.

7.2: Wrap the game list in <Suspense> with a skeleton fallback that matches final layout dimensions (no CLS). Do not add loading.tsx (explain difference between route-level and component-level streaming in README).

7.3: Choose a revalidate value for the server fetch. Justify in README. (Use 300 seconds — the catalogue changes infrequently.)

#### Problem-solving tasks

- 8.1: Resolve relative image path to full URL. Handle 404 with a visible fallback that does not break the card layout. Do not use onError that just hides the image.

- 8.2: Design a single "quality" heuristic blending score, rating, and like. Document the formula. Sort by it as one option. (Use: 0.5*clamp(score/5) + 0.3*clamp(rating) + 0.2\*(log10(1+like)/log10(1+MAX_LIKE)), MAX_LIKE = 1000. Exclude level — it represents difficulty, not quality.)

- 8.3: Empty vendor arrays — pick one of: included, excluded, or a separate "unspecified" bucket. Implement and justify in one paragraph. (Use a separate «نامشخص» bucket: **unspecified** value in the vendor filter. Selecting it shows games whose vendor array is empty. Do not hide valid games; do not pollute specific-vendor filters.)

- 8.4: total vs. eachPerPage. Detect discrepancy and handle without crashing load-more. (Deduplicate appended games by \_id; compute hasMore = currentPage \* eachPerPage < total; do not overwrite total on partial pages.)

#### Performance

- Memoize filtering/sorting results.

- Do not re-render the entire list when one favorite toggles (React.memo on GameCard, stable onToggleFavorite via useCallback).

- Debounce/throttle any scroll or resize handler.

- Images: next/image with explicit dimensions; lazy-load below-fold cards.

- Keep typing responsive.

#### Recommended file structure

```text
app/
layout.tsx (Server: RTL, font, metadata)
page.tsx (Server: fetch page 1, Suspense)
api/games/route.ts (Route handler proxy)
components/
HeroSection.tsx
GameGridSkeleton.tsx
GameExplorer.tsx (Client: interactive)
FilterBar.tsx (Client: renders from FILTER_CONFIG)
SearchInput.tsx
SortSelect.tsx
GameCard.tsx (Client: memo)
EmptyState.tsx
LoadMoreButton.tsx
hooks/
useDebounce.ts
useUrlState.ts (plus useUrlStateBatch for atomic multi-param updates)
useFavorites.ts
useGamesQuery.ts (AbortController, dedupe by _id, hasMore from metadata)
lib/
api.ts (server fetch + Zod validation)
normalize.ts
quality.ts
filter.ts
filter-state.ts (parseFilterMode)
filter-config.ts (FILTER_CONFIG)
image.ts
types/
game.ts

```

#### Deliverables

- GitHub repository link.

- Deployed link (Vercel or Netlify). Must work.

- README.md with: project explanation, tech stack with versions, how to run (git clone → npm install → npm run dev), design decisions (load-more vs pagination, URL state, normalization, revalidation), TypeScript decisions (vendor union, discriminated filter state, mapped sort keys, generic envelope), trade-offs & known limitations, AI usage disclosure (tools used, parts assisted, what you changed, what you rejected and why, what you wrote yourself).

#### AI usage rules

- Declare AI use explicitly. Undisclosed AI use is grounds for rejection.

- Copy-pasting AI output without understanding it is easy to detect in review.

- Using AI to learn and verify is a plus. Using AI to replace thinking is a red flag.

#### Bonus (optional, only if done well)

Unit tests for every pure function in lib/.

- Virtualized list for >50 items.

- Micro-interactions (hover, transitions, skeleton shimmer).

- Sound or haptic feedback on favorite toggle (respect prefers-reduced-motion).

- Storytelling narrative at the top of the section.

- Accessibility audit (Lighthouse score in README).

- Dark mode with proper contrast ratios.

- Persian typography attention (font stack, line-height, digit rendering).

- Error boundary around the game list with retry.

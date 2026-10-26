import { z } from "zod";
import type { PaginatedGames } from "@/types/game";

const GameCategoryRefSchema = z
  .object({
    _id: z.string(),
    title: z.string(),
  })
  .passthrough();

const GameCategorySchema = z
  .object({
    _id: z.string(),
    title: z.string(),
    categoryId: GameCategoryRefSchema,
  })
  .passthrough();

export const GameSchema = z
  .object({
    _id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    image: z.string(),
    companyName: z.string(),
    category: GameCategorySchema,
    score: z.number(),
    rating: z.number(),
    level: z.number(),
    like: z.number(),
    seenCount: z.number(),
    runCount: z.number(),
    vitrinThirdPartyVendors: z.array(z.string()),
    isLandscape: z.boolean(),
    createdAtIso: z.string(),
    updatedAtIso: z.string(),
  })
  .passthrough();

export const PaginatedGamesSchema = z
  .object({
    pageId: z.number().int().positive(),
    eachPerPage: z.number().int().positive(),
    searchValue: z.string(),
    total: z.number().int().nonnegative(),
    games: z.array(GameSchema),
    gamesWithoutConsole: z.array(z.unknown()).optional(),
  })
  .passthrough();

const ApiEnvelopeSchema = z
  .object({
    state: z.boolean(),
    data: z.unknown(),
  })
  .passthrough();

type _SchemaCheck =
  z.infer<typeof PaginatedGamesSchema> extends PaginatedGames ? true : never;
const _schemaCheck: _SchemaCheck = true;
void _schemaCheck;

export class ApiRequestError extends Error {
  public readonly status: number;

  constructor(message: string, status: number = 502) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

const API_BASE = "https://lifelands.ir/api/v1";

export async function fetchGamesPage(pageId: number): Promise<PaginatedGames> {
  if (!Number.isInteger(pageId) || pageId < 1) {
    throw new ApiRequestError("Invalid pageId", 400);
  }

  const response = await fetch(`${API_BASE}/games?pageId=${pageId}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new ApiRequestError(`Upstream API returned ${response.status}`, 502);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiRequestError("Upstream API returned invalid JSON", 502);
  }

  const envelope = ApiEnvelopeSchema.safeParse(body);
  if (!envelope.success) {
    throw new ApiRequestError("Invalid API response envelope", 502);
  }
  if (!envelope.data.state) {
    throw new ApiRequestError("Upstream API reported failure", 502);
  }

  const result = PaginatedGamesSchema.safeParse(envelope.data.data);
  if (!result.success) {
    throw new ApiRequestError("Invalid games data structure", 502);
  }

  return result.data as PaginatedGames;
}

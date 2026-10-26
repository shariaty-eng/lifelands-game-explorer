import { NextRequest, NextResponse } from "next/server";
import { ApiRequestError, fetchGamesPage } from "@/lib/api";

export async function GET(request: NextRequest) {
  const rawPageId = request.nextUrl.searchParams.get("pageId") ?? "1";
  const pageId = Number(rawPageId);

  if (!Number.isInteger(pageId) || pageId < 1) {
    return NextResponse.json(
      { state: false, message: "Invalid pageId", data: null },
      { status: 400 },
    );
  }

  try {
    const data = await fetchGamesPage(pageId);
    return NextResponse.json({ state: true, data }, { status: 200 });
  } catch (error) {
    const status = error instanceof ApiRequestError ? error.status : 500;
    return NextResponse.json(
      { state: false, message: "Unable to fetch games", data: null },
      { status },
    );
  }
}

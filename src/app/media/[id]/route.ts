import { NextRequest } from "next/server";

function upstreamMediaUrl(id: string): string {
  const raw =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/v1.0/trading-journal/web";
  const base = raw.replace(/\/$/, "").replace(/\/admin$/, "/web");
  return `${base}/media/${id}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const upstream = await fetch(upstreamMediaUrl(params.id), {
    cache: "force-cache",
  });
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: upstream.status || 404 });
  }
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(upstream.body, { status: 200, headers });
}

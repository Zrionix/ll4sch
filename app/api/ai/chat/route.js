const AI_ORIGIN = process.env.AI_ORIGIN || "https://monitor.ll4sch.com";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  const body = await request.text();
  try {
    const res = await fetch(`${AI_ORIGIN}/api/ai/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      cache: "no-store",
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    return Response.json({ ok: false, error: err.message || "AI chat unreachable" }, { status: 502 });
  }
}

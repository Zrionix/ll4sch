const AI_ORIGIN = process.env.AI_ORIGIN || "https://monitor.ll4sch.com";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${AI_ORIGIN}/api/ai/status`, { cache: "no-store" });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    return Response.json({ ok: false, error: err.message || "AI status unreachable" }, { status: 502 });
  }
}

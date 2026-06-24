import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  if (!body.token) {
    return Response.json({ error: "Token required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("auth_token", body.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days — matches backend JWT expiry
    path: "/",
  });

  return Response.json({ ok: true });
}

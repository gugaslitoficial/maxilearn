import { cookies } from "next/headers";
import { decodeJwt } from "jose";

interface JwtPayload {
  sub: string;
  role: string;
  companyId: string;
  exp?: number;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return Response.json({ error: "No session" }, { status: 401 });
  }

  try {
    const payload = decodeJwt(token) as JwtPayload;

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return Response.json({ error: "Session expired" }, { status: 401 });
    }

    return Response.json({
      userId: payload.sub,
      role: payload.role,
      companyId: payload.companyId,
      accessToken: token,
    });
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}

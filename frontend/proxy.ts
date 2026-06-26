import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

type Role = "ADMIN" | "PROFESSOR" | "STUDENT";

interface JwtPayload {
  sub: string;
  role: Role;
  companyId: string;
  exp?: number;
}

const AUTH_PAGES = ["/login", "/cadastro"];
const PUBLIC_PATHS = ["/", "/recuperar-senha"];

function tryDecodeToken(token: string): JwtPayload | null {
  try {
    const payload = decodeJwt(token) as JwtPayload;
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function roleHome(role: Role): string {
  switch (role) {
    case "ADMIN": return "/dashboard";
    case "PROFESSOR": return "/professor/dashboard";
    case "STUDENT": return "/aluno/dashboard";
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow certificates validation (public)
  if (pathname.startsWith("/certificates/validate")) return NextResponse.next();

  // Always allow root and other fully public paths
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const token = request.cookies.get("auth_token")?.value;
  const payload = token ? tryDecodeToken(token) : null;
  const isAuthenticated = !!payload;

  // Auth pages: redirect authenticated users to their home
  if (AUTH_PAGES.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(roleHome(payload!.role), request.url));
    }
    return NextResponse.next();
  }

  // All remaining routes require authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access: redirect users who access the wrong area
  const isProfessorRoute = pathname === "/professor" || pathname.startsWith("/professor/");
  const isStudentRoute = pathname === "/aluno" || pathname.startsWith("/aluno/");

  if (isProfessorRoute && payload!.role !== "PROFESSOR") {
    return NextResponse.redirect(new URL(roleHome(payload!.role), request.url));
  }
  // ADMIN and PROFESSOR can access /aluno/ routes to preview as student — no block here
  // Admin routes (everything else): only ADMIN can access
  if (!isProfessorRoute && !isStudentRoute && payload!.role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(payload!.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|.*\\.png$|.*\\.ico$|.*\\.svg$).*)"],
};

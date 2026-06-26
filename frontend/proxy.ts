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

// Routes accessible by any authenticated user (shared across roles)
const SHARED_AUTH_PREFIXES = ["/notificacoes", "/perfil"];

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

  // Always allow: certificate validation (backend route) + /validar/:code (frontend route)
  if (pathname.startsWith("/certificates/validate") || pathname.startsWith("/validar/")) {
    return NextResponse.next();
  }

  // Fully public paths
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

  const role = payload!.role;

  // Shared routes: any authenticated user can access
  if (SHARED_AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const isProfessorRoute = pathname === "/professor" || pathname.startsWith("/professor/");
  const isStudentRoute = pathname === "/aluno" || pathname.startsWith("/aluno/");
  const isCursoPreview = pathname === "/curso" || pathname.startsWith("/curso/");

  // /professor/* — PROFESSOR only; others go to their home
  if (isProfessorRoute && role !== "PROFESSOR") {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  // /aluno/* — STUDENT home; ADMIN and PROFESSOR can access to preview
  // No block here — intentional

  // /curso/* — preview route for ADMIN and PROFESSOR only
  // STUDENT is redirected to /aluno/curso/:id
  if (isCursoPreview) {
    if (role === "STUDENT") {
      const courseId = pathname.split("/")[2];
      const target = courseId ? `/aluno/curso/${courseId}` : "/aluno/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // All other routes are admin-area routes (/, /dashboard, /cursos, /usuarios, etc.)
  // Only ADMIN can access; others go to their home
  if (!isProfessorRoute && !isStudentRoute && !isCursoPreview && role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|.*\\.png$|.*\\.ico$|.*\\.svg$).*)"],
};

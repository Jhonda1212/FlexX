import { NextResponse, type NextRequest } from "next/server";
import { canRoleAccessPath, getServerUser, getServerUserAndRole, isProtectedRoute, matchesRoutePrefix } from "@/lib/auth/server-role";
import { createMiddlewareSupabase } from "@/lib/supabase/server";

function redirectWithCookies(request: NextRequest, response: NextResponse, pathname: string) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) return NextResponse.next();

  const response = NextResponse.next({ request });
  const supabase = createMiddlewareSupabase(request, response);
  const isUserArea = matchesRoutePrefix(pathname, ["/app"]);
  const { user, role } = isUserArea
    ? { ...(await getServerUser(supabase)), role: null }
    : await getServerUserAndRole(supabase);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  if (!canRoleAccessPath(pathname, role)) {
    return redirectWithCookies(request, response, "/unauthorized");
  }

  return response;
}

export const config = {
  matcher: [
    "/app/:path*",
    "/admin/:path*",
    "/guard/:path*",
    "/storage/:path*"
  ]
};

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [name, value] of Object.entries(securityHeaders)) response.headers.set(name, value);
  return response;
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return withSecurityHeaders(NextResponse.redirect(url));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiresAdmin = pathname.startsWith("/admin");
  const requiresUser = requiresAdmin || pathname.startsWith("/account");
  if (!requiresUser) return withSecurityHeaders(NextResponse.next());

  if (!env.isSupabaseConfigured) {
    const role = request.cookies.get("ag_role")?.value;
    const session = request.cookies.get("ag_session")?.value;
    if (!session || (requiresAdmin && role !== "ADMIN")) return redirectToLogin(request);
    // ag_role is only an early routing hint. Server actions use getCurrentUser()
    // and requireAdmin() to verify the session against the local store.
    return withSecurityHeaders(NextResponse.next());
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return redirectToLogin(request);
  let response = NextResponse.next({ request });
  const client = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        for (const { name, value } of cookies) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookies) response.cookies.set(name, value, options);
      },
    },
  });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return redirectToLogin(request);
  if (requiresAdmin) {
    const { data: profile } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "ADMIN") return redirectToLogin(request);
  }
  return withSecurityHeaders(response);
}

export const config = {
  // Run for application routes, but leave Next internals and public image assets
  // alone so placeholder and locally uploaded card images are served directly.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|placeholders/|uploads/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|css|js|map)$).*)",
  ],
};

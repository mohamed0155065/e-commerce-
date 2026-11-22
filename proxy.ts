import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function getLocale(pathname: string) {
  const firstSegment = pathname.split("/")[1];
  return routing.locales.includes(firstSegment as (typeof routing.locales)[number])
    ? firstSegment
    : routing.defaultLocale;
}

function stripLocale(pathname: string, locale: string) {
  if (pathname === `/${locale}`) return "/";
  return pathname.startsWith(`/${locale}/`)
    ? pathname.slice(locale.length + 1)
    : pathname;
}

function localizedPath(pathname: string, locale: string) {
  return locale === routing.defaultLocale
    ? pathname
    : `/${locale}${pathname === "/" ? "" : pathname}`;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = handleI18nRouting(request);

  if (supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
    return supabaseResponse;
  }

  const locale = getLocale(request.nextUrl.pathname);
  const path = stripLocale(request.nextUrl.pathname, locale);
  const isAdminArea = path.startsWith("/admin") && path !== "/admin/login";
  const isAdminLoginPage = path === "/admin/login";
  const isUserLoginPage = path === "/login";
  const isRegisterPage = path === "/register";
  const isCheckoutPage = path === "/checkout";
  const isOrdersPage = path === "/orders";

  if (
    !isAdminArea &&
    !isAdminLoginPage &&
    !isUserLoginPage &&
    !isRegisterPage &&
    !isCheckoutPage &&
    !isOrdersPage
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          const response = NextResponse.next({ request });
          supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie);
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          supabaseResponse = response;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const redirectWithCookies = (pathname: string) => {
    const response = NextResponse.redirect(
      new URL(localizedPath(pathname, locale), request.url)
    );
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  };

  let role: string | null = null;
  if (user) {
    const claimedRole = (user.app_metadata as { role?: string } | null)?.role;
    if (claimedRole) {
      role = claimedRole;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? "user";
    }
  }

  if (isAdminArea) {
    if (!user) return redirectWithCookies("/admin/login");
    if (role !== "admin") return redirectWithCookies("/");
    return supabaseResponse;
  }

  if ((isCheckoutPage || isOrdersPage) && !user) {
    const redirectTo = path;
    const login = new URL(localizedPath("/login", locale), request.url);
    login.searchParams.set("redirect", redirectTo);
    const response = NextResponse.redirect(login);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  }

  if (
    user &&
    role === "admin" &&
    (isAdminLoginPage || isUserLoginPage || isRegisterPage)
  ) {
    return redirectWithCookies("/admin/dashboard");
  }

  if (user && role === "user" && (isUserLoginPage || isRegisterPage)) {
    return redirectWithCookies("/");
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|auth/callback|_next|_vercel|.*\\..*).*)"],
};

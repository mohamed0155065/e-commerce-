import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    let role: string | null = null
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        role = profile?.role ?? 'user'
    }

    const isAdminArea = path.startsWith('/admin') && path !== '/admin/login'
    const isAdminLoginPage = path === '/admin/login'
    const isUserLoginPage = path === '/login'
    const isRegisterPage = path === '/register'
    const isCheckoutPage = path === '/checkout'

    // 1) مساحة الأدمن: لازم user + role === 'admin'
    if (isAdminArea) {
        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return supabaseResponse
    }

    // 2) حماية صفحة الـ checkout: لازم تسجيل دخول
    if (isCheckoutPage && !user) {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', '/checkout')
        return NextResponse.redirect(url)
    }

    // 3) أدمن مسجل دخول وحاول يفتح login/register بتاعت اليوزر أو admin/login تاني
    if (user && role === 'admin' && (isAdminLoginPage || isUserLoginPage || isRegisterPage)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // 4) يوزر عادي مسجل دخول وحاول يفتح login/register تاني
    if (user && role === 'user' && (isUserLoginPage || isRegisterPage)) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/admin/:path*', '/login', '/register', '/checkout'],
}
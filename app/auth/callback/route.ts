import { NextResponse, type NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

function authErrorRedirect(request: NextRequest, error: string) {
    const returnTo = request.nextUrl.searchParams.get('errorReturnTo')
    const page = returnTo === '/register' ? '/register' : '/login'
    const url = new URL(page, request.url)
    url.searchParams.set('error', error)
    return NextResponse.redirect(url)
}

function safeNextPath(value: string | null, origin: string) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return '/'
    }

    const destination = new URL(value, origin)
    return destination.origin === origin
        ? `${destination.pathname}${destination.search}${destination.hash}`
        : '/'
}

export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl
    const code = searchParams.get('code')

    if (searchParams.has('error')) {
        return authErrorRedirect(request, 'oauth_failed')
    }

    if (!code) {
        return authErrorRedirect(request, 'missing_code')
    }

    try {
        const supabase = await supabaseServer()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            return authErrorRedirect(request, 'session_exchange_failed')
        }

        return NextResponse.redirect(
            new URL(safeNextPath(searchParams.get('next'), origin), origin)
        )
    } catch {
        return authErrorRedirect(request, 'session_exchange_failed')
    }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const sessionUser = request.cookies.get('session_user')
    const { pathname } = request.nextUrl

    // Define paths
    const isAuthPage = pathname.startsWith('/login')
    // Exclude public paths explicitly to avoid loops and broken assets
    const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')
    const isApiAuth = pathname.startsWith('/api/auth') // Allow login/logout APIs

    // We want to protect '/' and potentially others.
    // Simplest rule per user request: "if no user go to login, if user go to home"

    // Rule 1: Protected routes (Home and others) -> Redirect to Login if no session
    // We consider everything protected except login page, api auth, and static assets.
    const isProtectedRoute = !isAuthPage && !isPublicAsset && !isApiAuth

    if (isProtectedRoute && !sessionUser) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Rule 2: Login page -> Redirect to Home if session exists
    if (isAuthPage && sessionUser) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Rule 3: Admin only routes
    if (pathname.startsWith('/datauser')) {
        if (!sessionUser) return NextResponse.redirect(new URL('/login', request.url))

        try {
            const user = JSON.parse(sessionUser.value)
            if (user.role !== 'admin' && user.role !== 'lurah') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Rule 4: Admin & Koordinator routes (Laporan)
    if (pathname.startsWith('/laporan')) {
        if (!sessionUser) return NextResponse.redirect(new URL('/login', request.url))

        try {
            const user = JSON.parse(sessionUser.value)
            if (user.role !== 'admin' && user.role !== 'koordinator' && user.role !== 'lurah') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/login'],
}

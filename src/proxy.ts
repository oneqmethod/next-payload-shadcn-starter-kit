import { NextResponse, NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  if (!isProtected) {
    return NextResponse.next()
  }

  const token = request.cookies.get('payload-token')?.value
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const proxyConfig = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - admin (Payload admin)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!api|admin|\\.well-known|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

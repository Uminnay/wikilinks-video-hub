import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Track cookies that Supabase sets during auth operations
  let pendingCookies: { name: string; value: string; options: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Save cookies for later so we can apply them to ANY response (including redirects)
          pendingCookies = cookiesToSet
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── INTERCEPT AUTH CODE ──────────────────────────────────
  // If a ?code= parameter arrives (from Supabase/Google OAuth redirect),
  // exchange it for a session RIGHT HERE, regardless of which URL it landed on.
  const code = request.nextUrl.searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    const url = request.nextUrl.clone()
    url.searchParams.delete('code')
    url.searchParams.delete('error')
    
    if (!error) {
      // Success! Redirect to home
      url.pathname = '/'
      const redirectResponse = NextResponse.redirect(url)
      // CRITICAL: Copy session cookies to the redirect response!
      // Without this, the browser never receives the session cookies.
      pendingCookies.forEach(({ name, value, options }) => {
        redirectResponse.cookies.set(name, value, options)
      })
      return redirectResponse
    } else {
      console.error('Middleware: Failed to exchange code:', error.message)
      url.pathname = '/login'
      url.searchParams.set('error', 'AuthFailed')
      return NextResponse.redirect(url)
    }
  }

  // ── SESSION CHECK ────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')
  const isPublicRoute = request.nextUrl.pathname.startsWith('/api/') || 
                        request.nextUrl.pathname.startsWith('/_next') ||
                        request.nextUrl.pathname.includes('.')

  if (!user && !isLoginPage && !isAuthCallback && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.delete('code')
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

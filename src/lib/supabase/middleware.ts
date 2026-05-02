import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
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
  // If Supabase/Google redirected back with a ?code= parameter,
  // exchange it for a session RIGHT HERE, regardless of which URL it landed on.
  // This fixes the issue where Supabase ignores our redirectTo and sends the
  // code to the Site URL (/) which then gets bounced to /login by our guard below.
  const code = request.nextUrl.searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Success! Redirect to home, stripping the code from the URL
      const url = request.nextUrl.clone()
      url.searchParams.delete('code')
      url.pathname = '/'
      return NextResponse.redirect(url)
    } else {
      console.error('Middleware: Failed to exchange code for session:', error.message)
      // If exchange fails, redirect to login with error
      const url = request.nextUrl.clone()
      url.searchParams.delete('code')
      url.pathname = '/login'
      url.searchParams.set('error', 'AuthFailed')
      return NextResponse.redirect(url)
    }
  }

  // ── SESSION CHECK ────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger todas las rutas excepto login y rutas estáticas
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')
  const isPublicRoute = request.nextUrl.pathname.startsWith('/api/') || 
                        request.nextUrl.pathname.startsWith('/_next') ||
                        request.nextUrl.pathname.includes('.')

  if (!user && !isLoginPage && !isAuthCallback && !isPublicRoute) {
    // Redirigir al login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.delete('code') // Never carry code to login
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    // Si está autenticado y en login, redirigir al inicio
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

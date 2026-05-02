import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PRODUCTION_URL = 'https://wikilinks.liagil.es'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const resolvedOrigin = process.env.NODE_ENV === 'production' 
    ? PRODUCTION_URL 
    : 'http://localhost:3001'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${resolvedOrigin}${next}`)
    } else {
      console.error('Supabase Auth Error:', error)
    }
  }

  return NextResponse.redirect(`${resolvedOrigin}/login?error=CouldNotAuthenticate`)
}

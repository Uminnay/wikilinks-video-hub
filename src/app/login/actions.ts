"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle() {
  const supabase = createClient()
  
  // Use the explicit SITE_URL env var for reliability behind proxies.
  // Falls back to header detection for local development.
  let origin: string
  if (process.env.SITE_URL) {
    origin = process.env.SITE_URL
  } else {
    const headersList = headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    origin = `${protocol}://${host}`
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

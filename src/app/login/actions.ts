"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PRODUCTION_URL = 'https://wikilinks.liagil.es'

export async function signInWithGoogle() {
  const supabase = createClient()
  
  const origin = process.env.NODE_ENV === 'production' 
    ? PRODUCTION_URL 
    : 'http://localhost:3001'
  
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

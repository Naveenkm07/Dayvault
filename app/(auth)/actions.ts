'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Rate limiting: 5 attempts per 15 minutes per IP/email
  const identifier = `login:${email}`
  if (!checkRateLimit(identifier, 5, 15 * 60 * 1000)) {
    return { error: 'Too many login attempts. Please try again later.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // Rate limiting: 3 attempts per 15 minutes per IP/email
  const identifier = `signup:${email}`
  if (!checkRateLimit(identifier, 3, 15 * 60 * 1000)) {
    return { error: 'Too many signup attempts. Please try again later.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function sendPasswordResetEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  // Rate limiting: 2 attempts per hour per email
  const identifier = `reset:${email}`
  if (!checkRateLimit(identifier, 2, 60 * 60 * 1000)) {
    return { error: 'Too many reset attempts. Please try again later.' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/settings`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
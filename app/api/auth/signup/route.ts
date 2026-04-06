import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { isValidEmail, sanitizeString } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password y nombre son requeridos' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const sanitizedName = sanitizeString(name, 100)
    const supabase = await createClient()

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: sanitizedName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (authError) {
      console.error('Supabase signup error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Always return this — whether new user or already registered,
    // we never reveal account existence and never auto-login.
    // The Prisma user will be created on first login after confirmation.
    return NextResponse.json({ emailConfirmationRequired: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}

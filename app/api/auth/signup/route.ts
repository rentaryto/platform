import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Sanitize name
    const sanitizedName = sanitizeString(name, 100)

    const supabase = await createClient()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (authError) {
      console.error('Supabase signup error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    }

    // Check if email confirmation is required
    const needsEmailConfirmation = authData.user.identities && authData.user.identities.length === 0

    // If email confirmation is needed, return early with confirmation message
    if (needsEmailConfirmation) {
      return NextResponse.json(
        {
          message: 'Revisa tu email para confirmar tu cuenta',
          emailConfirmationRequired: true,
          user: {
            email: authData.user.email,
          },
        },
      )
    }

    // Create or fetch user record in database (only if email is auto-confirmed)
    const user = await prisma.user.upsert({
      where: { id: authData.user.id },
      update: {}, // User already exists, nothing to update
      create: {
        id: authData.user.id,
        email,
        password: '', // Password is managed by Supabase Auth
        name: sanitizedName,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}

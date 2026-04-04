import { createClient } from '@/lib/supabase-route-handler'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidEmail } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password son requeridos' },
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

    const { supabase, response } = await createClient(request)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
    }

    // Get or create user data in database
    let user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // If user doesn't exist in DB (confirmed email after signup), create it
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          password: '',
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Usuario',
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })
    }

    // Return response with cookies set
    return NextResponse.json(
      { user },
      {
        headers: response.headers,
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}

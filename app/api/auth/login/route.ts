import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidEmail } from '@/lib/validation'
import { calculateTrialEndDate } from '@/lib/subscription-utils'
import { DEFAULT_TRIAL_PLAN, TRIAL_MAX_PROPERTIES } from '@/lib/subscription-plans'

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

    const supabase = await createClient()

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
      const trialStartDate = new Date()
      const trialEndDate = calculateTrialEndDate(trialStartDate)

      user = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          password: '',
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Usuario',
          subscription: {
            create: {
              status: 'trial',
              plan: DEFAULT_TRIAL_PLAN,
              maxProperties: TRIAL_MAX_PROPERTIES,
              trialStartDate,
              trialEndDate,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      console.log('[LOGIN] Created new user with trial subscription:', user.id, 'max properties:', TRIAL_MAX_PROPERTIES)
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}

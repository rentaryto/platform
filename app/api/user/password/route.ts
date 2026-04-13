import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const authUser = await requireAuth(request)

  if (!authUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva contraseña son requeridas' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar contraseña actual intentando hacer login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 401 }
      )
    }

    // Actualizar contraseña en Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la contraseña' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    )
  }
}

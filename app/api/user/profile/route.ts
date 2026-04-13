import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { isValidEmail } from '@/lib/validation'

export async function PATCH(request: NextRequest) {
  const authUser = await requireAuth(request)

  if (!authUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { name, email } = await request.json()

    if (!name && !email) {
      return NextResponse.json(
        { error: 'Debes proporcionar al menos un campo para actualizar' },
        { status: 400 }
      )
    }

    // Validar email si se está actualizando
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const updateData: { name?: string; email?: string } = {}
    if (name) updateData.name = name
    if (email) updateData.email = email

    // Si se está actualizando el email, también actualizar en Supabase
    if (email && email !== authUser.email) {
      const supabase = await createClient()
      const { error: supabaseError } = await supabase.auth.updateUser({
        email: email,
      })

      if (supabaseError) {
        console.error('Error updating email in Supabase:', supabaseError)
        return NextResponse.json(
          { error: 'Error al actualizar el email. Verifica que el nuevo email no esté en uso.' },
          { status: 400 }
        )
      }
    }

    // Actualizar en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el perfil' },
      { status: 500 }
    )
  }
}

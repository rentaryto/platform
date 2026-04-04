import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, phone, leaseStartDate, leaseEndDate } = body

    // Verify tenant belongs to user
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            currentApartment: {
              userId: user.id,
            },
          },
          {
            apartmentHistory: {
              userId: user.id,
            },
          },
        ],
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Inquilino no encontrado' }, { status: 404 })
    }

    const updated = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(leaseStartDate && { leaseStartDate: new Date(leaseStartDate) }),
        ...(leaseEndDate !== undefined && {
          leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null
        }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { error: 'Error al actualizar inquilino' },
      { status: 500 }
    )
  }
}

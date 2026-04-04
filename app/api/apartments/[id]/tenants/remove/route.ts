import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { leaseEndDate } = body

    // Verify apartment ownership
    const apartment = await prisma.apartment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        currentTenant: true,
      },
    })

    if (!apartment) {
      return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
    }

    if (!apartment.currentTenant) {
      return NextResponse.json({ error: 'El inmueble no tiene inquilino' }, { status: 400 })
    }

    // Update tenant with end date and remove from apartment
    await prisma.tenant.update({
      where: { id: apartment.currentTenant.id },
      data: {
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : new Date(),
      },
    })

    // Update apartment: remove current tenant and set status to vacant
    await prisma.apartment.update({
      where: { id: params.id },
      data: {
        currentTenantId: null,
        status: 'vacant',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing tenant:', error)
    return NextResponse.json(
      { error: 'Error al remover inquilino' },
      { status: 500 }
    )
  }
}

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
    const { tenantId, leaseStartDate } = body

    if (!tenantId || !leaseStartDate) {
      return NextResponse.json(
        { error: 'ID de inquilino y fecha de entrada son requeridos' },
        { status: 400 }
      )
    }

    // Verify apartment ownership
    const apartment = await prisma.apartment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!apartment) {
      return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
    }

    // Verify tenant ownership
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        userId: user.id,
      },
      include: {
        currentApartment: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Inquilino no encontrado' }, { status: 404 })
    }

    // Check if tenant is already assigned to another apartment
    if (tenant.currentApartment) {
      return NextResponse.json(
        { error: 'Este inquilino ya está asignado a otro inmueble' },
        { status: 400 }
      )
    }

    // Update tenant with lease start date and apartment
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        leaseStartDate: new Date(leaseStartDate),
        apartmentId: params.id,
      },
    })

    // Update apartment with current tenant and status
    await prisma.apartment.update({
      where: { id: params.id },
      data: {
        currentTenantId: tenantId,
        status: 'occupied',
      },
    })

    // Create IPC reminder (11 months after lease start)
    const ipcDate = new Date(leaseStartDate)
    ipcDate.setMonth(ipcDate.getMonth() + 11)

    const ipcReminder = await prisma.reminder.create({
      data: {
        apartmentId: params.id,
        title: 'Subida IPC',
        description: `Notificar subida IPC para ${tenant.name}`,
        dueDate: ipcDate,
        status: 'pending',
      },
    })

    return NextResponse.json({ tenant: updatedTenant, ipcReminder }, { status: 200 })
  } catch (error) {
    console.error('Error assigning tenant:', error)
    return NextResponse.json(
      { error: 'Error al asignar inquilino' },
      { status: 500 }
    )
  }
}

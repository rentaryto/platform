import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidEmail, sanitizeString } from '@/lib/validation'

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
    const { name, email, phone, leaseStartDate } = body

    if (!name || !email || !leaseStartDate) {
      return NextResponse.json(
        { error: 'Nombre, email y fecha de entrada son requeridos' },
        { status: 400 }
      )
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name, 200)
    const sanitizedPhone = phone ? sanitizeString(phone, 20) : null

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

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: sanitizedName,
        email,
        phone: sanitizedPhone,
        leaseStartDate: new Date(leaseStartDate),
        apartmentId: params.id,
      },
    })

    // Update apartment with current tenant and status
    await prisma.apartment.update({
      where: { id: params.id },
      data: {
        currentTenantId: tenant.id,
        status: 'occupied',
      },
    })

    // Create IPC reminder (11 months after lease start)
    const ipcDate = new Date(leaseStartDate)
    ipcDate.setMonth(ipcDate.getMonth() + 11)

    await prisma.reminder.create({
      data: {
        apartmentId: params.id,
        title: 'Subida IPC',
        description: `Revisar y aplicar subida IPC para ${name}`,
        dueDate: ipcDate,
        type: 'auto_ipc',
        status: 'pending',
      },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json(
      { error: 'Error al asignar inquilino' },
      { status: 500 }
    )
  }
}

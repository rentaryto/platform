import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidEmail, sanitizeString } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get all tenants belonging to this user
  const tenants = await prisma.tenant.findMany({
    where: {
      userId: user.id,
    },
    include: {
      currentApartment: {
        select: {
          id: true,
          name: true,
        },
      },
      apartmentHistory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tenants)
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
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

    // Create tenant without apartment (unassigned)
    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        name: sanitizedName,
        email,
        phone: sanitizedPhone,
        leaseStartDate: new Date(), // placeholder, will be set when assigned
      },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json(
      { error: 'Error al crear inquilino' },
      { status: 500 }
    )
  }
}

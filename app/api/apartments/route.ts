import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidAmount, sanitizeString } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const apartments = await prisma.apartment.findMany({
    where: { userId: user.id },
    include: {
      currentTenant: true,
      recurringExpenses: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(apartments)
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, address, cadastralReference, rentAmount, purchasePrice } = body

    if (!name || !address || !rentAmount) {
      return NextResponse.json(
        { error: 'Nombre, dirección y renta son requeridos' },
        { status: 400 }
      )
    }

    // Validate rent amount
    if (!isValidAmount(rentAmount)) {
      return NextResponse.json(
        { error: 'Renta inválida' },
        { status: 400 }
      )
    }

    // Validate purchase price if provided
    if (purchasePrice !== undefined && purchasePrice !== null && !isValidAmount(purchasePrice)) {
      return NextResponse.json(
        { error: 'Precio de compra inválido' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name, 200)
    const sanitizedAddress = sanitizeString(address, 500)
    const sanitizedCadastral = cadastralReference ? sanitizeString(cadastralReference, 100) : null

    const apartment = await prisma.apartment.create({
      data: {
        userId: user.id,
        name: sanitizedName,
        address: sanitizedAddress,
        cadastralReference: sanitizedCadastral,
        rentAmount,
        purchasePrice: purchasePrice || null,
        status: 'vacant',
      },
    })

    return NextResponse.json(apartment, { status: 201 })
  } catch (error) {
    console.error('Error creating apartment:', error)
    return NextResponse.json(
      { error: 'Error al crear inmueble' },
      { status: 500 }
    )
  }
}

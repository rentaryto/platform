import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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

  const expenses = await prisma.unexpectedExpense.findMany({
    where: { apartmentId: params.id },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(expenses)
}

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
    const { description, amount, date } = body

    if (!description || !amount || !date) {
      return NextResponse.json(
        { error: 'Descripción, cantidad y fecha son requeridos' },
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

    const expense = await prisma.unexpectedExpense.create({
      data: {
        apartmentId: params.id,
        description,
        amount,
        date: new Date(date),
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating unexpected expense:', error)
    return NextResponse.json(
      { error: 'Error al crear gasto inesperado' },
      { status: 500 }
    )
  }
}

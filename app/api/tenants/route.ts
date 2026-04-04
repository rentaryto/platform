import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get all tenants from user's apartments
  const tenants = await prisma.tenant.findMany({
    where: {
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

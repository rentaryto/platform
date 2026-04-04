import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const reminders = await prisma.reminder.findMany({
    where: {
      apartment: { userId: user.id },
      status: 'pending',
    },
    include: {
      apartment: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  return NextResponse.json(reminders)
}

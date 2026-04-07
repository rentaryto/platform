import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calculateMonthlyExpense(amount: number, frequency: string): number {
  switch (frequency) {
    case 'monthly':
      return amount
    case 'quarterly':
      return amount / 3
    case 'semiannual':
      return amount / 6
    case 'annual':
      return amount / 12
    default:
      return 0
  }
}

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
  })

  const totalMonthlyIncome = apartments.reduce(
    (sum, apt) => sum + (apt.status === 'occupied' ? Number(apt.rentAmount) : 0),
    0
  )

  let totalMonthlyExpenses = 0
  apartments.forEach((apt) => {
    apt.recurringExpenses.forEach((exp) => {
      totalMonthlyExpenses += calculateMonthlyExpense(Number(exp.amount), exp.frequency)
    })
  })

  const monthlyProfit = totalMonthlyIncome - totalMonthlyExpenses

  // Get pending invoices (documents of type "invoice" with sendStatus "pending")
  const pendingInvoices = await prisma.document.findMany({
    where: {
      apartment: { userId: user.id },
      type: 'invoice',
      sendStatus: 'pending',
    },
    include: {
      apartment: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Get upcoming reminders
  const upcomingReminders = await prisma.reminder.findMany({
    where: {
      apartment: { userId: user.id },
      status: 'pending',
      dueDate: { gte: new Date() },
    },
    include: {
      apartment: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  })

  return NextResponse.json({
    totalMonthlyIncome,
    totalMonthlyExpenses,
    monthlyProfit,
    apartments: apartments.map((apt) => ({
      id: apt.id,
      name: apt.name,
      status: apt.status,
      tenantName: apt.currentTenant?.name || null,
      rentAmount: Number(apt.rentAmount),
    })),
    pendingInvoices: pendingInvoices.map((inv) => ({
      id: inv.id,
      apartmentName: inv.apartment.name,
      fileName: inv.fileName,
      description: inv.description,
      createdAt: inv.createdAt,
    })),
    upcomingReminders: upcomingReminders.map((rem) => ({
      id: rem.id,
      apartmentName: rem.apartment.name,
      title: rem.title,
      dueDate: rem.dueDate,
    })),
  })
}

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

  // Get pending invoices (sendStatus='pending' OR paidStatus='unpaid')
  const pendingInvoices = await prisma.document.findMany({
    where: {
      apartment: { userId: user.id },
      type: 'invoice',
      OR: [
        { sendStatus: 'pending' },
        { paidStatus: 'unpaid' },
      ],
    },
    include: {
      apartment: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Get last 10 reminders
  const upcomingReminders = await prisma.reminder.findMany({
    where: {
      apartment: { userId: user.id },
    },
    include: {
      apartment: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { dueDate: 'desc' },
    take: 10,
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
      sendStatus: inv.sendStatus,
      paidStatus: inv.paidStatus,
      createdAt: inv.createdAt,
    })),
    upcomingReminders: upcomingReminders.map((rem) => ({
      id: rem.id,
      apartmentName: rem.apartment.name,
      title: rem.title,
      description: rem.description,
      dueDate: rem.dueDate,
      status: rem.status,
    })),
  })
}

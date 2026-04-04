import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidYear } from '@/lib/validation'

function annualizeExpense(amount: number, frequency: string): number {
  switch (frequency) {
    case 'monthly':
      return amount * 12
    case 'quarterly':
      return amount * 4
    case 'semiannual':
      return amount * 2
    case 'annual':
      return amount
    default:
      return 0
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const year = parseInt(params.year)

  if (!isValidYear(year)) {
    return NextResponse.json({ error: 'Año inválido' }, { status: 400 })
  }

  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  // Get all user's apartments
  const apartments = await prisma.apartment.findMany({
    where: { userId: user.id },
    include: {
      currentTenant: true,
      tenantHistory: true,
      recurringExpenses: true,
      unexpectedExpenses: {
        where: {
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  let totalIncome = 0
  let totalExpenses = 0

  const propertiesData = apartments.map((apt) => {
    // Calculate income: determine occupied months in the year
    const monthly: Array<{ month: string; amount: number }> = []
    let propertyIncome = 0

    // Get all tenants who were in this apartment during the year
    const tenantsInYear = [apt.currentTenant, ...apt.tenantHistory].filter((t) => {
      if (!t) return false
      const leaseStart = new Date(t.leaseStartDate)
      const leaseEnd = t.leaseEndDate ? new Date(t.leaseEndDate) : new Date()

      // Check if there was overlap with the fiscal year
      return leaseStart <= endOfYear && leaseEnd >= startOfYear
    })

    // Calculate income per month
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59)

      // Check if there was a tenant that month
      const hadTenant = tenantsInYear.some((t) => {
        if (!t) return false
        const leaseStart = new Date(t.leaseStartDate)
        const leaseEnd = t.leaseEndDate ? new Date(t.leaseEndDate) : new Date()
        return leaseStart <= monthEnd && leaseEnd >= monthStart
      })

      const monthName = monthStart.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
      })

      if (hadTenant) {
        const amount = Number(apt.rentAmount)
        monthly.push({ month: monthName, amount })
        propertyIncome += amount
      } else {
        monthly.push({ month: monthName, amount: 0 })
      }
    }

    // Calculate expenses
    const recurringExpensesData = apt.recurringExpenses.map((exp) => ({
      name: exp.name,
      frequency: exp.frequency,
      amount: Number(exp.amount),
      annualTotal: annualizeExpense(Number(exp.amount), exp.frequency),
    }))

    const unexpectedExpensesData = apt.unexpectedExpenses.map((exp) => ({
      description: exp.description,
      amount: Number(exp.amount),
      date: exp.date.toISOString().split('T')[0],
    }))

    const recurringTotal = recurringExpensesData.reduce(
      (sum, exp) => sum + exp.annualTotal,
      0
    )
    const unexpectedTotal = unexpectedExpensesData.reduce(
      (sum, exp) => sum + exp.amount,
      0
    )
    const propertyExpenses = recurringTotal + unexpectedTotal

    totalIncome += propertyIncome
    totalExpenses += propertyExpenses

    // Determine current tenant or last tenant of the year
    const tenantInfo = tenantsInYear.length > 0 ? tenantsInYear[0] : null

    return {
      id: apt.id,
      name: apt.name,
      address: apt.address,
      cadastralReference: apt.cadastralReference,
      status: apt.status,
      tenant: tenantInfo
        ? {
            name: tenantInfo.name,
            email: tenantInfo.email,
            leaseStart: tenantInfo.leaseStartDate.toISOString().split('T')[0],
            leaseEnd: tenantInfo.leaseEndDate
              ? tenantInfo.leaseEndDate.toISOString().split('T')[0]
              : null,
          }
        : null,
      income: {
        monthly,
        total: propertyIncome,
      },
      expenses: {
        recurring: recurringExpensesData,
        unexpected: unexpectedExpensesData,
        total: propertyExpenses,
      },
      netProfit: propertyIncome - propertyExpenses,
    }
  })

  return NextResponse.json({
    year,
    summary: {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    },
    properties: propertiesData,
  })
}

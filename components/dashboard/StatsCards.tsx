import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEuro } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface StatsCardsProps {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlyProfit: number;
}

export function StatsCards({ totalMonthlyIncome, totalMonthlyExpenses, monthlyProfit }: StatsCardsProps) {
  const profitPercentage = totalMonthlyIncome > 0
    ? ((monthlyProfit / totalMonthlyIncome) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ingresos Mensuales
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatEuro(totalMonthlyIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">Alquileres ocupados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gastos Mensuales
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatEuro(totalMonthlyExpenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">Gastos recurrentes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Beneficio Mensual
          </CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div
              className={`text-2xl font-bold ${
                monthlyProfit >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatEuro(monthlyProfit)}
            </div>
            <span
              className={`text-sm font-medium ${
                monthlyProfit >= 0 ? "text-blue-500" : "text-red-500"
              }`}
            >
              {profitPercentage}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ingresos - Gastos</p>
        </CardContent>
      </Card>
    </div>
  );
}

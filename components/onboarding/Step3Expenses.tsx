"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recurringExpensesApi } from "@/lib/api";
import { Receipt, CheckCircle } from "lucide-react";

type Frequency = "monthly" | "quarterly" | "semiannual" | "annual";

interface ExpenseConfig {
  label: string;
  frequency: Frequency;
  frequencyLabel: string;
  defaultAmount: string;
  enabled: boolean;
  amount: string;
}

const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: "Mensual",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

const DEFAULT_EXPENSES: Record<string, ExpenseConfig> = {
  comunidad: {
    label: "Comunidad de propietarios",
    frequency: "monthly",
    frequencyLabel: "Mensual",
    defaultAmount: "",
    enabled: true,
    amount: "",
  },
  ibi: {
    label: "IBI / OPAEF",
    frequency: "quarterly",
    frequencyLabel: "Trimestral",
    defaultAmount: "",
    enabled: true,
    amount: "",
  },
  seguro: {
    label: "Seguro del inmueble",
    frequency: "annual",
    frequencyLabel: "Anual",
    defaultAmount: "",
    enabled: true,
    amount: "",
  },
  basuras: {
    label: "Tasa de basuras",
    frequency: "quarterly",
    frequencyLabel: "Trimestral",
    defaultAmount: "",
    enabled: false,
    amount: "",
  },
};

interface Props {
  propertyId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function Step3Expenses({ propertyId, onComplete, onBack }: Props) {
  const queryClient = useQueryClient();
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (key: string) => {
    setExpenses((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const handleAmount = (key: string, value: string) => {
    setExpenses((prev) => ({
      ...prev,
      [key]: { ...prev[key], amount: value },
    }));
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      setError(null);

      const enabled = Object.entries(expenses).filter(
        ([, e]) => e.enabled && e.amount && parseFloat(e.amount) > 0
      );

      await Promise.all(
        enabled.map(([, e]) =>
          recurringExpensesApi.create(propertyId, {
            name: e.label,
            amount: parseFloat(e.amount),
            frequency: e.frequency,
          })
        )
      );

      await queryClient.invalidateQueries({ queryKey: ["apartment", propertyId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar gastos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Receipt className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Gastos recurrentes</h3>
        <p className="text-sm text-muted-foreground">
          Añade los gastos fijos del inmueble para calcular tu rentabilidad
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(expenses).map(([key, expense]) => (
          <div
            key={key}
            className={`border rounded-lg p-4 transition-colors ${
              expense.enabled ? "border-blue-200 bg-blue-50/50" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={expense.enabled}
                onChange={() => handleToggle(key)}
                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{expense.label}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {FREQUENCY_LABELS[expense.frequency]}
                  </span>
                </div>
                {expense.enabled && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1 max-w-[140px]">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={expense.amount}
                        onChange={(e) => handleAmount(key, e.target.value)}
                        className="pr-6 text-sm"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        €
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      por período
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          💡 <strong>Tip:</strong> Puedes dejar en blanco los que no apliquen y añadir más después desde cada inmueble.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Atrás
        </Button>
        <Button onClick={handleFinish} disabled={loading}>
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

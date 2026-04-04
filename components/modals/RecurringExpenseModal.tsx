"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recurringExpensesApi } from "@/lib/api";
import type { RecurringExpense } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Introduce una cantidad válida"),
  frequency: z.enum(["monthly", "quarterly", "semiannual", "annual"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
  apartmentId: string;
  expense?: RecurringExpense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringExpenseModal({ apartmentId, expense, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { frequency: "monthly" },
  });

  useEffect(() => {
    if (expense) {
      setValue("name", expense.name);
      setValue("amount", String(expense.amount));
      setValue("frequency", expense.frequency);
    } else {
      reset({ frequency: "monthly" });
    }
  }, [expense, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      if (expense) {
        await recurringExpensesApi.update(expense.id, {
          name: data.name,
          amount: parseFloat(data.amount),
          frequency: data.frequency,
        });
      } else {
        await recurringExpensesApi.create(apartmentId, {
          name: data.name,
          amount: parseFloat(data.amount),
          frequency: data.frequency,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["apartment", apartmentId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset({ frequency: "monthly" });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar gasto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Editar" : "Añadir"} Gasto Recurrente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input placeholder="Ej: Comunidad" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Cantidad (€)</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Frecuencia</Label>
            <Select
              defaultValue={expense?.frequency ?? "monthly"}
              onValueChange={(val) => setValue("frequency", val as FormData["frequency"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="semiannual">Semestral</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
            {errors.frequency && <p className="text-xs text-red-500">{errors.frequency.message}</p>}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

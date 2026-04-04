"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apartmentsApi } from "@/lib/api";
import { formatEuro } from "@/lib/utils";

const schema = z.object({
  rentAmount: z.string().min(1, "Introduce la nueva renta").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Debe ser un número positivo"
  ),
});

type FormData = z.infer<typeof schema>;

interface Props {
  apartmentId: string;
  currentRent: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRentModal({ apartmentId, currentRent, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const newRentStr = watch("rentAmount");
  const newRent = parseFloat(newRentStr ?? "0");
  const pctChange =
    !isNaN(newRent) && newRent > 0 && currentRent > 0
      ? (((newRent - currentRent) / currentRent) * 100).toFixed(2)
      : null;

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      await apartmentsApi.update(apartmentId, { rentAmount: parseFloat(data.rentAmount) });
      await queryClient.invalidateQueries({ queryKey: ["apartment", apartmentId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la renta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Renta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Renta actual</Label>
            <Input value={formatEuro(currentRent)} disabled />
          </div>
          <div className="space-y-2">
            <Label>Nueva renta (€)</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...register("rentAmount")} />
            {errors.rentAmount && <p className="text-xs text-red-500">{errors.rentAmount.message}</p>}
          </div>
          {pctChange !== null && (
            <div className={`rounded-md p-3 text-sm border ${parseFloat(pctChange) >= 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              Cambio: <strong>{parseFloat(pctChange) >= 0 ? "+" : ""}{pctChange}%</strong>
            </div>
          )}
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

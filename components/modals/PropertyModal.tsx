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
import { apartmentsApi } from "@/lib/api";
import type { ApartmentSummary } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  address: z.string().min(1, "La dirección es obligatoria"),
  cadastralReference: z.string().optional(),
  rentAmount: z.string().min(1, "La renta es obligatoria").transform((v) => parseFloat(v)),
  purchasePrice: z.string().optional().transform((v) => v && v.trim() !== "" ? parseFloat(v) : undefined),
});

type FormData = z.infer<typeof schema>;

interface Props {
  property?: ApartmentSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyModal({ property, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (property) {
      reset({
        name: property.name,
        address: property.address,
        cadastralReference: property.cadastralReference || "",
        rentAmount: String(property.rentAmount) as any,
        purchasePrice: property.purchasePrice ? String(property.purchasePrice) : ("" as any),
      });
    } else {
      reset({ name: "", address: "", cadastralReference: "", rentAmount: "" as any, purchasePrice: "" as any });
    }
  }, [property, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      if (property) {
        await apartmentsApi.update(property.id, {
          name: data.name,
          address: data.address,
          cadastralReference: data.cadastralReference,
          rentAmount: data.rentAmount,
          purchasePrice: data.purchasePrice,
        });
      } else {
        await apartmentsApi.create({
          name: data.name,
          address: data.address,
          cadastralReference: data.cadastralReference,
          rentAmount: data.rentAmount,
          purchasePrice: data.purchasePrice,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["apartments"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${property ? "actualizar" : "crear"} inmueble`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{property ? "Editar Inmueble" : "Añadir Inmueble"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input placeholder="Ej: Alberto Aguilera 1 Bajo" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input placeholder="C/ Alberto Aguilera 1, Bajo..." {...register("address")} />
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Referencia Catastral (opcional)</Label>
            <Input placeholder="1234567VG1234N0001AB" {...register("cadastralReference")} />
            <p className="text-xs text-muted-foreground">Usaremos para el informe de Hacienda que envías a tu gestor</p>
          </div>
          <div className="space-y-2">
            <Label>Renta mensual (€)</Label>
            <Input type="number" step="0.01" placeholder="570" {...register("rentAmount")} />
            {errors.rentAmount && <p className="text-xs text-red-500">{errors.rentAmount.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Precio de compra (€, opcional)</Label>
            <Input type="number" step="0.01" placeholder="150000" {...register("purchasePrice")} />
            <p className="text-xs text-muted-foreground">Usaremos para cálculo de rendimiento anual</p>
            {errors.purchasePrice && <p className="text-xs text-red-500">{errors.purchasePrice.message}</p>}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (property ? "Actualizando..." : "Creando...") : (property ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

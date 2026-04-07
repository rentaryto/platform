"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apartmentsApi } from "@/lib/api";
import { Home } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  address: z.string().min(1, "La dirección es obligatoria"),
  rentAmount: z.string().min(1, "La renta es obligatoria").transform((v) => parseFloat(v)),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onNext: (propertyId: string) => void;
  onSkip: () => void;
}

export function Step1Property({ onNext, onSkip }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const property = await apartmentsApi.create({
        name: data.name,
        address: data.address,
        rentAmount: data.rentAmount,
      });
      await queryClient.invalidateQueries({ queryKey: ["apartments"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onNext(property.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear inmueble");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Home className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Añade tu primer inmueble</h3>
        <p className="text-sm text-muted-foreground">
          Empieza registrando el inmueble que quieres gestionar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre del inmueble</Label>
          <Input placeholder="Ej: Piso 1A, Alberto Aguilera Bajo..." {...register("name")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Dirección completa</Label>
          <Input placeholder="C/ Alberto Aguilera 1, Bajo, 28015 Madrid" {...register("address")} />
          {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Renta mensual (€)</Label>
          <Input type="number" step="0.01" placeholder="570" {...register("rentAmount")} />
          {errors.rentAmount && <p className="text-xs text-red-500">{errors.rentAmount.message}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onSkip}>
            Saltar tutorial
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Siguiente →"}
          </Button>
        </div>
      </form>
    </div>
  );
}

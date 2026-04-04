"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tenantsApi } from "@/lib/api";
import { UserCheck, Users } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  leaseStartDate: z.string().min(1, "La fecha de entrada es obligatoria"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  propertyId: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step2Tenant({ propertyId, onNext, onBack, onSkip }: Props) {
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<'occupied' | 'vacant' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleVacant = async () => {
    // Solo avanzar al siguiente paso, el inmueble ya está como vacant por defecto
    onNext();
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      // Crear inquilino y asignarlo
      const tenant = await tenantsApi.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      await tenantsApi.assignExisting(propertyId, {
        tenantId: tenant.id,
        leaseStartDate: data.leaseStartDate,
      });

      await queryClient.invalidateQueries({ queryKey: ["apartments"] });
      await queryClient.invalidateQueries({ queryKey: ["apartment", propertyId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["tenants"] });

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar inquilino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">¿Tiene inquilino actualmente?</h3>
        <p className="text-sm text-muted-foreground">
          Indícanos si el inmueble está ocupado o vacío
        </p>
      </div>

      {!selectedOption && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedOption('occupied')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <UserCheck className="h-10 w-10 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
            <p className="font-medium text-gray-900">Sí, está ocupado</p>
            <p className="text-xs text-gray-500 mt-1">Añadir inquilino</p>
          </button>

          <button
            onClick={() => setSelectedOption('vacant')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Users className="h-10 w-10 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No, está vacío</p>
            <p className="text-xs text-gray-500 mt-1">Continuar sin inquilino</p>
          </button>
        </div>
      )}

      {selectedOption === 'occupied' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              Vamos a crear el inquilino y asignarlo a este inmueble
            </p>
          </div>

          <div className="space-y-2">
            <Label>Nombre del inquilino</Label>
            <Input placeholder="Nombre completo" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="correo@ejemplo.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Teléfono (opcional)</Label>
            <Input placeholder="612345678" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label>Fecha de entrada</Label>
            <Input type="date" {...register("leaseStartDate")} />
            {errors.leaseStartDate && <p className="text-xs text-red-500">{errors.leaseStartDate.message}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setSelectedOption(null)}>
              ← Cambiar opción
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Asignando..." : "Siguiente →"}
            </Button>
          </div>
        </form>
      )}

      {selectedOption === 'vacant' && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              El inmueble quedará marcado como vacío. Podrás asignar un inquilino más tarde.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setSelectedOption(null)}>
              ← Cambiar opción
            </Button>
            <Button onClick={handleVacant}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}

      {!selectedOption && (
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            ← Atrás
          </Button>
          <Button type="button" variant="ghost" onClick={onSkip}>
            Saltar →
          </Button>
        </div>
      )}
    </div>
  );
}

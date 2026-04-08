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
import { tenantsApi } from "@/lib/api";
import type { Tenant } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  dni: z.string().optional(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  tenant?: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TenantModal({ tenant, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        email: tenant.email,
        dni: tenant.dni || "",
        phone: tenant.phone || "",
      });
    } else {
      reset({ name: "", email: "", dni: "", phone: "" });
    }
  }, [tenant, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      if (tenant) {
        await tenantsApi.update(tenant.id, data);
      } else {
        await tenantsApi.create(data);
      }
      await queryClient.invalidateQueries({ queryKey: ["tenants"] });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${tenant ? "actualizar" : "crear"} inquilino`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tenant ? "Editar Inquilino" : "Añadir Inquilino"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input placeholder="Nombre completo" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="correo@ejemplo.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>DNI (opcional)</Label>
            <Input placeholder="12345678A" {...register("dni")} />
          </div>
          <div className="space-y-2">
            <Label>Teléfono (opcional)</Label>
            <Input placeholder="612345678" {...register("phone")} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (tenant ? "Actualizando..." : "Creando...") : (tenant ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

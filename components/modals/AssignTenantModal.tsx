"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tenantsApi } from "@/lib/api";

const schema = z.object({
  tenantId: z.string().min(1, "Debes seleccionar un inquilino"),
  leaseStartDate: z.string().min(1, "La fecha de entrada es obligatoria"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  apartmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function AssignTenantModal({ apartmentId, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => tenantsApi.list(),
    enabled: open,
  });

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const leaseStartDate = watch("leaseStartDate");
  const ipcDate = leaseStartDate
    ? addMonths(new Date(leaseStartDate), 11).toLocaleDateString("es-ES")
    : null;

  // Filtrar inquilinos disponibles (sin inmueble asignado)
  const availableTenants = tenants.filter(t => !t.currentApartment);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      await tenantsApi.assignExisting(apartmentId, data);
      await queryClient.invalidateQueries({ queryKey: ["apartment", apartmentId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["tenants"] });
      reset();
      setSelectedTenantId("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar inquilino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Inquilino</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Inquilino</Label>
            <Select
              value={selectedTenantId}
              onValueChange={(value) => {
                setSelectedTenantId(value);
                setValue("tenantId", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un inquilino..." />
              </SelectTrigger>
              <SelectContent>
                {availableTenants.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No hay inquilinos disponibles. Crea uno primero en la sección Inquilinos.
                  </div>
                ) : (
                  availableTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.tenantId && <p className="text-xs text-red-500">{errors.tenantId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Fecha de entrada</Label>
            <Input type="date" {...register("leaseStartDate")} />
            {errors.leaseStartDate && <p className="text-xs text-red-500">{errors.leaseStartDate.message}</p>}
          </div>
          {ipcDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
              Se creará un recordatorio de <strong>Subida IPC</strong> para el <strong>{ipcDate}</strong>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || availableTenants.length === 0}>
              {loading ? "Asignando..." : "Asignar Inquilino"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

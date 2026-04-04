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
import { remindersApi } from "@/lib/api";
import type { Reminder } from "@/lib/types";

const schema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "La fecha es obligatoria"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  apartmentId: string;
  reminder?: Reminder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReminderModal({ apartmentId, reminder, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (reminder) {
      reset({
        title: reminder.title,
        description: reminder.description || "",
        dueDate: new Date(reminder.dueDate).toISOString().split("T")[0],
      });
    } else {
      reset({ title: "", description: "", dueDate: "" });
    }
  }, [reminder, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      if (reminder) {
        await remindersApi.update(reminder.id, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
        });
      } else {
        await remindersApi.create(apartmentId, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["apartment", apartmentId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${reminder ? "actualizar" : "crear"} recordatorio`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reminder ? "Editar Recordatorio" : "Añadir Recordatorio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input placeholder="Ej: Revisión contrato" {...register("title")} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Input placeholder="Notas adicionales" {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" {...register("dueDate")} />
            {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (reminder ? "Actualizando..." : "Creando...") : (reminder ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { remindersApi } from "@/lib/api";
import { Calendar, CheckCircle } from "lucide-react";

interface Props {
  propertyId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function Step3Reminders({ propertyId, onComplete, onBack }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reminders, setReminders] = useState({
    ibi: { enabled: true, date: "" },
    insurance: { enabled: true, date: "" },
    community: { enabled: false, date: "" },
  });

  const handleToggle = (key: 'ibi' | 'insurance' | 'community') => {
    setReminders({
      ...reminders,
      [key]: { ...reminders[key], enabled: !reminders[key].enabled },
    });
  };

  const handleDateChange = (key: 'ibi' | 'insurance' | 'community', date: string) => {
    setReminders({
      ...reminders,
      [key]: { ...reminders[key], date },
    });
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      setError(null);

      // Crear recordatorios habilitados con fecha
      const reminderPromises = [];

      if (reminders.ibi.enabled && reminders.ibi.date) {
        reminderPromises.push(
          remindersApi.create(propertyId, {
            title: "Pago IBI",
            description: "Recordatorio trimestral IBI",
            dueDate: reminders.ibi.date,
          })
        );
      }

      if (reminders.insurance.enabled && reminders.insurance.date) {
        reminderPromises.push(
          remindersApi.create(propertyId, {
            title: "Renovación seguro",
            description: "Recordatorio anual del seguro",
            dueDate: reminders.insurance.date,
          })
        );
      }

      if (reminders.community.enabled && reminders.community.date) {
        reminderPromises.push(
          remindersApi.create(propertyId, {
            title: "Pago comunidad",
            description: "Recordatorio mensual comunidad",
            dueDate: reminders.community.date,
          })
        );
      }

      await Promise.all(reminderPromises);
      await queryClient.invalidateQueries({ queryKey: ["apartment", propertyId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear recordatorios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Recordatorios importantes</h3>
        <p className="text-sm text-muted-foreground">
          Configura avisos para no olvidar pagos recurrentes
        </p>
      </div>

      <div className="space-y-4">
        {/* IBI */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={reminders.ibi.enabled}
              onChange={() => handleToggle('ibi')}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <div className="flex-1">
              <Label className="font-medium">IBI (Impuesto Bienes Inmuebles)</Label>
              <p className="text-xs text-muted-foreground mb-2">Pago trimestral o anual</p>
              {reminders.ibi.enabled && (
                <Input
                  type="date"
                  value={reminders.ibi.date}
                  onChange={(e) => handleDateChange('ibi', e.target.value)}
                  placeholder="Próximo pago"
                  className="text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Seguro */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={reminders.insurance.enabled}
              onChange={() => handleToggle('insurance')}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <div className="flex-1">
              <Label className="font-medium">Seguro del inmueble</Label>
              <p className="text-xs text-muted-foreground mb-2">Renovación anual</p>
              {reminders.insurance.enabled && (
                <Input
                  type="date"
                  value={reminders.insurance.date}
                  onChange={(e) => handleDateChange('insurance', e.target.value)}
                  placeholder="Fecha renovación"
                  className="text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Comunidad */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={reminders.community.enabled}
              onChange={() => handleToggle('community')}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <div className="flex-1">
              <Label className="font-medium">Comunidad de propietarios</Label>
              <p className="text-xs text-muted-foreground mb-2">Pago mensual</p>
              {reminders.community.enabled && (
                <Input
                  type="date"
                  value={reminders.community.date}
                  onChange={(e) => handleDateChange('community', e.target.value)}
                  placeholder="Próximo pago"
                  className="text-sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          💡 <strong>Tip:</strong> Podrás añadir más gastos recurrentes y recordatorios después en cada inmueble.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Atrás
        </Button>
        <Button onClick={handleFinish} disabled={loading}>
          {loading ? (
            "Finalizando..."
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

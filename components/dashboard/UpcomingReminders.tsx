"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { remindersApi } from "@/lib/api";
import { Bell, CheckCircle } from "lucide-react";

interface UpcomingReminder {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
  apartmentName: string;
}

export function UpcomingReminders({ reminders }: { reminders: UpcomingReminder[] }) {
  const queryClient = useQueryClient();
  const [marking, setMarking] = useState<string | null>(null);
  const today = new Date();

  const getUrgencyVariant = (dueDate: string) => {
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "destructive";
    if (diffDays <= 7) return "orange";
    if (diffDays <= 30) return "warning";
    return "secondary";
  };

  const handleMarkAsDone = async (id: string, currentStatus: string) => {
    try {
      setMarking(id);
      const newStatus = currentStatus === 'done' ? 'pending' : 'done';
      await remindersApi.update(id, { status: newStatus });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      console.error("Error al marcar recordatorio:", err);
    } finally {
      setMarking(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-blue-500" />
          Últimos Recordatorios
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay recordatorios
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const bgColor = reminder.status === 'done' ? 'bg-green-50' :
                             reminder.status === 'dismissed' ? 'bg-gray-50 opacity-60' :
                             'bg-gray-50';
              const borderColor = reminder.status === 'done' ? 'border-green-200' :
                                 reminder.status === 'dismissed' ? 'border-gray-200' :
                                 'border';

              return (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${bgColor} ${borderColor}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">{reminder.apartmentName}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {reminder.status === 'done' && (
                      <Badge variant="success" className="text-xs">Hecho</Badge>
                    )}
                    {reminder.status === 'dismissed' && (
                      <Badge variant="secondary" className="text-xs">Omitido</Badge>
                    )}
                    <Badge variant={getUrgencyVariant(reminder.dueDate)} className="text-xs">
                      {formatDate(reminder.dueDate)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-6 w-6 p-0 ${reminder.status === 'done' ? 'text-green-700 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-100'}`}
                      onClick={() => handleMarkAsDone(reminder.id, reminder.status)}
                      disabled={marking === reminder.id}
                      title={reminder.status === 'done' ? 'Marcar como pendiente' : 'Marcar como hecho'}
                    >
                      <CheckCircle className={`h-3 w-3 ${reminder.status === 'done' ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

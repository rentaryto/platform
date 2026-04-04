import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Bell } from "lucide-react";

interface UpcomingReminder {
  id: string;
  title: string;
  dueDate: string;
  apartmentName: string;
}

export function UpcomingReminders({ reminders }: { reminders: UpcomingReminder[] }) {
  const today = new Date();

  const getUrgencyVariant = (dueDate: string) => {
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "destructive";
    if (diffDays <= 7) return "orange";
    if (diffDays <= 30) return "warning";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-blue-500" />
          Próximos Recordatorios
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay recordatorios próximos
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{reminder.title}</p>
                  <p className="text-xs text-muted-foreground">{reminder.apartmentName}</p>
                </div>
                <Badge variant={getUrgencyVariant(reminder.dueDate)} className="ml-2 flex-shrink-0 text-xs">
                  {formatDate(reminder.dueDate)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

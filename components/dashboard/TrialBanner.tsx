"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Building2 } from "lucide-react";
import type { SubscriptionStatus } from "@/lib/types";

interface Props {
  subscription: SubscriptionStatus;
}

export function TrialBanner({ subscription }: Props) {
  if (subscription.status !== 'trial') {
    return null;
  }

  const daysText = subscription.daysRemaining === 1 ? 'día' : 'días';

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-900">Período de prueba</p>
                <Badge variant="secondary" className="text-xs">
                  {subscription.daysRemaining} {daysText} restantes
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Tienes acceso completo a todas las funciones de Rentaryto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-4">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {subscription.currentProperties} / {subscription.maxProperties} inmuebles
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

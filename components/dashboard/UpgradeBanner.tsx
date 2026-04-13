"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp } from "lucide-react";
import type { SubscriptionStatus } from "@/lib/types";
import { PricingModal } from "@/components/modals/PricingModal";

interface Props {
  subscription: SubscriptionStatus;
}

export function UpgradeBanner({ subscription }: Props) {
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Solo mostrar para usuarios con plan básico activo
  if (subscription.status !== 'active' || subscription.plan !== 'basic') {
    return null;
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">Plan Básico</p>
                  <Badge variant="default" className="text-xs bg-green-600">
                    Activo
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  ¿Necesitas más inmuebles? Mejora a Profesional y gestiona hasta 10 inmuebles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:ml-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {subscription.currentProperties} / {subscription.maxProperties} inmuebles
                </span>
              </div>

              <Button
                size="sm"
                onClick={() => setPricingModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Mejorar plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PricingModal
        open={pricingModalOpen}
        onOpenChange={setPricingModalOpen}
        currentPlan={subscription.plan}
        isTrialUser={false}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Mail, Sparkles } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import { ContactModal } from "@/components/modals/ContactModal";
import type { PlanType } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: PlanType; // Plan actual del usuario (opcional)
  isTrialUser?: boolean; // Indica si el usuario está en trial
}

export function PricingModal({ open, onOpenChange, currentPlan, isTrialUser = false }: Props) {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Determinar qué planes mostrar
  const planHierarchy: PlanType[] = ["basic", "professional", "enterprise"];
  const currentPlanIndex = currentPlan ? planHierarchy.indexOf(currentPlan) : -1;

  const shouldShowPlan = (planId: PlanType): boolean => {
    // Si el usuario está en trial, mostrar todos los planes
    if (isTrialUser) return true;
    // Si no hay plan actual, mostrar todos los planes
    if (!currentPlan) return true;
    // Si tiene un plan activo, solo mostrar planes superiores
    const planIndex = planHierarchy.indexOf(planId);
    return planIndex > currentPlanIndex;
  };

  const handleActivatePlan = (planPrice: number) => {
    const subject = "Activar plan de Rentaryto";
    const body = `Hola,%0D%0A%0D%0AMe gustaría activar el plan de ${planPrice}€/mes de Rentaryto.%0D%0A%0D%0AGracias`;
    window.location.href = `mailto:info@rentaryto.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-xl">Actualizar plan</DialogTitle>
            </div>
            <DialogDescription className="text-base leading-relaxed pt-2">
              Elige el plan que mejor se adapte a tus necesidades. Puedes cambiar o cancelar en cualquier momento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 my-6">
            {/* Planes Básico y Profesional - Grid de 2 columnas en desktop */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Plan Básico */}
              {shouldShowPlan("basic") && (
                <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <CardContent className="pt-6 pb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{SUBSCRIPTION_PLANS.basic.name}</h3>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-bold text-gray-900">{SUBSCRIPTION_PLANS.basic.price}€</span>
                        <span className="text-gray-600 text-sm">/mes</span>
                      </div>
                      <p className="text-sm text-gray-600">Hasta {SUBSCRIPTION_PLANS.basic.maxProperties} inmuebles</p>
                    </div>

                    <div className="space-y-2 mb-6">
                      {SUBSCRIPTION_PLANS.basic.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleActivatePlan(SUBSCRIPTION_PLANS.basic.price)}
                    >
                      Elegir plan
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Plan Profesional */}
              {shouldShowPlan("professional") && (
                <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Más popular
                    </span>
                  </div>
                  <CardContent className="pt-6 pb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{SUBSCRIPTION_PLANS.professional.name}</h3>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-bold text-gray-900">{SUBSCRIPTION_PLANS.professional.price}€</span>
                        <span className="text-gray-600 text-sm">/mes</span>
                      </div>
                      <p className="text-sm text-gray-600">Hasta {SUBSCRIPTION_PLANS.professional.maxProperties} inmuebles</p>
                    </div>

                    <div className="space-y-2 mb-6">
                      {SUBSCRIPTION_PLANS.professional.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleActivatePlan(SUBSCRIPTION_PLANS.professional.price)}
                    >
                      Elegir plan
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Plan Empresarial - Ocupando todo el ancho pero centrado */}
            {shouldShowPlan("enterprise") && (
              <div className="flex justify-center">
                <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors w-full md:max-w-md">
                  <CardContent className="pt-6 pb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{SUBSCRIPTION_PLANS.enterprise.name}</h3>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-xl font-bold text-gray-900">Personalizado</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Más de 10 inmuebles</p>
                      <p className="text-sm text-gray-500">Precio a medida</p>
                    </div>

                    <div className="space-y-2 mb-6">
                      {SUBSCRIPTION_PLANS.enterprise.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setContactModalOpen(true)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contacta con nosotros
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-gray-500">
            Para cualquier consulta, escríbenos a{" "}
            <a href="mailto:info@rentaryto.com" className="text-blue-600 hover:underline">
              info@rentaryto.com
            </a>
          </p>
        </DialogContent>
      </Dialog>

      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </>
  );
}

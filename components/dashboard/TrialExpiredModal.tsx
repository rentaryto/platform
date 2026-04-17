"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Mail } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import { ContactModal } from "@/components/modals/ContactModal";
import type { PlanType } from "@/lib/types";

type BillingPeriod = "monthly" | "yearly";

interface Props {
  open: boolean;
}

export function TrialExpiredModal({ open }: Props) {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");

  const formatPrice = (num: number) => num.toFixed(2).replace('.', ',');

  const handleActivatePlan = (planId: PlanType) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    const price = billingPeriod === "monthly" ? plan.price : plan.priceYearly;
    const period = billingPeriod === "monthly" ? "mes" : "año";
    const subject = "Activar plan de Rentaryto";
    const body = `Hola,%0D%0A%0D%0AMe gustaría activar el plan ${plan.name} de ${formatPrice(price)}€/${period} de Rentaryto.%0D%0A%0D%0AGracias`;
    window.location.href = `mailto:info@rentaryto.com?subject=${subject}&body=${body}`;
  };

  const getDisplayPrice = (planId: PlanType) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (billingPeriod === "monthly") {
      return { price: formatPrice(plan.price), period: "/mes + iva" };
    } else {
      const monthlyEquivalent = formatPrice(plan.priceYearly / 12);
      return {
        price: monthlyEquivalent,
        period: "/mes + iva",
        yearlyTotal: formatPrice(plan.priceYearly)
      };
    }
  };

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <AlertDialogTitle className="text-xl">Período de prueba finalizado</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-relaxed pt-2">
              Tu período de prueba gratuito ha terminado. Elige el plan que mejor se adapte a tus necesidades para continuar gestionando tus inmuebles.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Toggle Mensual/Anual */}
          <div className="flex items-center justify-center gap-3 my-4">
            <Button
              variant={billingPeriod === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingPeriod("monthly")}
            >
              Mensual
            </Button>
            <Button
              variant={billingPeriod === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingPeriod("yearly")}
              className="relative"
            >
              Anual
              {billingPeriod === "yearly" && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Ahorra 2 meses
                </span>
              )}
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 my-6">
            {/* Plan Básico */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{SUBSCRIPTION_PLANS.basic.name}</h3>
                  <div className="flex flex-col items-center gap-1 mb-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-gray-900">{getDisplayPrice("basic").price}€</span>
                      <span className="text-gray-600 text-sm">{getDisplayPrice("basic").period}</span>
                    </div>
                    {billingPeriod === "yearly" && getDisplayPrice("basic").yearlyTotal && (
                      <p className="text-xs text-gray-500">Facturado anualmente ({getDisplayPrice("basic").yearlyTotal}€/año + iva)</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">Hasta {SUBSCRIPTION_PLANS.basic.maxProperties} inmueble</p>
                </div>

                <div className="space-y-2 mb-6">
                  {SUBSCRIPTION_PLANS.basic.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleActivatePlan("basic")}
                >
                  Activar plan
                </Button>
              </CardContent>
            </Card>

            {/* Plan Profesional */}
            <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Más popular
                </span>
              </div>
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{SUBSCRIPTION_PLANS.professional.name}</h3>
                  <div className="flex flex-col items-center gap-1 mb-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-gray-900">{getDisplayPrice("professional").price}€</span>
                      <span className="text-gray-600 text-sm">{getDisplayPrice("professional").period}</span>
                    </div>
                    {billingPeriod === "yearly" && getDisplayPrice("professional").yearlyTotal && (
                      <p className="text-xs text-gray-500">Facturado anualmente ({getDisplayPrice("professional").yearlyTotal}€/año + iva)</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">Hasta {SUBSCRIPTION_PLANS.professional.maxProperties} inmuebles</p>
                </div>

                <div className="space-y-2 mb-6">
                  {SUBSCRIPTION_PLANS.professional.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleActivatePlan("professional")}
                >
                  Activar plan
                </Button>
              </CardContent>
            </Card>

            {/* Plan Empresarial */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{SUBSCRIPTION_PLANS.enterprise.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-xl font-bold text-gray-900">Personalizado</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Más de 5 inmuebles</p>
                  <p className="text-xs text-gray-500">Precio a medida</p>
                </div>

                <div className="space-y-2 mb-6">
                  {SUBSCRIPTION_PLANS.enterprise.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">{feature}</span>
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

          <p className="text-xs text-center text-gray-500">
            Para cualquier consulta, escríbenos a{" "}
            <a href="mailto:info@rentaryto.com" className="text-blue-600 hover:underline">
              info@rentaryto.com
            </a>
          </p>
        </AlertDialogContent>
      </AlertDialog>

      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </>
  );
}

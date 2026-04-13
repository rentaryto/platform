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

interface Props {
  open: boolean;
}

export function TrialExpiredModal({ open }: Props) {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleActivatePlan = (planPrice: number) => {
    const subject = "Activar plan de Rentaryto";
    const body = `Hola,%0D%0A%0D%0AMe gustaría activar el plan de ${planPrice}€/mes de Rentaryto.%0D%0A%0D%0AGracias`;
    window.location.href = `mailto:info@rentaryto.com?subject=${subject}&body=${body}`;
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

          <div className="grid md:grid-cols-3 gap-4 my-6">
            {/* Plan Básico */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{SUBSCRIPTION_PLANS.basic.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{SUBSCRIPTION_PLANS.basic.price}€</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Hasta {SUBSCRIPTION_PLANS.basic.maxProperties} inmuebles</p>
                  <p className="text-xs text-gray-500">~0,97€ por piso</p>
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
                  onClick={() => handleActivatePlan(SUBSCRIPTION_PLANS.basic.price)}
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
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{SUBSCRIPTION_PLANS.professional.price}€</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Hasta {SUBSCRIPTION_PLANS.professional.maxProperties} inmuebles</p>
                  <p className="text-xs text-gray-500">~0,69€ por piso</p>
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
                  onClick={() => handleActivatePlan(SUBSCRIPTION_PLANS.professional.price)}
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
                  <p className="text-xs text-gray-600 mb-1">Más de 10 inmuebles</p>
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

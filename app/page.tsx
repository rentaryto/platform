"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Euro, FileText, BarChart3, CheckCircle, Check, Mail } from "lucide-react";
import { ContactModal } from "@/components/modals/ContactModal";

type BillingPeriod = "monthly" | "yearly";

export default function LandingPage() {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Rentaryto</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline">Iniciar sesión</Button>
            </Link>
            <Link href="/signup">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Gestión de alquileres<br />
          <span className="text-blue-600">simplificada</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          La forma más sencilla de gestionar tus pisos de alquiler.
          Controla ingresos, gastos y genera informes fiscales en minutos.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-lg px-8 py-6">
            Empezar ahora
          </Button>
        </Link>
      </section>

      {/* Características */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Todo lo que necesitas en un solo lugar
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Ingresos y gastos</h3>
              <p className="text-gray-600 text-sm">
                Controla todos tus ingresos por alquileres y gastos recurrentes o inesperados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Documentos organizados</h3>
              <p className="text-gray-600 text-sm">
                Guarda contratos, facturas y documentos. Envíalos a tus inquilinos con un clic.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Informes de Hacienda</h3>
              <p className="text-gray-600 text-sm">
                Genera informes fiscales anuales listos para tu gestor con toda la información.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Recordatorios</h3>
              <p className="text-gray-600 text-sm">
                Nunca olvides pagos de IBI, seguros o subidas de IPC con recordatorios automáticos.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Precio simple y transparente
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Elige el plan que mejor se adapte a tus necesidades
        </p>

        {/* Toggle Mensual/Anual */}
        <div className="flex items-center justify-center gap-3 mb-12">
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

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Plan Básico */}
          <Card className="border-2 border-gray-200 relative hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Básico</h3>
                <div className="flex flex-col items-center gap-1 mb-2">
                  {billingPeriod === "monthly" ? (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">1,80€</span>
                        <span className="text-gray-600">/mes + iva</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">1,50€</span>
                        <span className="text-gray-600">/mes + iva</span>
                      </div>
                      <p className="text-sm text-gray-500">Facturado anualmente (18€/año + iva)</p>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">Hasta 1 inmueble</p>
              </div>

              <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Gestión de inmuebles</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Gestión de inquilinos</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Control de gastos</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Contratos y facturas</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Envío de documentos</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Recordatorios</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Informes para Hacienda</span>
              </div>
            </div>

              <Link href="/signup">
                <Button className="w-full">
                  Empezar gratis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Plan Profesional */}
          <Card className="border-2 border-blue-500 relative hover:shadow-lg transition-shadow">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Más popular
              </span>
            </div>
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Profesional</h3>
                <div className="flex flex-col items-center gap-1 mb-2">
                  {billingPeriod === "monthly" ? (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">5,40€</span>
                        <span className="text-gray-600">/mes + iva</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">4,50€</span>
                        <span className="text-gray-600">/mes + iva</span>
                      </div>
                      <p className="text-sm text-gray-500">Facturado anualmente (54€/año + iva)</p>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">Hasta 5 inmuebles</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Gestión de inmuebles</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Gestión de inquilinos</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Control de gastos</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Contratos y facturas</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Envío de documentos</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Recordatorios</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Informes para Hacienda</span>
                </div>
              </div>

              <Link href="/signup">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Empezar gratis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Plan Empresarial */}
          <Card className="border-2 border-gray-200 relative hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Empresarial</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">Personalizado</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Más de 5 inmuebles</p>
                <p className="text-xs text-gray-500">Precio a medida</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Todo lo incluido</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Sin límite de inmuebles</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Soporte prioritario</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Funcionalidades a medida</span>
                </div>
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

        {/* Banner Trial */}
        <div className="flex justify-center mt-8">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg px-6 py-3">
            <p className="text-green-800 font-semibold text-center">
              🎉 3 meses gratis sin compromiso en cualquier plan
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Card className="bg-blue-600 text-white border-0">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para simplificar tu gestión?
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Empieza a organizar tus alquileres hoy mismo
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Acceder a Rentaryto
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2026 Rentaryto. Gestión de alquileres simplificada. Contacto: info@rentaryto.com</p>
        </div>
      </footer>

      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
}

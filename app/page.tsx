import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Euro, FileText, BarChart3, CheckCircle } from "lucide-react";

export default function LandingPage() {
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
          <p>© 2026 Rentaryto. Gestión de alquileres simplificada.</p>
        </div>
      </footer>
    </div>
  );
}

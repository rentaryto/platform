"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { dashboardApi, subscriptionApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ApartmentCard } from "@/components/dashboard/ApartmentCard";
import { PendingInvoices } from "@/components/dashboard/PendingInvoices";
import { UpcomingReminders } from "@/components/dashboard/UpcomingReminders";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { InstallAppBanner } from "@/components/dashboard/InstallAppBanner";
import { TrialExpiredModal } from "@/components/dashboard/TrialExpiredModal";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
    enabled: isAuthenticated(),
  });

  const { data: subscription, isLoading: subscriptionLoading, error: subscriptionError } = useQuery({
    queryKey: ["subscription"],
    queryFn: subscriptionApi.get,
    enabled: isAuthenticated(),
    retry: 1, // Solo reintentar una vez
  });

  // Verificar si mostrar onboarding
  useEffect(() => {
    if (data && !isLoading) {
      const hasProperties = data.apartments.length > 0;
      const onboardingCompleted = localStorage.getItem("rentaryto_onboarding_completed") === "true";

      if (!hasProperties && !onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [data, isLoading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  if (!isAuthenticated()) return null;

  // Bloquear acceso si trial ha expirado
  if (!subscriptionLoading && subscription?.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <TrialExpiredModal open={true} />
      </div>
    );
  }

  // Mostrar error si no se pudo cargar subscription
  if (!subscriptionLoading && subscriptionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error al cargar suscripción</h2>
          <p className="text-gray-600 mb-6">
            No pudimos verificar tu suscripción. Por favor, intenta recargar la página o contacta con soporte.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Resumen de tus alquileres
            </p>
          </div>

          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Cargando...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4">
              Error al cargar los datos. Intenta de nuevo.
            </div>
          )}

          {data && (
            <>
              <InstallAppBanner />

              <StatsCards
                totalMonthlyIncome={data.totalMonthlyIncome}
                totalMonthlyExpenses={data.totalMonthlyExpenses}
                monthlyProfit={data.monthlyProfit}
              />

              <div>
                <h2 className="text-lg font-semibold mb-3">Inmuebles</h2>
                {data.apartments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No tienes inmuebles registrados.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.apartments.map((apt) => (
                      <ApartmentCard key={apt.id} {...apt} />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PendingInvoices invoices={data.pendingInvoices} />
                <UpcomingReminders reminders={data.upcomingReminders} />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <MobileNav />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { tenantsApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantModal } from "@/components/modals/TenantModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import type { Tenant } from "@/lib/types";

export default function TenantsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: tenantsApi.list,
    enabled: isAuthenticated(),
  });

  const handleDeleteTenant = (tenant: Tenant) => {
    if (tenant.currentApartment) {
      setAlertMessage("No se puede eliminar un inquilino asignado. Primero quítalo del inmueble.");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Eliminar inquilino",
      description: `¿Eliminar a ${tenant.name}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await tenantsApi.delete(tenant.id);
          queryClient.invalidateQueries({ queryKey: ["tenants"] });
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (err) {
          setAlertMessage(err instanceof Error ? err.message : "Error al eliminar inquilino");
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  if (!isAuthenticated()) return null;

  const active = tenants.filter((t) => !t.leaseEndDate);
  const historical = tenants.filter((t) => !!t.leaseEndDate);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6" /> Inquilinos
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tenants.length} inquilinos registrados
              </p>
            </div>
            <Button onClick={() => { setEditingTenant(undefined); setTenantModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Añadir Inquilino
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">Cargando...</div>
          )}

          {!isLoading && (
            <>
              {/* Activos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Activos
                    <Badge variant="success">{active.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {active.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay inquilinos activos</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left pb-2 font-medium">Nombre</th>
                            <th className="text-left pb-2 font-medium">Email</th>
                            <th className="text-left pb-2 font-medium">Teléfono</th>
                            <th className="text-left pb-2 font-medium">Entrada</th>
                            <th className="text-left pb-2 font-medium">Inmueble</th>
                            <th className="text-left pb-2 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {active.map((tenant) => (
                            <tr key={tenant.id}>
                              <td className="py-3 font-medium">{tenant.name}</td>
                              <td className="py-3 text-muted-foreground">{tenant.email}</td>
                              <td className="py-3 text-muted-foreground">{tenant.phone ?? "—"}</td>
                              <td className="py-3 text-muted-foreground">{formatDate(tenant.leaseStartDate)}</td>
                              <td className="py-3">
                                {tenant.currentApartment ? (
                                  <span className="text-sm">{tenant.currentApartment.name}</span>
                                ) : (
                                  <Badge variant="warning">Sin asignar</Badge>
                                )}
                              </td>
                              <td className="py-3">
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7"
                                    onClick={() => { setEditingTenant(tenant); setTenantModalOpen(true); }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                                    onClick={() => handleDeleteTenant(tenant)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Históricos */}
              {historical.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      Histórico
                      <Badge variant="muted">{historical.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left pb-2 font-medium">Nombre</th>
                            <th className="text-left pb-2 font-medium">Email</th>
                            <th className="text-left pb-2 font-medium">Teléfono</th>
                            <th className="text-left pb-2 font-medium">Entrada</th>
                            <th className="text-left pb-2 font-medium">Salida</th>
                            <th className="text-left pb-2 font-medium">Inmueble</th>
                            <th className="text-left pb-2 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {historical.map((tenant) => (
                            <tr key={tenant.id} className="text-muted-foreground">
                              <td className="py-3 font-medium text-foreground">{tenant.name}</td>
                              <td className="py-3">{tenant.email}</td>
                              <td className="py-3">{tenant.phone ?? "—"}</td>
                              <td className="py-3">{formatDate(tenant.leaseStartDate)}</td>
                              <td className="py-3">{tenant.leaseEndDate ? formatDate(tenant.leaseEndDate) : "—"}</td>
                              <td className="py-3">
                                {tenant.apartmentHistory ? (
                                  <span className="text-sm">{tenant.apartmentHistory.name}</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-3">
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7"
                                    onClick={() => { setEditingTenant(tenant); setTenantModalOpen(true); }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                                    onClick={() => handleDeleteTenant(tenant)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <TenantModal
          tenant={editingTenant}
          open={tenantModalOpen}
          onOpenChange={setTenantModalOpen}
        />

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          variant="destructive"
          confirmText="Eliminar"
        />

        {/* Alert Dialog */}
        <ConfirmDialog
          open={!!alertMessage}
          onOpenChange={() => setAlertMessage(null)}
          title="Aviso"
          description={alertMessage || ""}
          onConfirm={() => setAlertMessage(null)}
          confirmText="Entendido"
        />
        <MobileNav />
      </main>
    </div>
  );
}

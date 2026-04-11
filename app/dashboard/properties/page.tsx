"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { apartmentsApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyModal } from "@/components/modals/PropertyModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatEuro } from "@/lib/utils";
import { Building2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import type { ApartmentSummary } from "@/lib/types";

export default function PropertiesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<ApartmentSummary | undefined>();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: "default" | "destructive";
    loading?: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirmar",
    variant: "default",
    loading: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["apartments"],
    queryFn: apartmentsApi.list,
    enabled: isAuthenticated(),
  });

  const handleDeleteProperty = (property: ApartmentSummary) => {
    setConfirmDialog({
      open: true,
      title: "Eliminar inmueble",
      description: `¿Eliminar ${property.name}? Se eliminarán todos los gastos, documentos y recordatorios asociados. Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
          await apartmentsApi.delete(property.id);
          queryClient.invalidateQueries({ queryKey: ["apartments"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
        } catch (err) {
          setAlertMessage(err instanceof Error ? err.message : "Error al eliminar inmueble");
          setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  if (!isAuthenticated()) return null;

  const occupied = properties.filter((p) => p.status === "occupied");
  const vacant = properties.filter((p) => p.status === "vacant");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-6 w-6" /> Inmuebles
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {properties.length} inmuebles registrados
              </p>
            </div>
            <Button onClick={() => { setEditingProperty(undefined); setPropertyModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Añadir Inmueble
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">Cargando...</div>
          )}

          {!isLoading && (
            <>
              {/* Ocupados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Ocupados
                    <Badge variant="success">{occupied.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {occupied.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay inmuebles ocupados</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left pb-2 font-medium">Nombre</th>
                            <th className="text-left pb-2 font-medium">Dirección</th>
                            <th className="text-left pb-2 font-medium">Renta</th>
                            <th className="text-left pb-2 font-medium">Inquilino</th>
                            <th className="text-left pb-2 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {occupied.map((property) => (
                            <tr key={property.id}>
                              <td className="py-3 font-medium">{property.name}</td>
                              <td className="py-3 text-muted-foreground">{property.address}</td>
                              <td className="py-3 font-semibold">{formatEuro(property.rentAmount)}</td>
                              <td className="py-3">
                                {property.currentTenant ? (
                                  <span className="text-sm">{property.currentTenant.name}</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-3">
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7"
                                    onClick={() => router.push(`/dashboard/apartments/${property.id}`)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7"
                                    onClick={() => { setEditingProperty(property); setPropertyModalOpen(true); }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                                    onClick={() => handleDeleteProperty(property)}>
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

              {/* Vacíos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Vacíos
                    <Badge variant="warning">{vacant.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vacant.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay inmuebles vacíos</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left pb-2 font-medium">Nombre</th>
                            <th className="text-left pb-2 font-medium">Dirección</th>
                            <th className="text-left pb-2 font-medium">Renta</th>
                            <th className="text-left pb-2 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {vacant.map((property) => (
                            <tr key={property.id}>
                              <td className="py-3 font-medium">{property.name}</td>
                              <td className="py-3 text-muted-foreground">{property.address}</td>
                              <td className="py-3 font-semibold">{formatEuro(property.rentAmount)}</td>
                              <td className="py-3">
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7"
                                    onClick={() => router.push(`/dashboard/apartments/${property.id}`)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7"
                                    onClick={() => { setEditingProperty(property); setPropertyModalOpen(true); }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                                    onClick={() => handleDeleteProperty(property)}>
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
            </>
          )}
        </div>

        <PropertyModal
          property={editingProperty}
          open={propertyModalOpen}
          onOpenChange={setPropertyModalOpen}
        />

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          variant={confirmDialog.variant}
          confirmText={confirmDialog.confirmText}
          loading={confirmDialog.loading}
        />

        {/* Alert Dialog */}
        <ConfirmDialog
          open={!!alertMessage}
          onOpenChange={() => setAlertMessage(null)}
          title="Error"
          description={alertMessage || ""}
          onConfirm={() => setAlertMessage(null)}
          confirmText="Entendido"
        />
        <MobileNav />
      </main>
    </div>
  );
}

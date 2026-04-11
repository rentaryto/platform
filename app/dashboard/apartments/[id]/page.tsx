"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { apartmentsApi, recurringExpensesApi, unexpectedExpensesApi, documentsApi, remindersApi, tenantsApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignTenantModal } from "@/components/modals/AssignTenantModal";
import { EditRentModal } from "@/components/modals/EditRentModal";
import { RecurringExpenseModal } from "@/components/modals/RecurringExpenseModal";
import { UnexpectedExpenseModal } from "@/components/modals/UnexpectedExpenseModal";
import { DocumentModal } from "@/components/modals/DocumentModal";
import { ReminderModal } from "@/components/modals/ReminderModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatEuro, formatDate, frequencyLabels, documentTypeLabels, sendStatusLabels, paidStatusLabels, groupDocumentsByMonthYear, calculateMonthlyExpenses } from "@/lib/utils";
import { getDocumentIcon, getDocumentIconColor, getDocumentLabel } from "@/lib/document-icons";
import type { RecurringExpense, Reminder } from "@/lib/types";
import {
  Home, User, MapPin, Euro, Plus, Pencil, Trash2, Send,
  CheckCircle, ArrowLeft, TrendingUp, TrendingDown, Download, DollarSign
} from "lucide-react";

export default function ApartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [assignOpen, setAssignOpen] = useState(false);
  const [editRentOpen, setEditRentOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | undefined>();
  const [unexpectedOpen, setUnexpectedOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>();

  // Confirm dialogs
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

  const { data: apartment, isLoading, error } = useQuery({
    queryKey: ["apartment", id],
    queryFn: () => apartmentsApi.get(id),
    enabled: isAuthenticated() && !!id,
  });

  const handleRemoveTenant = () => {
    setConfirmDialog({
      open: true,
      title: "Quitar inquilino",
      description: "¿Seguro que quieres quitar al inquilino? Esta acción marcará el inmueble como vacío.",
      onConfirm: async () => {
        await tenantsApi.remove(id);
        queryClient.invalidateQueries({ queryKey: ["apartment", id] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleDeleteRecurring = (expenseId: string) => {
    setConfirmDialog({
      open: true,
      title: "Eliminar gasto recurrente",
      description: "¿Eliminar este gasto recurrente? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await recurringExpensesApi.delete(expenseId);
        queryClient.invalidateQueries({ queryKey: ["apartment", id] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleDeleteUnexpected = (expenseId: string) => {
    setConfirmDialog({
      open: true,
      title: "Eliminar gasto",
      description: "¿Eliminar este gasto inesperado? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await unexpectedExpensesApi.delete(expenseId);
        queryClient.invalidateQueries({ queryKey: ["apartment", id] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleSendDocument = (docId: string, tenantName: string, tenantEmail: string) => {
    setConfirmDialog({
      open: true,
      title: "Enviar factura",
      description: `¿Enviar esta factura a ${tenantName} (${tenantEmail})?`,
      onConfirm: async () => {
        await documentsApi.send(docId);
        queryClient.invalidateQueries({ queryKey: ["apartment", id] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleTogglePaidStatus = (docId: string, currentStatus: string, fileName: string) => {
    const willBePaid = currentStatus !== "paid";
    setConfirmDialog({
      open: true,
      title: willBePaid ? "Marcar como pagada" : "Marcar como no pagada",
      description: willBePaid
        ? `¿Marcar "${fileName}" como pagada?`
        : `¿Marcar "${fileName}" como no pagada?`,
      onConfirm: async () => {
        await documentsApi.markAsPaid(docId, willBePaid);
        queryClient.invalidateQueries({ queryKey: ["apartment", id] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleDownloadDocument = async (docId: string) => {
    try {
      const { url } = await documentsApi.getSignedUrl(docId);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setConfirmDialog({
      open: true,
      title: "Eliminar documento",
      description: "¿Eliminar este documento? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await documentsApi.delete(docId);
        queryClient.invalidateQueries({ queryKey: ["apartment", id] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleToggleReminderStatus = async (reminderId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await remindersApi.update(reminderId, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["apartment", id] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const handleDeleteReminder = (reminderId: string) => {
    setConfirmDialog({
      open: true,
      title: "Eliminar recordatorio",
      description: "¿Eliminar este recordatorio? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await remindersApi.delete(reminderId);
        queryClient.invalidateQueries({ queryKey: ["apartment", id] });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isLoading ? "Cargando..." : apartment?.name}
              </h1>
              {apartment && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {apartment.address}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4">
              Error al cargar el inmueble.
            </div>
          )}

          {apartment && (
            <>
              {/* Info + Inquilino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Home className="h-4 w-4" /> Información
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estado</span>
                      <Badge variant={apartment.status === "occupied" ? "success" : "warning"}>
                        {apartment.status === "occupied" ? "Ocupado" : "Vacío"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Euro className="h-3 w-3" /> Renta mensual
                      </span>
                      <span className="text-sm font-semibold">{formatEuro(apartment.rentAmount)}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditRentOpen(true)}>
                      <Pencil className="h-3 w-3 mr-1" /> Editar Renta
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" /> Inquilino
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {apartment.currentTenant ? (
                      <>
                        <div>
                          <p className="font-medium">{apartment.currentTenant.name}</p>
                          <p className="text-sm text-muted-foreground">{apartment.currentTenant.email}</p>
                          {apartment.currentTenant.phone && (
                            <p className="text-sm text-muted-foreground">{apartment.currentTenant.phone}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Desde {formatDate(apartment.currentTenant.leaseStartDate)}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)} className="w-full sm:w-auto">
                            <Pencil className="h-3 w-3 mr-1" /> Cambiar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={handleRemoveTenant} className="w-full sm:w-auto">
                            Quitar Inquilino
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Sin inquilino asignado</p>
                        <Button size="sm" onClick={() => setAssignOpen(true)}>
                          <Plus className="h-3 w-3 mr-1" /> Asignar Inquilino
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Rendimiento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" /> Rendimiento del Inmueble
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const monthlyExpenses = calculateMonthlyExpenses(apartment.recurringExpenses);
                    const monthlyProfit = apartment.rentAmount - monthlyExpenses;
                    const profitPercentage = apartment.rentAmount > 0
                      ? ((monthlyProfit / apartment.rentAmount) * 100).toFixed(1)
                      : "0.0";

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Ingresos
                          </p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatEuro(apartment.rentAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">mensual</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" /> Gastos
                          </p>
                          <p className="text-lg font-semibold text-red-600">
                            {formatEuro(monthlyExpenses)}
                          </p>
                          <p className="text-xs text-muted-foreground">mensual</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Euro className="h-3 w-3" /> Beneficio Neto
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className={`text-lg font-semibold ${
                              monthlyProfit >= 0 ? "text-blue-600" : "text-red-600"
                            }`}>
                              {formatEuro(monthlyProfit)}
                            </p>
                            <span className={`text-sm font-medium ${
                              monthlyProfit >= 0 ? "text-blue-500" : "text-red-500"
                            }`}>
                              {profitPercentage}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">rendimiento</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Recordatorios */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Recordatorios</CardTitle>
                  <Button size="sm" onClick={() => { setEditingReminder(undefined); setReminderOpen(true); }}>
                    <Plus className="h-3 w-3 mr-1" /> Añadir
                  </Button>
                </CardHeader>
                <CardContent>
                  {apartment.reminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay recordatorios</p>
                  ) : (
                    <div className="space-y-2">
                      {apartment.reminders
                        .sort((a, b) => {
                          // Primero los pending, luego los done
                          if (a.status === "pending" && b.status !== "pending") return -1;
                          if (a.status !== "pending" && b.status === "pending") return 1;
                          // Dentro del mismo estado, ordenar por fecha
                          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        })
                        .map((rem) => {
                          const isDone = rem.status === "done";
                          return (
                            <div
                              key={rem.id}
                              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${
                                isDone ? "bg-gray-50/50 border-gray-200 opacity-60" : "bg-gray-50 border-gray-300"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-medium ${isDone ? "line-through text-gray-500" : ""}`}>
                                    {rem.title}
                                  </span>
                                  {isDone && (
                                    <Badge variant="success">Hecho</Badge>
                                  )}
                                </div>
                                {rem.description && (
                                  <p className={`text-xs mt-1 ${isDone ? "text-gray-400" : "text-muted-foreground"}`}>
                                    {rem.description}
                                  </p>
                                )}
                                <p className={`text-xs mt-1 ${isDone ? "text-gray-400" : "text-muted-foreground"}`}>
                                  {formatDate(rem.dueDate)}
                                </p>
                              </div>
                              <div className="flex gap-1 justify-end sm:justify-start">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-7 sm:w-7"
                                  title="Editar"
                                  onClick={() => { setEditingReminder(rem); setReminderOpen(true); }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 sm:h-7 sm:w-7 ${isDone ? "text-gray-400" : "text-green-600"}`}
                                  title={isDone ? "Marcar como pendiente" : "Marcar como hecho"}
                                  onClick={() => handleToggleReminderStatus(rem.id, rem.status)}
                                >
                                  <CheckCircle className={`h-3 w-3 ${isDone ? "fill-current" : ""}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-7 sm:w-7 text-red-500"
                                  title="Eliminar"
                                  onClick={() => handleDeleteReminder(rem.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gastos Recurrentes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Gastos Recurrentes</CardTitle>
                  <Button size="sm" onClick={() => { setEditingExpense(undefined); setRecurringOpen(true); }}>
                    <Plus className="h-3 w-3 mr-1" /> Añadir
                  </Button>
                </CardHeader>
                <CardContent>
                  {apartment.recurringExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay gastos recurrentes</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left pb-2 font-medium">Nombre</th>
                            <th className="text-right pb-2 font-medium">Cantidad</th>
                            <th className="text-center pb-2 font-medium">Frecuencia</th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {apartment.recurringExpenses.map((exp) => (
                            <tr key={exp.id}>
                              <td className="py-2">{exp.name}</td>
                              <td className="py-2 text-right font-medium">{formatEuro(exp.amount)}</td>
                              <td className="py-2 text-center">
                                <Badge variant="secondary">{frequencyLabels[exp.frequency]}</Badge>
                              </td>
                              <td className="py-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7"
                                    onClick={() => { setEditingExpense(exp); setRecurringOpen(true); }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7 text-red-500"
                                    onClick={() => handleDeleteRecurring(exp.id)}>
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

              {/* Gastos Inesperados */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Gastos Inesperados</CardTitle>
                  <Button size="sm" onClick={() => setUnexpectedOpen(true)}>
                    <Plus className="h-3 w-3 mr-1" /> Añadir
                  </Button>
                </CardHeader>
                <CardContent>
                  {apartment.unexpectedExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay gastos inesperados</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left pb-2 font-medium">Descripción</th>
                            <th className="text-right pb-2 font-medium">Cantidad</th>
                            <th className="text-center pb-2 font-medium">Fecha</th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {apartment.unexpectedExpenses.map((exp) => (
                            <tr key={exp.id}>
                              <td className="py-2">{exp.description}</td>
                              <td className="py-2 text-right font-medium text-red-600">{formatEuro(exp.amount)}</td>
                              <td className="py-2 text-center text-muted-foreground">{formatDate(exp.date)}</td>
                              <td className="py-2 text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7 text-red-500"
                                  onClick={() => handleDeleteUnexpected(exp.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documentos facturas y otros */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Documentos, facturas u otros</CardTitle>
                  <Button size="sm" onClick={() => setDocumentOpen(true)}>
                    <Plus className="h-3 w-3 mr-1" /> Subir
                  </Button>
                </CardHeader>
                <CardContent>
                  {apartment.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay documentos</p>
                  ) : (
                    <div className="space-y-4">
                      {groupDocumentsByMonthYear(apartment.documents).map((group) => (
                        <div key={group.key}>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">{group.label}</h3>
                          <div className="space-y-2">
                            {group.documents.map((doc) => {
                              const Icon = getDocumentIcon(doc.type, doc.subtype);
                              const iconColor = getDocumentIconColor(doc.type, doc.subtype);
                              const label = getDocumentLabel(doc.type, doc.subtype);
                              const isPaid = doc.paidStatus === "paid";
                              const isInvoice = doc.type === "invoice";

                              return (
                                <div key={doc.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${
                                  isPaid ? "bg-gray-50/50 border-gray-200 opacity-70" : "bg-gray-50"
                                }`}>
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`${iconColor} mt-0.5 ${isPaid ? "opacity-60" : ""}`}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary">{label}</Badge>
                                        <span className={`text-sm font-medium truncate ${isPaid ? "line-through text-gray-500" : ""}`}>
                                          {doc.fileName}
                                        </span>
                                      </div>
                                      {doc.description && (
                                        <p className={`text-xs mt-1 ${isPaid ? "text-gray-400" : "text-muted-foreground"}`}>
                                          {doc.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {doc.sendStatus !== "not_applicable" && (
                                          <Badge variant={doc.sendStatus === "sent" ? "success" : "orange"}>
                                            {sendStatusLabels[doc.sendStatus]}
                                          </Badge>
                                        )}
                                        {doc.paidStatus !== "not_applicable" && (
                                          <Badge variant={doc.paidStatus === "paid" ? "success" : "warning"}>
                                            {paidStatusLabels[doc.paidStatus]}
                                          </Badge>
                                        )}
                                        <span className={`text-xs ${isPaid ? "text-gray-400" : "text-muted-foreground"}`}>
                                          {doc.startDate && doc.endDate
                                            ? `${formatDate(doc.startDate)} - ${formatDate(doc.endDate)}`
                                            : doc.startDate
                                            ? formatDate(doc.startDate)
                                            : doc.endDate
                                            ? formatDate(doc.endDate)
                                            : formatDate(doc.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 justify-end sm:justify-start">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 sm:h-7 sm:w-7"
                                      onClick={() => handleDownloadDocument(doc.id)}
                                      title="Descargar"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                    {isInvoice && doc.sendStatus !== "sent" && apartment.currentTenant && (
                                      <Button variant="outline" size="icon" className="h-8 w-8 sm:h-7 sm:w-7"
                                        onClick={() => handleSendDocument(doc.id, apartment.currentTenant!.name, apartment.currentTenant!.email)}
                                        title="Enviar al inquilino">
                                        <Send className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {isInvoice && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 sm:h-7 sm:w-7 ${isPaid ? "text-gray-400" : "text-green-600"}`}
                                        onClick={() => handleTogglePaidStatus(doc.id, doc.paidStatus, doc.fileName)}
                                        title={isPaid ? "Marcar como no pagada" : "Marcar como pagada"}
                                      >
                                        <DollarSign className={`h-3 w-3 ${isPaid ? "fill-current" : ""}`} />
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7 text-red-500"
                                      onClick={() => handleDeleteDocument(doc.id)}
                                      title="Eliminar">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Modales */}
        {apartment && (
          <>
            <AssignTenantModal
              apartmentId={id}
              open={assignOpen}
              onOpenChange={setAssignOpen}
            />
            <EditRentModal
              apartmentId={id}
              currentRent={apartment.rentAmount}
              open={editRentOpen}
              onOpenChange={setEditRentOpen}
            />
            <RecurringExpenseModal
              apartmentId={id}
              expense={editingExpense}
              open={recurringOpen}
              onOpenChange={setRecurringOpen}
            />
            <UnexpectedExpenseModal
              apartmentId={id}
              open={unexpectedOpen}
              onOpenChange={setUnexpectedOpen}
            />
            <DocumentModal
              apartmentId={id}
              hasTenant={!!apartment.currentTenant}
              open={documentOpen}
              onOpenChange={setDocumentOpen}
            />
            <ReminderModal
              apartmentId={id}
              reminder={editingReminder}
              open={reminderOpen}
              onOpenChange={setReminderOpen}
            />
          </>
        )}

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
        <MobileNav />
      </main>
    </div>
  );
}

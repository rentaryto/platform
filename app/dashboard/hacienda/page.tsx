"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { taxReportApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatEuro, formatDate, frequencyLabels } from "@/lib/utils";
import { FileText, Download, TrendingUp, TrendingDown, Euro } from "lucide-react";

export default function HaciendaPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  const { data: report, isLoading } = useQuery({
    queryKey: ["tax-report", selectedYear],
    queryFn: () => taxReportApi.get(selectedYear),
    enabled: isAuthenticated(),
  });

  const handleDownloadPDF = () => {
    if (!report) return;

    // Crear contenido del PDF
    const content = generatePDFContent(report);

    // Crear un blob con el contenido
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Descargar
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-fiscal-${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDFContent = (report: any) => {
    let content = `INFORME FISCAL AÑO ${report.year}\n`;
    content += `===============================\n\n`;

    content += `RESUMEN GENERAL\n`;
    content += `---------------\n`;
    content += `Total ingresos año: ${formatEuro(report.summary.totalIncome)}\n`;
    content += `Total gastos deducibles: ${formatEuro(report.summary.totalExpenses)}\n`;
    content += `Rendimiento neto: ${formatEuro(report.summary.netProfit)}\n\n`;

    report.properties.forEach((property: any, index: number) => {
      content += `\n${'='.repeat(60)}\n`;
      content += `INMUEBLE ${index + 1}: ${property.name}\n`;
      content += `${'='.repeat(60)}\n\n`;

      content += `Dirección: ${property.address}\n`;
      if (property.cadastralReference) {
        content += `Referencia Catastral: ${property.cadastralReference}\n`;
      }
      content += `Estado: ${property.status === 'occupied' ? 'Ocupado' : 'Vacío'}\n\n`;

      if (property.tenant) {
        content += `INQUILINO\n`;
        content += `---------\n`;
        content += `Nombre: ${property.tenant.name}\n`;
        content += `Email: ${property.tenant.email}\n`;
        content += `Periodo: ${formatDate(property.tenant.leaseStart)}`;
        if (property.tenant.leaseEnd) {
          content += ` - ${formatDate(property.tenant.leaseEnd)}`;
        } else {
          content += ` - Actualidad`;
        }
        content += `\n\n`;
      }

      content += `INGRESOS\n`;
      content += `--------\n`;
      property.income.monthly.forEach((m: any) => {
        if (m.amount > 0) {
          content += `${m.month}: ${formatEuro(m.amount)}\n`;
        }
      });
      content += `Total ingresos: ${formatEuro(property.income.total)}\n\n`;

      content += `GASTOS DEDUCIBLES\n`;
      content += `-----------------\n`;

      if (property.expenses.recurring.length > 0) {
        content += `Gastos recurrentes:\n`;
        property.expenses.recurring.forEach((exp: any) => {
          content += `  ${exp.name} (${frequencyLabels[exp.frequency]}): ${formatEuro(exp.amount)} × ${
            exp.frequency === 'monthly' ? 12 :
            exp.frequency === 'quarterly' ? 4 :
            exp.frequency === 'semiannual' ? 2 : 1
          } = ${formatEuro(exp.annualTotal)}\n`;
        });
      }

      if (property.expenses.unexpected.length > 0) {
        content += `\nGastos inesperados:\n`;
        property.expenses.unexpected.forEach((exp: any) => {
          content += `  ${formatDate(exp.date)}: ${exp.description} - ${formatEuro(exp.amount)}\n`;
        });
      }

      content += `\nTotal gastos: ${formatEuro(property.expenses.total)}\n`;
      content += `\nRENDIMIENTO NETO: ${formatEuro(property.netProfit)}\n`;
    });

    content += `\n\n${'='.repeat(60)}\n`;
    content += `Documento generado desde Rentaryto\n`;
    content += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
    content += `${'='.repeat(60)}\n`;

    return content;
  };

  if (!isAuthenticated()) return null;

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6" /> Informe Fiscal
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Resumen anual para declaración de IRPF
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {report && (
                <Button onClick={handleDownloadPDF} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Informe
                </Button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">Cargando...</div>
          )}

          {report && (
            <>
              {/* Resumen General */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen General {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Total Ingresos
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatEuro(report.summary.totalIncome)}
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 text-sm text-red-700 mb-1">
                        <TrendingDown className="h-4 w-4" />
                        Total Gastos Deducibles
                      </div>
                      <p className="text-2xl font-bold text-red-600">
                        {formatEuro(report.summary.totalExpenses)}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                        <Euro className="h-4 w-4" />
                        Rendimiento Neto
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatEuro(report.summary.netProfit)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalle por Inmueble */}
              {report.properties.map((property: any) => (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{property.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
                        {property.cadastralReference && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Ref. Catastral: {property.cadastralReference}
                          </p>
                        )}
                      </div>
                      <Badge variant={property.status === "occupied" ? "success" : "warning"}>
                        {property.status === "occupied" ? "Ocupado" : "Vacío"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Inquilino */}
                    {property.tenant && (
                      <div className="pb-4 border-b">
                        <h4 className="text-sm font-semibold mb-2">Inquilino</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Nombre:</strong> {property.tenant.name}</p>
                          <p><strong>Email:</strong> {property.tenant.email}</p>
                          <p><strong>Periodo:</strong> {formatDate(property.tenant.leaseStart)} {property.tenant.leaseEnd ? `- ${formatDate(property.tenant.leaseEnd)}` : '- Actualidad'}</p>
                        </div>
                      </div>
                    )}

                    {/* Ingresos */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Ingresos Mensuales</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                        {property.income.monthly.map((m: any, idx: number) => (
                          <div key={idx} className={m.amount > 0 ? "" : "text-muted-foreground"}>
                            <span className="text-xs">{m.month.split(' ')[0]}:</span>{" "}
                            <span className="font-medium">{m.amount > 0 ? formatEuro(m.amount) : "—"}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between flex-wrap gap-2">
                        <span className="font-semibold">Total Ingresos:</span>
                        <span className="font-bold text-green-600">{formatEuro(property.income.total)}</span>
                      </div>
                    </div>

                    {/* Gastos */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Gastos Deducibles</h4>

                      {property.expenses.recurring.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Gastos recurrentes:</p>
                          <div className="space-y-1 text-sm">
                            {property.expenses.recurring.map((exp: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span>
                                  {exp.name} <span className="text-muted-foreground">({frequencyLabels[exp.frequency]})</span>
                                </span>
                                <span className="font-medium">{formatEuro(exp.annualTotal)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {property.expenses.unexpected.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Gastos inesperados:</p>
                          <div className="space-y-1 text-sm">
                            {property.expenses.unexpected.map((exp: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span>
                                  {formatDate(exp.date)} - {exp.description}
                                </span>
                                <span className="font-medium">{formatEuro(exp.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t flex justify-between">
                        <span className="font-semibold">Total Gastos:</span>
                        <span className="font-bold text-red-600">{formatEuro(property.expenses.total)}</span>
                      </div>
                    </div>

                    {/* Rendimiento Neto */}
                    <div className="pt-3 border-t bg-blue-50 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Rendimiento Neto:</span>
                        <span className={`font-bold text-2xl ${property.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatEuro(property.netProfit)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { documentsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { FileText, Send } from "lucide-react";

interface PendingInvoice {
  id: string;
  apartmentName: string;
  fileName: string;
  sendStatus: string;
  paidStatus: string;
  createdAt: string;
}

export function PendingInvoices({ invoices }: { invoices: PendingInvoice[] }) {
  const queryClient = useQueryClient();
  const [sending, setSending] = useState<string | null>(null);

  const handleSend = async (id: string) => {
    try {
      setSending(id);
      await documentsApi.send(id);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      console.error("Error al enviar factura:", err);
    } finally {
      setSending(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-orange-500" />
          Últimas Facturas
          {invoices.length > 0 && (
            <Badge variant="orange">{invoices.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay facturas pendientes
          </p>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{invoice.fileName}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {invoice.sendStatus === 'pending' && (
                      <Badge variant="orange" className="text-xs">Pendiente envío</Badge>
                    )}
                    {invoice.paidStatus === 'unpaid' && (
                      <Badge variant="destructive" className="text-xs">No pagada</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{invoice.apartmentName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                </div>
                {invoice.sendStatus === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto flex-shrink-0 border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => handleSend(invoice.id)}
                    disabled={sending === invoice.id}
                  >
                    <Send className="h-3 w-3 sm:mr-1" />
                    <span className="ml-1">{sending === invoice.id ? "Enviando..." : "Enviar"}</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
            {invoices.map((invoice) => {
              const bgColor = invoice.paidStatus === 'paid' ? 'bg-green-50' : 'bg-orange-50';
              const borderColor = invoice.paidStatus === 'paid' ? 'border-green-200' : 'border-orange-100';

              return (
                <div
                  key={invoice.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${bgColor} ${borderColor}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{invoice.fileName}</p>
                    <p className="text-xs text-muted-foreground">{invoice.apartmentName}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {invoice.sendStatus === 'pending' && (
                      <Badge variant="orange" className="text-xs">Pendiente envío</Badge>
                    )}
                    {invoice.paidStatus === 'unpaid' && (
                      <Badge variant="destructive" className="text-xs">No pagada</Badge>
                    )}
                    {invoice.paidStatus === 'paid' && (
                      <Badge variant="success" className="text-xs">Pagada</Badge>
                    )}
                    {invoice.sendStatus === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-orange-700 hover:bg-orange-100"
                        onClick={() => handleSend(invoice.id)}
                        disabled={sending === invoice.id}
                        title="Enviar factura"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

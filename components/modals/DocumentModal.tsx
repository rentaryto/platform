"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { documentsApi } from "@/lib/api";

interface Props {
  apartmentId: string;
  hasTenant: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentModal({ apartmentId, hasTenant, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState("contract");
  const [subtype, setSubtype] = useState("other");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Selecciona un archivo");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("type", type);
      if (type === "invoice") {
        formData.append("subtype", subtype);
      }
      formData.append("description", description);
      if (startDate) formData.append("startDate", startDate);
      if (endDate) formData.append("endDate", endDate);
      formData.append("file", file);
      if (type === "invoice") {
        formData.append("sendNow", String(sendNow));
      }
      await documentsApi.upload(apartmentId, formData);
      await queryClient.invalidateQueries({ queryKey: ["apartment", apartmentId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setType("contract");
      setSubtype("other");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setSendNow(false);
      if (fileRef.current) fileRef.current.value = "";
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir Documento, facturas u otros</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Factura</SelectItem>
                <SelectItem value="contract">Contrato</SelectItem>
                <SelectItem value="contract_extension">Ampliación de contrato</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "invoice" && (
            <div className="space-y-2">
              <Label>Tipo de factura</Label>
              <Select value={subtype} onValueChange={setSubtype}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water">💧 Agua</SelectItem>
                  <SelectItem value="electricity">⚡ Luz</SelectItem>
                  <SelectItem value="gas">🔥 Gas</SelectItem>
                  <SelectItem value="other">📄 Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Input
              placeholder="Descripción del documento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha inicio (opcional)</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha fin (opcional)</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Archivo</Label>
            <Input type="file" ref={fileRef} />
          </div>
          {type === "invoice" && hasTenant && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={sendNow}
                onChange={(e) => setSendNow(e.target.checked)}
                className="h-4 w-4"
              />
              ¿Enviar ahora al inquilino?
            </label>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Subiendo..." : "Subir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

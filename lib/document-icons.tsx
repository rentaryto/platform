import {
  FileText,
  Droplet,
  Zap,
  Flame,
  Receipt,
  FileSignature,
  FilePlus,
  File,
} from "lucide-react";

export function getDocumentIcon(type: string, subtype?: string | null) {
  // Facturas con subtipo
  if (type === "invoice") {
    switch (subtype) {
      case "water":
        return Droplet;
      case "electricity":
        return Zap;
      case "gas":
        return Flame;
      default:
        return Receipt;
    }
  }

  // Otros tipos
  switch (type) {
    case "contract":
      return FileSignature;
    case "contract_extension":
      return FilePlus;
    case "other":
      return File;
    default:
      return FileText;
  }
}

export function getDocumentIconColor(type: string, subtype?: string | null): string {
  // Facturas con subtipo
  if (type === "invoice") {
    switch (subtype) {
      case "water":
        return "text-blue-500";
      case "electricity":
        return "text-yellow-500";
      case "gas":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  }

  // Otros tipos
  switch (type) {
    case "contract":
      return "text-green-600";
    case "contract_extension":
      return "text-purple-600";
    case "other":
      return "text-gray-500";
    default:
      return "text-blue-500";
  }
}

export function getDocumentLabel(type: string, subtype?: string | null): string {
  if (type === "invoice" && subtype) {
    const subtypeLabels: Record<string, string> = {
      water: "Agua",
      electricity: "Luz",
      gas: "Gas",
      other: "Otros",
    };
    return `Factura ${subtypeLabels[subtype] || ""}`;
  }

  const typeLabels: Record<string, string> = {
    contract: "Contrato",
    contract_extension: "Ampliación",
    invoice: "Factura",
    other: "Otro",
  };

  return typeLabels[type] || type;
}

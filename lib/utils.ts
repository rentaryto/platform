import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const frequencyLabels: Record<string, string> = {
  monthly: "Mensual",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

export const documentTypeLabels: Record<string, string> = {
  contract: "Contrato",
  contract_extension: "Ampliación",
  invoice: "Factura",
  other: "Otro",
};

export const invoiceSubtypeLabels: Record<string, string> = {
  water: "Agua",
  electricity: "Luz",
  gas: "Gas",
  other: "Otros",
};

export const sendStatusLabels: Record<string, string> = {
  not_applicable: "N/A",
  pending: "Pendiente",
  sent: "Enviado",
};

export function groupDocumentsByMonthYear(documents: any[]) {
  const grouped: Record<string, any[]> = {};

  documents.forEach(doc => {
    // Usar startDate si existe, sino usar createdAt
    const date = doc.startDate ? new Date(doc.startDate) : new Date(doc.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(doc);
  });

  // Ordenar los grupos por fecha (más reciente primero)
  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return sortedKeys.map(key => {
    const [year, month] = key.split("-");
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return {
      key,
      label: `${monthNames[parseInt(month) - 1]} ${year}`,
      documents: grouped[key],
    };
  });
}

export function calculateMonthlyExpenses(recurringExpenses: any[]): number {
  return recurringExpenses.reduce((total, expense) => {
    const amount = parseFloat(expense.amount);
    switch (expense.frequency) {
      case "monthly":
        return total + amount;
      case "quarterly":
        return total + amount / 3;
      case "semiannual":
        return total + amount / 6;
      case "annual":
        return total + amount / 12;
      default:
        return total;
    }
  }, 0);
}

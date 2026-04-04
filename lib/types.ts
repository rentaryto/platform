export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  leaseStartDate: string;
  leaseEndDate?: string;
  createdAt?: string;
  apartmentId?: string;
  currentApartment?: { id: string; name: string } | null;
  apartmentHistory?: { id: string; name: string } | null;
}

export interface RecurringExpense {
  id: string;
  apartmentId: string;
  name: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "semiannual" | "annual";
  createdAt?: string;
}

export interface UnexpectedExpense {
  id: string;
  apartmentId: string;
  description: string;
  amount: number;
  date: string;
  createdAt?: string;
}

export interface Document {
  id: string;
  apartmentId: string;
  type: "contract" | "contract_extension" | "invoice" | "other";
  fileName: string;
  fileUrl: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  sendStatus: "not_applicable" | "pending" | "sent";
  sentAt?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  apartmentId: string;
  title: string;
  description?: string;
  dueDate: string;
  type: "auto_ipc" | "custom";
  status: "pending" | "done" | "dismissed";
  createdAt?: string;
}

export interface ApartmentSummary {
  id: string;
  name: string;
  address: string;
  cadastralReference?: string | null;
  rentAmount: number;
  status: "occupied" | "vacant";
  currentTenant: { id: string; name: string; email: string } | null;
}

export interface ApartmentDetail {
  id: string;
  name: string;
  address: string;
  cadastralReference?: string | null;
  rentAmount: number;
  status: "occupied" | "vacant";
  currentTenant: Tenant | null;
  recurringExpenses: RecurringExpense[];
  unexpectedExpenses: UnexpectedExpense[];
  documents: Document[];
  reminders: Reminder[];
}

export interface DashboardData {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlyProfit: number;
  apartments: Array<{
    id: string;
    name: string;
    status: "occupied" | "vacant";
    tenantName: string | null;
    rentAmount: number;
  }>;
  pendingInvoices: Array<{
    id: string;
    apartmentName: string;
    fileName: string;
    createdAt: string;
  }>;
  upcomingReminders: Array<{
    id: string;
    title: string;
    dueDate: string;
    apartmentName: string;
  }>;
}

export interface TaxReportData {
  year: number;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
  properties: Array<{
    id: string;
    name: string;
    address: string;
    cadastralReference: string | null;
    status: string;
    tenant: {
      name: string;
      email: string;
      leaseStart: string;
      leaseEnd: string | null;
    } | null;
    income: {
      monthly: Array<{ month: string; amount: number }>;
      total: number;
    };
    expenses: {
      recurring: Array<{
        name: string;
        frequency: string;
        amount: number;
        annualTotal: number;
      }>;
      unexpected: Array<{
        description: string;
        amount: number;
        date: string;
      }>;
      total: number;
    };
    netProfit: number;
  }>;
}

import { getToken, logout } from "./auth";
import type {
  User,
  DashboardData,
  ApartmentSummary,
  ApartmentDetail,
  Tenant,
  RecurringExpense,
  UnexpectedExpense,
  Document,
  Reminder,
  TaxReportData,
} from "./types";

const API_BASE_URL = "/api";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Important for Supabase cookies
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("No autorizado");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Error del servidor" }));
    throw new Error(errorData.error ?? "Error del servidor");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  signup(email: string, password: string, name: string) {
    return apiFetch<{ user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },
  login(email: string, password: string) {
    return apiFetch<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  logout() {
    return apiFetch<{ success: boolean }>("/auth/logout", {
      method: "POST",
    });
  },
  me() {
    return apiFetch<User>("/auth/me");
  },
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  get() {
    return apiFetch<DashboardData>("/dashboard");
  },
};

// ─── Apartments ──────────────────────────────────────────────────────────────
export const apartmentsApi = {
  list() {
    return apiFetch<ApartmentSummary[]>("/apartments");
  },
  get(id: string) {
    return apiFetch<ApartmentDetail>(`/apartments/${id}`);
  },
  create(data: { name: string; address: string; cadastralReference?: string; rentAmount: number }) {
    return apiFetch<ApartmentSummary>("/apartments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: Partial<{ name: string; address: string; cadastralReference: string; rentAmount: number; status: string }>) {
    return apiFetch<ApartmentSummary>(`/apartments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete(id: string) {
    return apiFetch<void>(`/apartments/${id}`, { method: "DELETE" });
  },
};

// ─── Tenants ─────────────────────────────────────────────────────────────────
export const tenantsApi = {
  list() {
    return apiFetch<Tenant[]>("/tenants");
  },
  create(data: { name: string; email: string; phone?: string }) {
    return apiFetch<Tenant>("/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  assignExisting(apartmentId: string, data: { tenantId: string; leaseStartDate: string }) {
    return apiFetch<{ tenant: Tenant; ipcReminder: Reminder }>(
      `/apartments/${apartmentId}/tenants/assign`,
      { method: "POST", body: JSON.stringify(data) }
    );
  },
  assign(
    apartmentId: string,
    data: { name: string; email: string; phone?: string; leaseStartDate: string }
  ) {
    return apiFetch<{ tenant: Tenant; ipcReminder: Reminder }>(
      `/apartments/${apartmentId}/tenants`,
      { method: "POST", body: JSON.stringify(data) }
    );
  },
  remove(apartmentId: string) {
    return apiFetch<{ success: true; tenant: Tenant }>(
      `/apartments/${apartmentId}/tenants/remove`,
      { method: "POST" }
    );
  },
  update(id: string, data: Partial<Tenant>) {
    return apiFetch<Tenant>(`/tenants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete(id: string) {
    return apiFetch<void>(`/tenants/${id}`, { method: "DELETE" });
  },
};

// ─── Recurring Expenses ──────────────────────────────────────────────────────
export const recurringExpensesApi = {
  list(apartmentId: string) {
    return apiFetch<RecurringExpense[]>(`/apartments/${apartmentId}/recurring-expenses`);
  },
  create(
    apartmentId: string,
    data: { name: string; amount: number; frequency: RecurringExpense["frequency"] }
  ) {
    return apiFetch<RecurringExpense>(`/apartments/${apartmentId}/recurring-expenses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: Partial<RecurringExpense>) {
    return apiFetch<RecurringExpense>(`/recurring-expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete(id: string) {
    return apiFetch<void>(`/recurring-expenses/${id}`, { method: "DELETE" });
  },
};

// ─── Unexpected Expenses ─────────────────────────────────────────────────────
export const unexpectedExpensesApi = {
  list(apartmentId: string) {
    return apiFetch<UnexpectedExpense[]>(`/apartments/${apartmentId}/unexpected-expenses`);
  },
  create(
    apartmentId: string,
    data: { description: string; amount: number; date: string }
  ) {
    return apiFetch<UnexpectedExpense>(`/apartments/${apartmentId}/unexpected-expenses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  delete(id: string) {
    return apiFetch<void>(`/unexpected-expenses/${id}`, { method: "DELETE" });
  },
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentsApi = {
  list(apartmentId: string) {
    return apiFetch<Document[]>(`/apartments/${apartmentId}/documents`);
  },
  upload(apartmentId: string, formData: FormData) {
    return apiFetch<Document>(`/apartments/${apartmentId}/documents`, {
      method: "POST",
      body: formData,
    });
  },
  send(id: string) {
    return apiFetch<{ success: true; sentAt: string }>(`/documents/${id}/send`, {
      method: "POST",
    });
  },
  delete(id: string) {
    return apiFetch<void>(`/documents/${id}`, { method: "DELETE" });
  },
};

// ─── Reminders ───────────────────────────────────────────────────────────────
export const remindersApi = {
  listAll() {
    return apiFetch<Reminder[]>("/reminders");
  },
  list(apartmentId: string) {
    return apiFetch<Reminder[]>(`/apartments/${apartmentId}/reminders`);
  },
  create(
    apartmentId: string,
    data: { title: string; description?: string; dueDate: string }
  ) {
    return apiFetch<Reminder>(`/apartments/${apartmentId}/reminders`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: Partial<Reminder>) {
    return apiFetch<Reminder>(`/reminders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete(id: string) {
    return apiFetch<void>(`/reminders/${id}`, { method: "DELETE" });
  },
};

// ─── Tax Report ──────────────────────────────────────────────────────────────
export const taxReportApi = {
  get(year: number) {
    return apiFetch<TaxReportData>(`/tax-report/${year}`);
  },
};

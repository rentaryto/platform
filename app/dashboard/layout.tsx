import { AuthUserSync } from "@/components/auth/AuthUserSync";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthUserSync>{children}</AuthUserSync>;
}

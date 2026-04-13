"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Home, FileText, LogOut, Clock, Building2, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { PricingModal } from "@/components/modals/PricingModal";
import type { SubscriptionStatus } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Inmuebles", icon: Home },
  { href: "/dashboard/tenants", label: "Inquilinos", icon: Users },
  { href: "/dashboard/hacienda", label: "Hacienda", icon: FileText },
];

interface SidebarProps {
  subscription?: SubscriptionStatus | null;
}

export function Sidebar({ subscription }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside className="hidden md:flex w-64 sticky top-0 h-screen bg-gray-900 text-white flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-700">
        {/* Trial info */}
        {subscription && subscription.status === 'trial' && (
          <div className="mb-3 px-3 py-2 bg-gray-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-blue-400" />
              <p className="text-xs text-gray-300 font-medium">
                {subscription.daysRemaining} días restantes
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Building2 className="h-3 w-3" />
              <span>{subscription.currentProperties} / {subscription.maxProperties} inmuebles</span>
            </div>
            <Button
              size="sm"
              onClick={() => setPricingModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-7"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Actualizar plan
            </Button>
          </div>
        )}

        {/* Plan básico activo info */}
        {subscription && subscription.status === 'active' && subscription.plan === 'basic' && (
          <div className="mb-3 px-3 py-2 bg-gray-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Building2 className="h-3 w-3" />
              <span>{subscription.currentProperties} / {subscription.maxProperties} inmuebles</span>
            </div>
            <Button
              size="sm"
              onClick={() => setPricingModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs h-7"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Mejorar plan
            </Button>
          </div>
        )}

        {user && (
          <div className="mb-3 px-3">
            <p className="text-xs text-gray-400">Conectado como</p>
            <p className="text-sm font-medium truncate">{user.name}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        open={pricingModalOpen}
        onOpenChange={setPricingModalOpen}
        currentPlan={subscription?.plan}
      />
    </aside>
  );
}

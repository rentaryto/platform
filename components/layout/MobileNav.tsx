"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Home, FileText, UserCircle, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, logout } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Inmuebles", icon: Home },
  { href: "/dashboard/tenants", label: "Inquilinos", icon: Users },
  { href: "/dashboard/hacienda", label: "Hacienda", icon: FileText },
  { href: "/dashboard/settings", label: "Config", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    router.replace("/login");
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
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
                  "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Botón de Perfil */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <UserCircle className="h-5 w-5" />
            <span>Perfil</span>
          </button>
        </div>
      </nav>

      {/* Dialog de Perfil */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mi Perfil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {user && (
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Nombre</p>
                  <p className="font-medium text-gray-900">{user.name}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

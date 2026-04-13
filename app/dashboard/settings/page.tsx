"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { isAuthenticated, getUser, setUser, logout } from "@/lib/auth";
import { userApi, subscriptionApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = getUser();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cancelMessage, setCancelMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  // Mutation para actualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (data) => {
      setUser(data.user);
      setProfileMessage({ type: "success", text: "Perfil actualizado correctamente" });
      setTimeout(() => setProfileMessage(null), 5000);
    },
    onError: (error: Error) => {
      setProfileMessage({ type: "error", text: error.message || "Error al actualizar el perfil" });
    },
  });

  // Mutation para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage({ type: "success", text: "Contraseña actualizada correctamente" });
      setTimeout(() => setPasswordMessage(null), 5000);
    },
    onError: (error: Error) => {
      setPasswordMessage({ type: "error", text: error.message || "Error al cambiar la contraseña" });
    },
  });

  // Mutation para cancelar suscripción
  const cancelSubscriptionMutation = useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: async () => {
      setCancelMessage({ type: "success", text: "Suscripción cancelada correctamente. Redirigiendo..." });
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setTimeout(() => {
        logout();
        router.replace("/login");
      }, 2000);
    },
    onError: (error: Error) => {
      setCancelMessage({ type: "error", text: error.message || "Error al cancelar la suscripción" });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!profileData.name.trim()) {
      setProfileMessage({ type: "error", text: "El nombre es requerido" });
      return;
    }

    updateProfileMutation.mutate({
      name: profileData.name,
      email: profileData.email,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Todos los campos son requeridos" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleCancelSubscription = () => {
    if (confirm("¿Estás seguro de que deseas cancelar tu suscripción? Esta acción cerrará tu sesión.")) {
      setCancelMessage(null);
      cancelSubscriptionMutation.mutate();
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona tu cuenta y preferencias
            </p>
          </div>

          {/* Sección de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Información del perfil</CardTitle>
              <CardDescription>
                Actualiza tu nombre y correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {profileMessage && (
                  <Alert variant={profileMessage.type === "error" ? "destructive" : "default"}>
                    {profileMessage.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{profileMessage.text}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="tu@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Si cambias tu email, deberás verificarlo desde tu correo
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sección de Contraseña */}
          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña de acceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordMessage && (
                  <Alert variant={passwordMessage.type === "error" ? "destructive" : "default"}>
                    {passwordMessage.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{passwordMessage.text}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {changePasswordMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Actualizar contraseña
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sección de Cancelar Suscripción */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Zona de peligro</CardTitle>
              <CardDescription>
                Acciones irreversibles con tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cancelMessage && (
                <Alert variant={cancelMessage.type === "error" ? "destructive" : "default"}>
                  {cancelMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{cancelMessage.text}</AlertDescription>
                </Alert>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Cancelar suscripción</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Al cancelar tu suscripción, perderás el acceso a todas las funcionalidades de la plataforma.
                  Esta acción cerrará tu sesión inmediatamente.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={cancelSubscriptionMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {cancelSubscriptionMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cancelar suscripción
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

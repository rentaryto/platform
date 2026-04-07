"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Share, Plus, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function InstallAppBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
    const bannerDismissed = localStorage.getItem("rentaryto_install_banner_dismissed");

    if (!isInstalled && !bannerDismissed) {
      setShowBanner(true);
    }

    // Detectar sistema operativo
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("rentaryto_install_banner_dismissed", "true");
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  if (!showBanner) return null;

  return (
    <>
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-blue-600 p-2 rounded-lg mt-1">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Instala Rentaryto en tu móvil
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Accede más rápido a tus alquileres. Instala la app en tu pantalla de inicio.
              </p>
              <Button
                size="sm"
                onClick={handleShowInstructions}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver cómo instalar
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </Card>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Instalar Rentaryto como app</DialogTitle>
            <DialogDescription>
              Sigue estos pasos para añadir Rentaryto a tu pantalla de inicio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* iOS Instructions */}
            {isIOS && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  En iPhone/iPad (Safari)
                </h4>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>
                      Toca el botón de <strong>Compartir</strong>{" "}
                      <Share className="inline h-4 w-4" /> en la parte inferior de Safari
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>
                      Desplázate y selecciona{" "}
                      <strong>Añadir a pantalla de inicio</strong>{" "}
                      <Plus className="inline h-4 w-4" />
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      3
                    </span>
                    <span>Toca <strong>Añadir</strong> en la esquina superior derecha</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      4
                    </span>
                    <span>¡Listo! Ahora puedes abrir Rentaryto desde tu pantalla de inicio</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Android Instructions */}
            {isAndroid && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  En Android (Chrome)
                </h4>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>
                      Toca el menú <Menu className="inline h-4 w-4" /> (tres puntos) en la
                      esquina superior derecha
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>
                      Selecciona <strong>Añadir a pantalla de inicio</strong> o{" "}
                      <strong>Instalar app</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      3
                    </span>
                    <span>Confirma tocando <strong>Añadir</strong> o <strong>Instalar</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      4
                    </span>
                    <span>¡Listo! Ahora puedes abrir Rentaryto desde tu pantalla de inicio</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Generic Instructions */}
            {!isIOS && !isAndroid && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    En iPhone/iPad (Safari)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Toca <Share className="inline h-4 w-4" /> <strong>Compartir</strong> →{" "}
                    <Plus className="inline h-4 w-4" /> <strong>Añadir a pantalla de inicio</strong>
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    En Android (Chrome)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Toca <Menu className="inline h-4 w-4" /> <strong>Menú</strong> →{" "}
                    <strong>Añadir a pantalla de inicio</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> Una vez instalada, Rentaryto funcionará como una app
                nativa en tu móvil con acceso rápido desde la pantalla de inicio.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

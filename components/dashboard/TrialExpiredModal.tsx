"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
}

export function TrialExpiredModal({ open }: Props) {
  const handleActivate = () => {
    window.location.href = "mailto:info@rentaryto.com?subject=Activar plan de Rentaryto&body=Hola,%0D%0A%0D%0AMe gustaría activar mi plan de Rentaryto.%0D%0A%0D%0AGracias";
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-xl">Período de prueba finalizado</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base leading-relaxed pt-2">
            Tu período de prueba gratuito ha terminado. Para continuar gestionando tus inmuebles,
            activa tu plan por solo <strong>9€/mes</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-gray-50 rounded-lg p-4 my-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Plan Standard - 9€/mes</p>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>✓ Hasta 5 inmuebles</li>
            <li>✓ Gestión completa de inquilinos</li>
            <li>✓ Documentos y facturas</li>
            <li>✓ Envío automático a inquilinos</li>
            <li>✓ Informes para Hacienda</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={handleActivate} className="w-full sm:w-auto">
            Activar plan (9€/mes)
          </AlertDialogAction>
        </AlertDialogFooter>

        <p className="text-xs text-center text-gray-500 mt-2">
          O contacta con nosotros en{" "}
          <a href="mailto:info@rentaryto.com" className="text-blue-600 hover:underline">
            info@rentaryto.com
          </a>
        </p>
      </AlertDialogContent>
    </AlertDialog>
  );
}

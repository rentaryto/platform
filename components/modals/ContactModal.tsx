"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contacta con nosotros</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Para planes personalizados con más de 10 inmuebles, escríbenos a:
            </p>
            <a
              href="mailto:info@rentaryto.com"
              className="text-xl font-semibold text-blue-600 hover:underline block"
            >
              info@rentaryto.com
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

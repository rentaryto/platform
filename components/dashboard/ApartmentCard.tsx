"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEuro } from "@/lib/utils";
import { User, Home, ChevronRight } from "lucide-react";

interface ApartmentCardProps {
  id: string;
  name: string;
  status: "occupied" | "vacant";
  tenantName: string | null;
  rentAmount: number;
}

export function ApartmentCard({ id, name, status, tenantName, rentAmount }: ApartmentCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/dashboard/apartments/${id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{name}</p>
              <div className="flex items-center gap-2 mt-1">
                {tenantName ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{tenantName}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin inquilino</span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
        </div>

        <div className="flex items-center justify-between mt-4">
          <Badge variant={status === "occupied" ? "success" : "warning"}>
            {status === "occupied" ? "Ocupado" : "Vacío"}
          </Badge>
          <span className="text-sm font-semibold text-gray-700">
            {formatEuro(rentAmount)}/mes
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Rentaryto",
    template: "%s | Rentaryto",
  },
  description: "Gestión de alquileres para pequeños propietarios",
  applicationName: "Rentaryto",
  appleWebApp: {
    capable: true,
    title: "Rentaryto",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

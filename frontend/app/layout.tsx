import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Providers } from "./providers";
import { BrandingProvider } from "@/components/BrandingProvider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaxiLearn — Plataforma de Cursos Corporativos",
  description:
    "Treine sua equipe com eficiência e controle. Plataforma de cursos corporativos com gestão completa de usuários, conteúdo e progresso.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <Providers>
          <AuthProvider>
            <BrandingProvider>{children}</BrandingProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

"use client";

import type { ReactNode } from "react";
import { useBranding } from "@/hooks/use-branding";

export default function AlunoRootLayout({ children }: { children: ReactNode }) {
  useBranding();
  return <>{children}</>;
}

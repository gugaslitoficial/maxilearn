"use client";

import { useEffect } from "react";
import { useCompany } from "@/hooks/use-company";

export function useBranding() {
  const query = useCompany();

  useEffect(() => {
    const company = query.data;
    if (!company) return;
    const root = document.documentElement;
    if (company.primaryColor) root.style.setProperty("--color-primary", company.primaryColor);
    if (company.secondaryColor) root.style.setProperty("--color-secondary", company.secondaryColor);
  }, [query.data]);

  return query;
}

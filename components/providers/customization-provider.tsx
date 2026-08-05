// components/providers/customization-provider.tsx

"use client";

import { CustomizationProvider } from "@/lib/context/customization-context";

export function CustomizationProviderWrapper({ children }: { children: React.ReactNode }) {
    return <CustomizationProvider>{children}</CustomizationProvider>;
}
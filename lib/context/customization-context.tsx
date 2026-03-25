// lib/context/customization-context.tsx
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { useTheme } from "next-themes";
import { THEME_COLORS, FONT_OPTIONS } from "@/lib/config/theme-colors";
import type {
    AppMode,
    CustomizationPreferences,
} from "@/lib/types/customization";
import { DEFAULT_PREFERENCES } from "@/lib/types/customization";

const STORAGE_KEY = "admin-customization-prefs";

interface CustomizationContextValue {
    preferences: CustomizationPreferences;
    setMode: (mode: AppMode) => void;
    setThemeColor: (colorId: string) => void;
    setFont: (fontId: string) => void;
    setRadius: (radius: string) => void;
    setAnimationsEnabled: (enabled: boolean) => void;
    setReducedMotion: (reduced: boolean) => void;
    resetToDefaults: () => void;
    isHydrated: boolean;
}

const CustomizationContext = createContext<CustomizationContextValue | null>(null);

export function useCustomization() {
    const ctx = useContext(CustomizationContext);
    if (!ctx) {
        throw new Error("useCustomization must be used within CustomizationProvider");
    }
    return ctx;
}

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
    const { setTheme, resolvedTheme } = useTheme();
    const [preferences, setPreferences] = useState<CustomizationPreferences>(DEFAULT_PREFERENCES);
    const [isHydrated, setIsHydrated] = useState(false);
    const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Load from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
            }
        } catch { }
        setIsHydrated(true);
    }, []);

    const persist = useCallback((prefs: CustomizationPreferences) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch { }
    }, []);

    // Apply mode
    useEffect(() => {
        if (!isHydrated) return;

        if (preferences.mode === "auto") {
            function applyAutoMode() {
                const hour = new Date().getHours();
                setTheme(hour >= 6 && hour < 18 ? "light" : "dark");
            }
            applyAutoMode();
            autoTimerRef.current = setInterval(applyAutoMode, 60_000);
            return () => {
                if (autoTimerRef.current) clearInterval(autoTimerRef.current);
            };
        } else {
            if (autoTimerRef.current) clearInterval(autoTimerRef.current);
            setTheme(preferences.mode);
        }
    }, [preferences.mode, isHydrated, setTheme]);

    // Apply CSS variables
    useEffect(() => {
        if (!isHydrated) return;

        const root = document.documentElement;
        const isDark = resolvedTheme === "dark";

        const color = THEME_COLORS.find((c) => c.id === preferences.themeColor);
        if (color) {
            const palette = isDark ? color.dark : color.light;
            root.style.setProperty("--primary", palette.primary);
            root.style.setProperty("--primary-foreground", palette.primaryForeground);
            root.style.setProperty("--accent", palette.accent);
            root.style.setProperty("--accent-foreground", palette.accentForeground);
            root.style.setProperty("--ring", palette.ring);
            root.style.setProperty("--sidebar-primary", palette.primary);
            root.style.setProperty("--sidebar-primary-foreground", palette.primaryForeground);
            root.style.setProperty("--sidebar-accent", palette.accent);
            root.style.setProperty("--sidebar-accent-foreground", palette.accentForeground);
            root.style.setProperty("--sidebar-ring", palette.ring);
        }

        root.style.setProperty("--radius", `${preferences.radius}rem`);

        const font = FONT_OPTIONS.find((f) => f.id === preferences.font);
        if (font) {
            root.style.setProperty("--font-admin", font.value);
        }

        if (!preferences.animationsEnabled || preferences.reducedMotion) {
            root.style.setProperty("--animation-duration", "0ms");
            root.style.setProperty("--transition-duration", "0ms");
        } else {
            root.style.removeProperty("--animation-duration");
            root.style.removeProperty("--transition-duration");
        }
    }, [preferences, resolvedTheme, isHydrated]);

    function updatePreferences(partial: Partial<CustomizationPreferences>) {
        setPreferences((prev) => {
            const next = { ...prev, ...partial };
            persist(next);
            return next;
        });
    }

    function handleReset() {
        setPreferences(DEFAULT_PREFERENCES);
        persist(DEFAULT_PREFERENCES);
        const root = document.documentElement;
        [
            "--primary", "--primary-foreground", "--accent", "--accent-foreground",
            "--ring", "--radius", "--font-admin", "--animation-duration",
            "--transition-duration", "--sidebar-primary", "--sidebar-primary-foreground",
            "--sidebar-accent", "--sidebar-accent-foreground", "--sidebar-ring",
        ].forEach((prop) => root.style.removeProperty(prop));
    }

    return (
        <CustomizationContext.Provider
            value={{
                preferences,
                setMode: (mode) => updatePreferences({ mode }),
                setThemeColor: (themeColor) => updatePreferences({ themeColor }),
                setFont: (font) => updatePreferences({ font }),
                setRadius: (radius) => updatePreferences({ radius }),
                setAnimationsEnabled: (animationsEnabled) => updatePreferences({ animationsEnabled }),
                setReducedMotion: (reducedMotion) => updatePreferences({ reducedMotion }),
                resetToDefaults: handleReset,
                isHydrated,
            }}
        >
            {children}
        </CustomizationContext.Provider>
    );
}
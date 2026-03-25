// lib/types/customization.ts

export type AppMode = "light" | "dark" | "auto";

export interface ThemeColor {
    id: string;
    label: string;
    light: {
        primary: string;
        primaryForeground: string;
        accent: string;
        accentForeground: string;
        ring: string;
    };
    dark: {
        primary: string;
        primaryForeground: string;
        accent: string;
        accentForeground: string;
        ring: string;
    };
    swatch: string;
}

export interface FontOption {
    id: string;
    label: string;
    value: string;
    preview: string;
}

export interface RadiusOption {
    id: string;
    label: string;
    value: string;
}

export interface CustomizationPreferences {
    mode: AppMode;
    themeColor: string;
    font: string;
    radius: string;
    animationsEnabled: boolean;
    reducedMotion: boolean;
}

export const DEFAULT_PREFERENCES: CustomizationPreferences = {
    mode: "auto",
    themeColor: "default",
    font: "inter",
    radius: "0.5",
    animationsEnabled: true,
    reducedMotion: false,
};
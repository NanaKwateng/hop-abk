// lib/config/theme-colors.ts

import type { ThemeColor, FontOption, RadiusOption } from "@/lib/types/customization";

export const THEME_COLORS: ThemeColor[] = [
    {
        id: "default",
        label: "Default",
        light: {
            primary: "222.2 47.4% 11.2%",
            primaryForeground: "210 40% 98%",
            accent: "210 40% 96.1%",
            accentForeground: "222.2 47.4% 11.2%",
            ring: "222.2 47.4% 11.2%",
        },
        dark: {
            primary: "210 40% 98%",
            primaryForeground: "222.2 47.4% 11.2%",
            accent: "217.2 32.6% 17.5%",
            accentForeground: "210 40% 98%",
            ring: "212.7 26.8% 83.9%",
        },
        swatch: "#18181b",
    },
    {
        id: "blue",
        label: "Blue",
        light: {
            primary: "221.2 83.2% 53.3%",
            primaryForeground: "210 40% 98%",
            accent: "214.3 31.8% 91.4%",
            accentForeground: "222.2 47.4% 11.2%",
            ring: "221.2 83.2% 53.3%",
        },
        dark: {
            primary: "217.2 91.2% 59.8%",
            primaryForeground: "222.2 47.4% 11.2%",
            accent: "217.2 32.6% 17.5%",
            accentForeground: "210 40% 98%",
            ring: "224.3 76.3% 48%",
        },
        swatch: "#3b82f6",
    },
    {
        id: "violet",
        label: "Violet",
        light: {
            primary: "262.1 83.3% 57.8%",
            primaryForeground: "210 40% 98%",
            accent: "263 70% 95%",
            accentForeground: "263.4 70% 50.4%",
            ring: "262.1 83.3% 57.8%",
        },
        dark: {
            primary: "263.4 70% 50.4%",
            primaryForeground: "210 40% 98%",
            accent: "263 30% 20%",
            accentForeground: "263 60% 80%",
            ring: "263.4 70% 50.4%",
        },
        swatch: "#8b5cf6",
    },
    {
        id: "rose",
        label: "Rose",
        light: {
            primary: "346.8 77.2% 49.8%",
            primaryForeground: "355.7 100% 97.3%",
            accent: "346.8 60% 95%",
            accentForeground: "346.8 77.2% 49.8%",
            ring: "346.8 77.2% 49.8%",
        },
        dark: {
            primary: "346.8 77.2% 49.8%",
            primaryForeground: "355.7 100% 97.3%",
            accent: "346 30% 18%",
            accentForeground: "346 60% 80%",
            ring: "346.8 77.2% 49.8%",
        },
        swatch: "#e11d48",
    },
    {
        id: "green",
        label: "Green",
        light: {
            primary: "142.1 76.2% 36.3%",
            primaryForeground: "355.7 100% 97.3%",
            accent: "138 40% 93%",
            accentForeground: "142.1 76.2% 36.3%",
            ring: "142.1 76.2% 36.3%",
        },
        dark: {
            primary: "142.1 70.6% 45.3%",
            primaryForeground: "144.9 80.4% 10%",
            accent: "142 30% 16%",
            accentForeground: "142 60% 75%",
            ring: "142.1 70.6% 45.3%",
        },
        swatch: "#16a34a",
    },
    {
        id: "orange",
        label: "Orange",
        light: {
            primary: "24.6 95% 53.1%",
            primaryForeground: "60 9.1% 97.8%",
            accent: "24.6 60% 93%",
            accentForeground: "24.6 95% 40%",
            ring: "24.6 95% 53.1%",
        },
        dark: {
            primary: "20.5 90.2% 48.2%",
            primaryForeground: "60 9.1% 97.8%",
            accent: "24 30% 16%",
            accentForeground: "24 60% 75%",
            ring: "20.5 90.2% 48.2%",
        },
        swatch: "#f97316",
    },
    {
        id: "amber",
        label: "Amber",
        light: {
            primary: "45.4 93.4% 47.5%",
            primaryForeground: "26 83.3% 14.1%",
            accent: "48 96.5% 89%",
            accentForeground: "26 83.3% 14.1%",
            ring: "45.4 93.4% 47.5%",
        },
        dark: {
            primary: "48 96.5% 53.1%",
            primaryForeground: "26 83.3% 14.1%",
            accent: "48 30% 16%",
            accentForeground: "48 70% 80%",
            ring: "48 96.5% 53.1%",
        },
        swatch: "#eab308",
    },
    {
        id: "teal",
        label: "Teal",
        light: {
            primary: "172.5 66% 38.4%",
            primaryForeground: "166 76% 97%",
            accent: "170 50% 92%",
            accentForeground: "172.5 66% 30%",
            ring: "172.5 66% 38.4%",
        },
        dark: {
            primary: "170 70% 50%",
            primaryForeground: "166 76% 10%",
            accent: "170 30% 16%",
            accentForeground: "170 60% 75%",
            ring: "170 70% 50%",
        },
        swatch: "#14b8a6",
    },
];

export const FONT_OPTIONS: FontOption[] = [
    {
        id: "inter",
        label: "Inter",
        value: "'Inter', sans-serif",
        preview: "The quick brown fox jumps over the lazy dog",
    },
    {
        id: "geist",
        label: "Geist",
        value: "'Geist', sans-serif",
        preview: "The quick brown fox jumps over the lazy dog",
    },
    {
        id: "system",
        label: "System Default",
        value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        preview: "The quick brown fox jumps over the lazy dog",
    },
    {
        id: "mono",
        label: "Monospace",
        value: "'JetBrains Mono', 'Fira Code', monospace",
        preview: "The quick brown fox jumps over the lazy dog",
    },
];

export const RADIUS_OPTIONS: RadiusOption[] = [
    { id: "none", label: "None", value: "0" },
    { id: "sm", label: "Small", value: "0.3" },
    { id: "md", label: "Medium", value: "0.5" },
    { id: "lg", label: "Large", value: "0.75" },
    { id: "xl", label: "Full", value: "1.0" },
];
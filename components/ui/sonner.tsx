// components/ui/sonner.tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      position="bottom-right"
      richColors
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: `
            group toast
            !rounded-xl !shadow-lg !px-4 !py-3.5
            !border !gap-3
            !font-medium !text-[13.5px] !leading-snug
            !flex !items-center
            !min-h-[52px]
            
            /* ─── Light mode ─── */
            !bg-zinc-950 !text-white !border-zinc-800/80
            
            /* ─── Dark mode ─── */
            dark:!bg-zinc-900 dark:!text-zinc-100 dark:!border-zinc-700/60
          `,
          // ── Success variant ──
          success: `
            !bg-zinc-950 !text-white !border-zinc-800/80
            dark:!bg-zinc-900 dark:!text-zinc-100 dark:!border-zinc-700/60
            [&_[data-icon]]:!text-emerald-400
          `,
          // ── Error variant ──
          error: `
            !bg-zinc-950 !text-white !border-zinc-800/80
            dark:!bg-zinc-900 dark:!text-zinc-100 dark:!border-zinc-700/60
            [&_[data-icon]]:!text-red-400
          `,
          // ── Loading variant (matches Vercel screenshot exactly) ──
          loading: `
            !bg-zinc-950 !text-white !border-zinc-800/80
            dark:!bg-zinc-900 dark:!text-zinc-100 dark:!border-zinc-700/60
            [&_[data-icon]]:!text-zinc-400
          `,
          // ── Warning variant ──
          warning: `
            !bg-zinc-950 !text-white !border-zinc-800/80
            dark:!bg-zinc-900 dark:!text-zinc-100 dark:!border-zinc-700/60
            [&_[data-icon]]:!text-amber-400
          `,
          // ── Info variant ──
          info: `
            !bg-zinc-950 !text-white !border-zinc-800/80
            dark:!bg-zinc-900 dark:!text-zinc-100 dark:!border-zinc-700/60
            [&_[data-icon]]:!text-blue-400
          `,
          // ── Title text ──
          title: `
            !text-[13.5px] !font-medium !leading-snug
            !text-white dark:!text-zinc-100
          `,
          // ── Description text ──
          description: `
            !text-[12.5px] !font-normal
            !text-zinc-400 dark:!text-zinc-400
          `,
          // ── Action button inside toast ──
          actionButton: `
            !bg-white !text-zinc-950 
            !text-xs !font-semibold 
            !rounded-md !px-3 !py-1.5
            hover:!bg-zinc-200
            !transition-colors
          `,
          // ── Cancel button ──
          cancelButton: `
            !bg-transparent !text-zinc-400 
            !text-xs !font-medium 
            !rounded-md !px-3 !py-1.5
            hover:!text-zinc-200 hover:!bg-zinc-800
            !transition-colors
          `,
          // ── Close button (the × on the right) ──
          closeButton: `
            !bg-transparent 
            !border-none !shadow-none
            !text-zinc-500 hover:!text-white
            !transition-colors
            !right-2
            !top-1/2 !-translate-y-1/2
            !left-auto
            !transform
          `,
          // ── Icon container ──
          icon: `
            !mr-0
          `,
        },
      }}
      closeButton
      {...props}
    />
  );
};

export { Toaster };
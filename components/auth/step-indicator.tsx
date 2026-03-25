import { cn } from "@/lib/utils";

interface StepProps {
    step: number;
    label: string;
    variant: "active" | "inactive";
}

export function StepIndicator({ step, label, variant }: StepProps) {
    const isActive = variant === "active";

    return (
        <div className={cn(
            "flex flex-col gap-3 p-4 rounded-xl min-w-[120px] border transition-all",
            isActive
                ? "bg-white border-white"
                : "bg-zinc-900/40 border-zinc-800"
        )}>
            <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                isActive ? "bg-black text-white" : "bg-zinc-800 text-zinc-500 border border-zinc-700"
            )}>
                {step}
            </div>
            <p className={cn(
                "text-[11px] leading-tight font-medium",
                isActive ? "text-black" : "text-zinc-500"
            )}>
                {label}
            </p>
        </div>
    );
}
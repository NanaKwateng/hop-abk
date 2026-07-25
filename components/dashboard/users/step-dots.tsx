
// src/components/users/step-dots.tsx

"use client"

import { cn } from "@/lib/utils"
import { STEP_LABELS, TOTAL_STEPS } from "@/lib/validations/create-user-schema"
import { Check } from "lucide-react"

interface StepDotsProps {
    step: number
    completedSteps?: Set<number>
}

export function StepDots({ step, completedSteps = new Set() }: StepDotsProps) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
                const stepNum = i + 1
                const isActive = stepNum === step
                const isCompleted = completedSteps.has(stepNum) || stepNum < step

                return (
                    <div key={stepNum} className="flex items-center">
                        {/* Connector line */}
                        {i > 0 && (
                            <div
                                className={cn(
                                    "h-0.5 w-6 mx-0.5 transition-colors duration-300",
                                    isCompleted ? "bg-primary" : "bg-muted"
                                )}
                            />
                        )}

                        {/* Step circle */}
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-300",
                                    isActive && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                                    isCompleted && !isActive && "bg-primary text-primary-foreground",
                                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                                )}
                            >
                                {isCompleted && !isActive ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    stepNum
                                )}
                            </div>

                            {/* Label — hidden on small screens */}
                            <span
                                className={cn(
                                    "hidden text-[10px] font-medium sm:block",
                                    isActive
                                        ? "text-primary"
                                        : isCompleted
                                            ? "text-muted-foreground"
                                            : "text-muted-foreground/60"
                                )}
                            >
                                {STEP_LABELS[i]}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
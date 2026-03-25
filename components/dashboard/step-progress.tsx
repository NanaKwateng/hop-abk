interface StepProgressProps {
    step: number
}

export function StepProgress({ step }: StepProgressProps) {
    const steps = ["Upload", "Basic Info", "Details"]

    return (
        <nav
            aria-label="Progress"
            className="mb-8 w-full"
        >
            <ol className="flex items-center justify-between">
                {steps.map((label, index) => {
                    const current = index + 1 <= step

                    return (
                        <li
                            key={label}
                            className="flex flex-1 items-center"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                    ${current ? "bg-primary text-white" : "bg-muted text-muted-foreground"}
                  `}
                                >
                                    {index + 1}
                                </div>

                                <span className="mt-2 text-xs text-muted-foreground">
                                    {label}
                                </span>
                            </div>

                            {index !== steps.length - 1 && (
                                <div className="mx-2 h-[2px] flex-1 bg-border" />
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}





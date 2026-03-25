// src/components/users/step-container.tsx

"use client"

import { motion, AnimatePresence } from "framer-motion"

interface StepContainerProps {
    children: React.ReactNode
    stepKey: number
    direction: "forward" | "backward"
}

export function StepContainer({ children, stepKey, direction }: StepContainerProps) {
    const variants = {
        enter: (dir: string) => ({
            x: dir === "forward" ? 40 : -40,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: string) => ({
            x: dir === "forward" ? -40 : 40,
            opacity: 0,
        }),
    }

    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={stepKey}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeInOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
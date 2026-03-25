// src/components/users/steps-form/step-four-photo.tsx

"use client"

import FileUpload from "@/components/dashboard/users/file-upload"
import type { UseFormReturn } from "react-hook-form"
import type { CreateUserInput } from "@/lib/validations/create-user-schema"

interface StepFourProps {
    form: UseFormReturn<CreateUserInput>
}

export function StepFourPhoto({ form }: StepFourProps) {
    const { setValue, watch } = form
    const avatarUrl = watch("avatarUrl")

    return (
        <FileUpload
            currentPreview={avatarUrl}
            onAccept={(croppedUrl) =>
                setValue("avatarUrl", croppedUrl, { shouldValidate: true })
            }
            onClear={() => setValue("avatarUrl", undefined)}
        />
    )
}
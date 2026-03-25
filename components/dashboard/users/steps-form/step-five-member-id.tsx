// src/components/users/steps-form/step-five-member-id.tsx

"use client"

import { useCallback } from "react"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sparkles, RotateCcw } from "lucide-react"
import { generateMembershipId } from "@/lib/utils/generate-member-id"
import type { UseFormReturn } from "react-hook-form"
import type { CreateUserInput } from "@/lib/validations/create-user-schema"

interface StepFiveProps {
    form: UseFormReturn<CreateUserInput>
}

export function StepFiveMemberId({ form }: StepFiveProps) {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = form

    const membershipId = watch("membershipId") || ""

    const handleGenerate = useCallback(() => {
        const id = generateMembershipId()
        setValue("membershipId", id, { shouldValidate: true })
    }, [setValue])

    const handleReset = useCallback(() => {
        setValue("membershipId", "", { shouldValidate: false })
    }, [setValue])

    return (
        <FieldGroup>
            <FieldSet>
                <FieldLegend>Membership Identification</FieldLegend>
                <FieldDescription>
                    Generate a unique ID or enter one manually. The format must follow:{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        HOP-ABK-001
                    </code>
                </FieldDescription>

                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="membershipId">Membership ID</FieldLabel>
                        <Input
                            id="membershipId"
                            type="text"
                            placeholder="HOP-ABK-001"
                            {...register("membershipId")}
                            className="font-mono uppercase tracking-wider"
                            aria-invalid={!!errors.membershipId}
                            onChange={(e) => {
                                const upper = e.target.value.toUpperCase()
                                setValue("membershipId", upper, { shouldValidate: true })
                            }}
                            value={membershipId}
                        />
                        <FieldDescription>
                            This will be the member&apos;s unique identity number.
                        </FieldDescription>
                        {errors.membershipId && (
                            <p className="text-xs text-destructive">
                                {errors.membershipId.message}
                            </p>
                        )}
                    </Field>

                    <Field orientation="horizontal">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={!membershipId}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>

                        <Button type="button" onClick={handleGenerate}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate
                        </Button>
                    </Field>
                </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
                <FieldLegend>ID Format Guide</FieldLegend>
                <FieldDescription>
                    The ID follows the pattern:{" "}
                    <strong>CHURCH-BRANCH-NUMBER</strong>. Example:{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        HOP-ABK-001
                    </code>{" "}
                    means House of Prayer, Abuakwa branch, member #001.
                </FieldDescription>
            </FieldSet>
        </FieldGroup>
    )
}
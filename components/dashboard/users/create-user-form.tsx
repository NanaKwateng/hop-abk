// src/components/users/create-user-form.tsx

"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createMember } from "@/actions/member"
import { blobUrlToBase64 } from "@/lib/utils/blob-to-base64"
import { toast } from "sonner"
import {
    createUserSchema,
    CreateUserInput,
    STEP_FIELDS,
    TOTAL_STEPS,
} from "@/lib/validations/create-user-schema"

import { StepDots } from "./step-dots"
import { StepContainer } from "./step-container"

import { StepOneBasicInfo } from "@/components/dashboard/users/steps-form/step-one-basic-info"
import { StepTwoAddress } from "@/components/dashboard/users/steps-form/step-two-form"
import { StepThreeRoles } from "@/components/dashboard/users/steps-form/step-three-form"
import { StepFourPhoto } from "./steps-form/step-four-photo"
import { StepFiveMemberId } from "./steps-form/step-five-member-id"
import { StepSixCertificate } from "./steps-form/step-six-certificate"
import { FormReview } from "./form-review"
import { SubmitLoading } from "./submit-loading"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"

import type { Member } from "@/lib/types"

type FormPhase = "filling" | "reviewing" | "submitting" | "certificate"

export default function CreateUserForm() {
    const [step, setStep] = useState(1)
    const [direction, setDirection] = useState<"forward" | "backward">("forward")
    const [phase, setPhase] = useState<FormPhase>("filling")
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
    const [createdMember, setCreatedMember] = useState<Member | null>(null)

    const form = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            gender: "male", // Provide a valid enum value
            phone: "",
            phoneCountry: "GH", // Default moved from schema to here, set to GH
            agreeToRegulations: false,
            placeOfStay: "",
            houseNumber: "",
            memberPosition: "elder", // Provide a valid enum value
            addressComments: "",
            memberGroup: "mens_fellowship", // Provide a valid enum value
            occupationType: "health", // Provide a valid enum value
            email: "",
            dateOfBirth: "",
            roleComments: "",
            avatarUrl: "",
            membershipId: "",
        },
        mode: "onTouched",
    });

    const { trigger, watch, reset } = form
    const values = watch()

    // ---------- Navigation ----------

    const goToStep = useCallback(
        (target: number) => {
            setDirection(target > step ? "forward" : "backward")
            setStep(target)
            setPhase("filling")
        },
        [step]
    )

    async function next() {
        const fields = STEP_FIELDS[step]

        // Step 6 has no validation fields
        if (fields && fields.length > 0) {
            const valid = await trigger(fields as any)
            if (!valid) return
        }

        setCompletedSteps((prev) => new Set([...prev, step]))

        if (step < TOTAL_STEPS) {
            setDirection("forward")
            setStep((s) => s + 1)
        }
    }

    function back() {
        if (step > 1) {
            setDirection("backward")
            setStep((s) => s - 1)
        }
    }

    // ---------- Review & Submit ----------

    async function handleReview() {
        const fields = STEP_FIELDS[step]
        if (fields && fields.length > 0) {
            const valid = await trigger(fields as any)
            if (!valid) return
        }

        setCompletedSteps((prev) => new Set([...prev, step]))
        setPhase("reviewing")
    }

    function handleEditFromReview(targetStep: number) {
        goToStep(targetStep)
    }

    async function handleConfirmSubmit() {
        const valid = await trigger()

        if (!valid) {
            setPhase("filling")
            return
        }

        try {
            setPhase("submitting")

            // ---- Convert blob URL to base64 for server upload ----
            let avatarBase64: string | undefined = undefined

            if (values.avatarUrl && values.avatarUrl.startsWith("blob:")) {
                avatarBase64 = await blobUrlToBase64(values.avatarUrl)
            }

            // ---- Build form data (WITHOUT the blob URL) ----
            const result = await createMember(
                {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    gender: values.gender,
                    phone: values.phone || undefined,
                    phoneCountry: values.phoneCountry,
                    placeOfStay: values.placeOfStay || undefined,
                    houseNumber: values.houseNumber || undefined,
                    memberPosition: values.memberPosition,
                    addressComments: values.addressComments || undefined,
                    memberGroup: values.memberGroup,
                    occupationType: values.occupationType,
                    roleComments: values.roleComments || undefined,
                    email: values.email || undefined,
                    membershipId: values.membershipId || undefined,
                },
                avatarBase64
            )

            if (!result) {
                throw new Error("Submission failed")
            }

            // ---- Clean up blob URL from browser memory ----
            if (values.avatarUrl && values.avatarUrl.startsWith("blob:")) {
                URL.revokeObjectURL(values.avatarUrl)
            }

            // Store the created member (with real avatar URL from server)
            setCreatedMember(result)

            // Move to certificate step
            setPhase("certificate")

            toast.success("Member registered successfully!", {
                description: `${result.firstName} ${result.lastName} has been added.`,
            })

        } catch (error: any) {
            console.error(error)

            toast.error("Failed to register member", {
                description: error.message ?? "Please try again.",
            })

            setPhase("reviewing")
        }
    }

    function handleReset() {
        // Clean up any lingering blob URL
        if (values.avatarUrl && values.avatarUrl.startsWith("blob:")) {
            URL.revokeObjectURL(values.avatarUrl)
        }

        reset()
        setStep(1)
        setDirection("forward")
        setPhase("filling")
        setCompletedSteps(new Set())
        setCreatedMember(null)
    }

    // ---------- Render: Loading ----------

    if (phase === "submitting") {
        return (
            <div className="mx-auto max-w-2xl min-h-screen flex items-center justify-center p-4">
                <SubmitLoading />
            </div>
        )
    }

    // ---------- Render: Certificate (Step 6) ----------

    if (phase === "certificate") {
        return (
            <div className="mx-auto max-w-5xl min-h-screen flex flex-col p-4">
                {/* Header */}
                <div className="mb-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Membership Certificate
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Step 6 of {TOTAL_STEPS} — Preview & Download
                            </p>
                        </div>
                    </div>
                    <StepDots
                        step={6}
                        completedSteps={new Set([1, 2, 3, 4, 5, 6])}
                    />
                </div>

                {/* Certificate Component */}
                <StepSixCertificate
                    data={{
                        firstName: createdMember?.firstName || values.firstName,
                        lastName: createdMember?.lastName || values.lastName,
                        membershipId:
                            createdMember?.membershipId || values.membershipId,
                        phone: createdMember?.phone || values.phone,
                        avatarUrl:
                            createdMember?.avatarUrl || values.avatarUrl,
                        memberGroup:
                            createdMember?.memberGroup || values.memberGroup,
                        memberPosition:
                            createdMember?.memberPosition ||
                            values.memberPosition,
                    }}
                    onReset={handleReset}
                />
            </div>
        )
    }

    // ---------- Render: Review ----------

    if (phase === "reviewing") {
        return (
            <div className="mx-auto max-w-2xl min-h-screen flex flex-col p-4">
                <FormReview
                    data={values}
                    onEdit={handleEditFromReview}
                    onConfirm={handleConfirmSubmit}
                    isSubmitting={false}
                />
            </div>
        )
    }

    // ---------- Render: Form Steps (1-5) ----------

    // Only steps 1-5 are fillable form steps
    const FILLABLE_STEPS = 5;

    return (
        <div className="mx-auto max-w-2xl min-h-screen flex flex-col p-4">
            {/* Header */}
            <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Register Member
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Step {step} of {TOTAL_STEPS}
                        </p>
                    </div>
                </div>

                <StepDots step={step} completedSteps={completedSteps} />
            </div>

            {/* Step Content */}
            <div className="flex-1">
                <StepContainer stepKey={step} direction={direction}>
                    {step === 1 && <StepOneBasicInfo form={form} />}
                    {step === 2 && <StepTwoAddress form={form} />}
                    {step === 3 && <StepThreeRoles form={form} />}
                    {step === 4 && <StepFourPhoto form={form} />}
                    {step === 5 && <StepFiveMemberId form={form} />}
                </StepContainer>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between border-t pt-6 mt-8">
                <Button
                    variant="outline"
                    onClick={back}
                    disabled={step === 1}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>

                <div className="flex gap-3">
                    {step < FILLABLE_STEPS ? (
                        <Button onClick={next}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleReview}>
                            <Eye className="mr-2 h-4 w-4" />
                            Review & Submit
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
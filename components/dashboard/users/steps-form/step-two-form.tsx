// src/components/users/steps-form/step-two-address.tsx

"use client"

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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MessageCirclePlus } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import type { CreateUserInput } from "@/lib/validations/create-user-schema"

interface StepTwoProps {
    form: UseFormReturn<CreateUserInput>
}

export function StepTwoAddress({ form }: StepTwoProps) {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = form

    const memberPosition = watch("memberPosition")

    return (
        <FieldGroup>
            <FieldSet>
                <FieldLegend>Member Address Details</FieldLegend>
                <FieldDescription>
                    Enter residential address and position details.
                </FieldDescription>

                <FieldGroup>
                    {/* Place of Stay */}
                    <Field>
                        <FieldLabel htmlFor="placeOfStay">Place of Stay</FieldLabel>
                        <Input
                            id="placeOfStay"
                            placeholder="Abuakwa 06"
                            {...register("placeOfStay")}
                            aria-invalid={!!errors.placeOfStay}
                        />
                        {errors.placeOfStay && (
                            <p className="text-xs text-destructive">
                                {errors.placeOfStay.message}
                            </p>
                        )}
                    </Field>

                    {/* House Number */}
                    <Field>
                        <FieldLabel htmlFor="houseNumber">House Number</FieldLabel>
                        <Input
                            id="houseNumber"
                            placeholder="A7 000 000"
                            {...register("houseNumber")}
                            aria-invalid={!!errors.houseNumber}
                        />
                        <FieldDescription>
                            Enter residential house or plot number.
                        </FieldDescription>
                        {errors.houseNumber && (
                            <p className="text-xs text-destructive">
                                {errors.houseNumber.message}
                            </p>
                        )}
                    </Field>

                    {/* Member Position */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>Member Position</FieldLabel>
                            <Select
                                value={memberPosition}
                                onValueChange={(val) =>
                                    setValue(
                                        "memberPosition",
                                        val as "elder" | "deacon" | "member",
                                        { shouldValidate: true }
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="elder">Elder</SelectItem>
                                        <SelectItem value="deacon">Deacon</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.memberPosition && (
                                <p className="text-xs text-destructive">
                                    {errors.memberPosition.message}
                                </p>
                            )}
                        </Field>
                    </div>
                </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
                <FieldLegend>Quick Tip</FieldLegend>
                <FieldDescription className="flex items-start gap-2">
                    <MessageCirclePlus className="mt-0.5 h-4 w-4 shrink-0" />
                    Member position must be chosen correctly to improve search results.
                </FieldDescription>
            </FieldSet>

            {/* Comments */}
            <FieldSet>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="addressComments">
                            Comments (Optional)
                        </FieldLabel>
                        <Textarea
                            id="addressComments"
                            placeholder="Add any additional address notes"
                            className="resize-none"
                            {...register("addressComments")}
                        />
                    </Field>
                </FieldGroup>
            </FieldSet>
        </FieldGroup>
    )
}
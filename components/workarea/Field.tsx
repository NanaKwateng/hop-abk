// src/components/users/steps-form/step-one-basic-info.tsx

"use client"

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PhoneInput } from "@/components/dashboard/users/phone-input"
import type { UseFormReturn } from "react-hook-form"
import type { CreateUserInput } from "@/lib/validations/create-user-schema"

interface StepOneProps {
    form: UseFormReturn<CreateUserInput>
}

export function StepOneBasicInfo({ form }: StepOneProps) {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = form

    const gender = watch("gender")
    const phone = watch("phone") || ""
    const phoneCountry = watch("phoneCountry") || "GH"
    const agreed = watch("agreeToRegulations")

    return (
        <FieldGroup>
            <FieldSet>
                <FieldLegend>Member Basic Information</FieldLegend>
                <FieldDescription>
                    All information received must be cross-checked for transparency.
                </FieldDescription>

                <FieldGroup>
                    {/* First Name */}
                    <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input
                            id="firstName"
                            placeholder="Brian"
                            {...register("firstName")}
                            aria-invalid={!!errors.firstName}
                        />
                        {errors.firstName && (
                            <p className="text-xs text-destructive">
                                {errors.firstName.message}
                            </p>
                        )}
                    </Field>

                    {/* Last Name */}
                    <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input
                            id="lastName"
                            placeholder="Richardson"
                            {...register("lastName")}
                            aria-invalid={!!errors.lastName}
                        />
                        {errors.lastName && (
                            <p className="text-xs text-destructive">
                                {errors.lastName.message}
                            </p>
                        )}
                    </Field>

                    {/* Phone */}
                    <Field>
                        <FieldLabel>Phone Number</FieldLabel>
                        <PhoneInput
                            value={phone}
                            country={phoneCountry}
                            onValueChange={(val) => setValue("phone", val, { shouldValidate: true })}
                            onCountryChange={(c) => setValue("phoneCountry", c)}
                            error={errors.phone?.message}
                        />
                        <FieldDescription>
                            Enter member&apos;s contact number with country code.
                        </FieldDescription>
                        {errors.phone && (
                            <p className="text-xs text-destructive">
                                {errors.phone.message}
                            </p>
                        )}
                    </Field>

                    {/* Gender */}
                    <Field>
                        <FieldLabel>Gender</FieldLabel>
                        <RadioGroup
                            value={gender}
                            onValueChange={(val) =>
                                setValue("gender", val as "male" | "female", {
                                    shouldValidate: true,
                                })
                            }
                            className="w-full"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <Field orientation="horizontal">
                                    <RadioGroupItem value="male" id="gender-male" />
                                    <FieldContent>
                                        <FieldLabel htmlFor="gender-male">Male</FieldLabel>
                                        <FieldDescription>
                                            Adult males fall under Men&apos;s Fellowship.
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>

                                <Field orientation="horizontal">
                                    <RadioGroupItem value="female" id="gender-female" />
                                    <FieldContent>
                                        <FieldLabel htmlFor="gender-female">Female</FieldLabel>
                                        <FieldDescription>
                                            Young females belong to the Youth Fellowship.
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                            </div>
                        </RadioGroup>
                        {errors.gender && (
                            <p className="text-xs text-destructive">
                                {errors.gender.message}
                            </p>
                        )}
                    </Field>
                </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Agreement */}
            <FieldSet>
                <FieldLegend>Important Notice</FieldLegend>
                <FieldDescription>
                    Member must adhere to all rules and regulations governing the church.
                </FieldDescription>
                <FieldGroup>
                    <Field orientation="horizontal">
                        <Checkbox
                            id="agree-regulations"
                            checked={agreed}
                            onCheckedChange={(checked) =>
                                setValue("agreeToRegulations", checked === true, {
                                    shouldValidate: true,
                                })
                            }
                        />
                        <FieldLabel htmlFor="agree-regulations" className="font-normal">
                            I agree to all rules and regulations.
                        </FieldLabel>
                    </Field>
                    {errors.agreeToRegulations && (
                        <p className="text-xs text-destructive">
                            {errors.agreeToRegulations.message}
                        </p>
                    )}
                </FieldGroup>
            </FieldSet>
        </FieldGroup>
    )
}
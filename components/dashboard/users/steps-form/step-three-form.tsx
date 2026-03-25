// src/components/users/steps-form/step-three-roles.tsx

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
import type { UseFormReturn } from "react-hook-form"
import type { CreateUserInput } from "@/lib/validations/create-user-schema"

interface StepThreeProps {
    form: UseFormReturn<CreateUserInput>
}

export function StepThreeRoles({ form }: StepThreeProps) {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = form

    const memberGroup = watch("memberGroup")
    const occupationType = watch("occupationType")

    return (
        <FieldGroup>
            <FieldSet>
                <FieldLegend>Member Roles and Duties</FieldLegend>
                <FieldDescription>
                    Member occupation type, roles, and fellowship assignment.
                </FieldDescription>

                <FieldGroup>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Member Group */}
                        <Field>
                            <FieldLabel>Member Group</FieldLabel>
                            <Select
                                value={memberGroup}
                                onValueChange={(val) =>
                                    setValue(
                                        "memberGroup",
                                        val as CreateUserInput["memberGroup"],
                                        { shouldValidate: true }
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="mens_fellowship">
                                            Men&apos;s Fellowship
                                        </SelectItem>
                                        <SelectItem value="womens_fellowship">
                                            Women&apos;s Fellowship
                                        </SelectItem>
                                        <SelectItem value="youth_fellowship">
                                            Youth Fellowship
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.memberGroup && (
                                <p className="text-xs text-destructive">
                                    {errors.memberGroup.message}
                                </p>
                            )}
                        </Field>

                        {/* Occupation Type */}
                        <Field>
                            <FieldLabel>Occupation Type</FieldLabel>
                            <Select
                                value={occupationType}
                                onValueChange={(val) =>
                                    setValue(
                                        "occupationType",
                                        val as CreateUserInput["occupationType"],
                                        { shouldValidate: true }
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select occupation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="health">Health</SelectItem>
                                        <SelectItem value="business">
                                            Business and Trade
                                        </SelectItem>
                                        <SelectItem value="construction">Construction</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="fashion">
                                            Fashion &amp; Clothing
                                        </SelectItem>
                                        <SelectItem value="others">Others</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.occupationType && (
                                <p className="text-xs text-destructive">
                                    {errors.occupationType.message}
                                </p>
                            )}
                        </Field>
                    </div>

                    {/* Email (optional) */}
                    <Field>
                        <FieldLabel htmlFor="email">Email (Optional)</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="member@example.com"
                            {...register("email")}
                        />
                        <FieldDescription>
                            For digital communication and notifications.
                        </FieldDescription>
                        {errors.email && (
                            <p className="text-xs text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </Field>

                    {/* Date of Birth (optional) */}
                    <Field>
                        <FieldLabel htmlFor="dateOfBirth">
                            Date of Birth (Optional)
                        </FieldLabel>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            {...register("dateOfBirth")}
                        />
                        <FieldDescription>
                            Used for birthday reminders and age demographics.
                        </FieldDescription>
                    </Field>
                </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
                <FieldLegend>Careful Structure</FieldLegend>
                <FieldDescription>
                    Due to search result robustness, ensure data is correct before
                    proceeding.
                </FieldDescription>
            </FieldSet>

            {/* Comments */}
            <FieldSet>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="roleComments">
                            Role Comments (Optional)
                        </FieldLabel>
                        <Textarea
                            id="roleComments"
                            placeholder="Add any additional role or duty undertaken by the member."
                            className="resize-none"
                            {...register("roleComments")}
                        />
                    </Field>
                </FieldGroup>
            </FieldSet>
        </FieldGroup>
    )
}
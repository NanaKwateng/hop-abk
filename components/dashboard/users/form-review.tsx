// src/components/users/form-review.tsx

"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    User,
    Phone,
    MapPin,
    Briefcase,
    IdCard,
    Edit,
    Send,
} from "lucide-react"
import { COUNTRY_CODES } from "@/lib/utils/phone"
import type { CreateUserInput } from "@/lib/validations/create-user-schema"

interface FormReviewProps {
    data: CreateUserInput
    onEdit: (step: number) => void
    onConfirm: () => void
    isSubmitting: boolean
}

function ReviewSection({
    icon: Icon,
    title,
    stepNumber,
    onEdit,
    children,
}: {
    icon: React.ElementType
    title: string
    stepNumber: number
    onEdit: (step: number) => void
    children: React.ReactNode
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{title}</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(stepNumber)}
                    className="h-7 text-xs"
                >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                </Button>
            </div>
            <div className="grid gap-2 pl-6">{children}</div>
        </div>
    )
}

function ReviewItem({
    label,
    value,
}: {
    label: string
    value?: string | null
}) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value || "—"}</span>
        </div>
    )
}

const GROUP_LABELS: Record<string, string> = {
    mens_fellowship: "Men's Fellowship",
    womens_fellowship: "Women's Fellowship",
    youth_fellowship: "Youth Fellowship",
}

const OCCUPATION_LABELS: Record<string, string> = {
    health: "Health",
    business: "Business & Trade",
    construction: "Construction",
    student: "Student",
    fashion: "Fashion & Clothing",
    others: "Others",
}

const POSITION_LABELS: Record<string, string> = {
    elder: "Elder",
    deacon: "Deacon",
    member: "Member",
}

export function FormReview({
    data,
    onEdit,
    onConfirm,
    isSubmitting,
}: FormReviewProps) {
    const country = COUNTRY_CODES.find((c) => c.code === data.phoneCountry)
    const phoneDisplay = country
        ? `${country.flag} ${country.dial} ${data.phone}`
        : data.phone

    return (
        <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Review Member Details</CardTitle>
                <CardDescription>
                    Please review all information before submitting. Click
                    &quot;Edit&quot; to correct any section.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Avatar */}
                {data.avatarUrl && (
                    <div className="flex justify-center">
                        <Image
                            src={data.avatarUrl}
                            alt="Member profile"
                            width={100}
                            height={100}
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-muted"
                        />
                    </div>
                )}

                {/* Basic Info */}
                <ReviewSection
                    icon={User}
                    title="Basic Information"
                    stepNumber={1}
                    onEdit={onEdit}
                >
                    <ReviewItem
                        label="Full Name"
                        value={`${data.firstName} ${data.lastName}`}
                    />
                    <ReviewItem label="Gender" value={data.gender} />
                    <ReviewItem label="Phone" value={phoneDisplay} />
                </ReviewSection>

                <Separator />

                {/* Address */}
                <ReviewSection
                    icon={MapPin}
                    title="Address Details"
                    stepNumber={2}
                    onEdit={onEdit}
                >
                    <ReviewItem label="Place of Stay" value={data.placeOfStay} />
                    <ReviewItem label="House Number" value={data.houseNumber} />
                    <ReviewItem
                        label="Position"
                        value={POSITION_LABELS[data.memberPosition] ?? data.memberPosition}
                    />
                    {data.addressComments && (
                        <ReviewItem label="Notes" value={data.addressComments} />
                    )}
                </ReviewSection>

                <Separator />

                {/* Roles */}
                <ReviewSection
                    icon={Briefcase}
                    title="Roles & Duties"
                    stepNumber={3}
                    onEdit={onEdit}
                >
                    <ReviewItem
                        label="Fellowship Group"
                        value={GROUP_LABELS[data.memberGroup] ?? data.memberGroup}
                    />
                    <ReviewItem
                        label="Occupation"
                        value={
                            OCCUPATION_LABELS[data.occupationType] ?? data.occupationType
                        }
                    />
                    {data.email && <ReviewItem label="Email" value={data.email} />}
                    {data.dateOfBirth && (
                        <ReviewItem label="Date of Birth" value={data.dateOfBirth} />
                    )}
                    {data.roleComments && (
                        <ReviewItem label="Notes" value={data.roleComments} />
                    )}
                </ReviewSection>

                <Separator />

                {/* Membership ID */}
                <ReviewSection
                    icon={IdCard}
                    title="Membership ID"
                    stepNumber={5}
                    onEdit={onEdit}
                >
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-base tracking-wider">
                            {data.membershipId}
                        </Badge>
                    </div>
                </ReviewSection>

                <Separator />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onEdit(1)}
                        disabled={isSubmitting}
                    >
                        Go Back & Edit
                    </Button>

                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>Submitting…</>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Confirm & Submit
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
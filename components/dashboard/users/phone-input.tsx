// src/components/users/phone-input.tsx

"use client"

import { COUNTRY_CODES } from "@/lib/utils/phone"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PhoneInputProps {
    value: string
    country: string
    onValueChange: (phone: string) => void
    onCountryChange: (country: string) => void
    error?: string
}

export function PhoneInput({
    value,
    country,
    onValueChange,
    onCountryChange,
    error,
}: PhoneInputProps) {
    const selectedCountry = COUNTRY_CODES.find((c) => c.code === country)

    return (
        <div className="flex gap-2">
            <Select value={country} onValueChange={onCountryChange}>
                <SelectTrigger className="w-[130px] shrink-0">
                    <SelectValue>
                        {selectedCountry
                            ? `${selectedCountry.flag} ${selectedCountry.dial}`
                            : "Country"}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-2">
                                <span>{c.flag}</span>
                                <span className="text-xs text-muted-foreground">
                                    {c.dial}
                                </span>
                                <span className="text-sm">{c.label}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                type="tel"
                placeholder="568 9011"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className={error ? "border-destructive" : ""}
            />
        </div>
    )
}
// src/lib/utils/phone.ts

import {
    parsePhoneNumberFromString,
    type CountryCode,
} from "libphonenumber-js"

export const COUNTRY_CODES = [
    { code: "GH", label: "Ghana", dial: "+233", flag: "🇬🇭" },
    { code: "NG", label: "Nigeria", dial: "+234", flag: "🇳🇬" },
    { code: "US", label: "United States", dial: "+1", flag: "🇺🇸" },
    { code: "GB", label: "United Kingdom", dial: "+44", flag: "🇬🇧" },
    { code: "KE", label: "Kenya", dial: "+254", flag: "🇰🇪" },
    { code: "ZA", label: "South Africa", dial: "+27", flag: "🇿🇦" },
    { code: "CA", label: "Canada", dial: "+1", flag: "🇨🇦" },
    { code: "DE", label: "Germany", dial: "+49", flag: "🇩🇪" },
    { code: "FR", label: "France", dial: "+33", flag: "🇫🇷" },
    { code: "IN", label: "India", dial: "+91", flag: "🇮🇳" },
] as const

export function validatePhone(number: string, country: string): boolean {
    const phone = parsePhoneNumberFromString(
        number,
        country as CountryCode
    )
    return phone?.isValid() ?? false
}

export function formatPhoneDisplay(number: string, country: string): string {
    const phone = parsePhoneNumberFromString(
        number,
        country as CountryCode
    )
    return phone?.formatInternational() ?? number
}
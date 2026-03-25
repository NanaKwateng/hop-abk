// src/components/users/department-select.tsx

"use client"

import {
    Command,
    CommandInput,
    CommandList,
    CommandItem
} from "@/components/ui/command"

const departments = [
    "Finance",
    "Media",
    "Operations",
    "Logistics",
    "Outreach"
]

export default function DepartmentSelect({
    onSelect
}: { onSelect: (v: string) => void }) {

    return (

        <Command>

            <CommandInput placeholder="Search department" />

            <CommandList>

                {departments.map(dep => (
                    <CommandItem
                        key={dep}
                        onSelect={() => onSelect(dep)}
                    >
                        {dep}
                    </CommandItem>
                ))}

            </CommandList>

        </Command>

    )

}






// src/components/users/preview-popover.tsx

"use client"

import {
    Popover,
    PopoverTrigger,
    PopoverContent
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"

export default function PreviewPopover({
    data,
    submit
}: {
    data: any
    submit: () => void
}) {

    return (

        <Popover>

            <PopoverTrigger asChild>
                <Button>Submit</Button>
            </PopoverTrigger>

            <PopoverContent className="w-96">

                <div className="space-y-2 text-sm">

                    <p><b>Name:</b> {data.firstName} {data.lastName}</p>
                    <p><b>Gender:</b> {data.gender}</p>
                    <p><b>Phone:</b> {data.phone}</p>
                    <p><b>Address:</b> {data.address}</p>
                    <p><b>Role:</b> {data.role}</p>
                    <p><b>Department:</b> {data.department}</p>

                </div>

                <div className="flex justify-end gap-2 mt-4">

                    <Button variant="outline">
                        Cancel
                    </Button>

                    <Button onClick={submit}>
                        Confirm
                    </Button>

                </div>

            </PopoverContent>

        </Popover>

    )

}
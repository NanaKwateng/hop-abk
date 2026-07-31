import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export default function Loading() {

    return (
        <div className="h-screen w-full mx-auto flex items-center justify-center overflow-hidden">

            {/* <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
             */}
            <figure className="relative w-500 h-500 space-y-2">
                <Image
                    src="/images/server.gif"
                    alt="server query" className="absolute inset-0"
                    fill
                    priority
                />
                <Skeleton className="h-5 w-15 mx-auto rounded-full" />
                <figcaption className="text-gray-400">
                    Connecting to the server, please wait ..
                </figcaption>
            </figure>

        </div>
    )
}
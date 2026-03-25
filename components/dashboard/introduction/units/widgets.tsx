import Calendar from "@/components/widgets/calendar";
import Clock from "@/components/widgets/clock";
import Productivity from "@/components/widgets/productivity";
import Weather from "@/components/widgets/weather";

export default function Widgets() {
    return (
        <main className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">

            {/* 'col-span-2' forces this component to take the full width of the 2-column grid */}
            <div className="col-span-2">
                <Productivity />
            </div>

            {/* These will sit side-by-side in the 2-column grid */}
            <Calendar />
            <Clock />
            <Weather />

        </main>
    )
}

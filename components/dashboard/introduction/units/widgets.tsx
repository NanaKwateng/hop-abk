import Calendar from "@/components/widgets/calendar";
import Clock from "@/components/widgets/clock";
import Productivity from "@/components/widgets/productivity";
import Weather from "@/components/widgets/weather";

export default function Widgets() {
    return (
        <main className="grid grid-cols-1 md:grid-cols-2  gap-4 items-start">
            <Calendar />
            <Weather />
        </main>
    )
}

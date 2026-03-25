import AnalyticsUnit from "../units/analytics-unit";
import WelcomeText from "../units/welcome-text";
import Widgets from "../units/widgets";



export default function MainPage() {
    return (
        <section className="min-h-screen w-full mx-auto p-5 space-y-24">
            <main className="flex items-start justify-between w-full gap-12 flex-1 flex-col">
                <WelcomeText />
                <Widgets />
            </main>
            <div className="">
                <AnalyticsUnit />
            </div>
        </section>
    )
}





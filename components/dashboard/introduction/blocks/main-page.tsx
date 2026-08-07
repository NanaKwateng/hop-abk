import AnalyticsUnit from "../units/analytics-unit";
import WelcomeText from "../units/welcome-text";
import Widgets from "../units/widgets";
import PatternCardContainer from "@/components/pattern-card";

export default function MainPage() {
    return (
        <section className="min-h-screen w-full mx-auto p-5 space-y-12">
            {/* Reusable Container wrapping hero components with puzzle background & glow */}
            <PatternCardContainer
                bgColor={["#F9D658", "#E2D9F8", "#EDF6EF", "#FFF2EA"]}
                intervalDuration={4000}
                className="shadow-lg">
                <main className="flex items-start justify-between w-full gap-12 flex-1 flex-col">
                    <WelcomeText />
                    <Widgets />
                </main>
            </PatternCardContainer>

            {/* Subsequent Page Units */}
            <div className="w-full">
                <AnalyticsUnit />
            </div>
        </section>
    );
}
import { TabsDemo } from "@/components/workarea/Tabs";

export default function AnalyticsUnit() {
    return (
        <section className="w-full h-full space-y-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
                <h2 className="text-3xl font-bold tracking-tight">
                    Real-time Performance <br /> & Trend Analytics
                </h2>

                <p className="text-sm text-muted-foreground max-w-md">
                    Monitor key performance indicators, track user engagement, and gain
                    actionable insights through our integrated data visualization suite.
                </p>
            </div>

            <div className="w-full">
                <TabsDemo />
            </div>

            <p className="text-xs text-muted-foreground border-t pt-4">
                Data is updated every 15 minutes. For custom reporting periods or
                advanced filtering options, please refer to the detailed documentation
                within the Reports module.
            </p>
        </section>
    )
}

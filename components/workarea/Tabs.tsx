// components/dashboard/overview/TabsDemo.tsx
// ════════════════════════════════════════════════════════════
// This is the main dashboard tabs component.
// It's an ASYNC server component that fetches all chart data
// in parallel, then passes data as props to each chart.
//
// Import paths match your existing file structure:
//   ./LineChart    → ChartLineLabel
//   ./PieChart     → ChartPieInteractive
//   ./BarChart     → ChartBarLabelCustom
//   ../chart-area-interactive → ChartAreaInteractive
// ════════════════════════════════════════════════════════════

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ChartLineLabel } from "./LineChart";
import { ChartPieInteractive } from "./PieChart";
import { ChartBarLabelCustom } from "./BarChart";
import { ChartAreaInteractive } from "../chart-area-interactive";
import {
    fetchGenderDistribution,
    fetchGroupDistribution,
    fetchPaymentCollectionData,
    fetchRegistrationData,
} from "@/actions/dashboard-charts";

export async function TabsDemo() {
    const currentYear = new Date().getFullYear();

    // Fetch all chart data in parallel — total load time = slowest query
    const [registrationData, groupData, paymentData, genderData] =
        await Promise.all([
            fetchRegistrationData(currentYear),
            fetchGroupDistribution(),
            fetchPaymentCollectionData(currentYear),
            fetchGenderDistribution("12m"),
        ]);

    return (
        <Tabs defaultValue="overview" className="w-full space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 md:grid-cols-4 lg:max-w-xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="settings">Usage</TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Overview → Member Registrations Line Chart ── */}
            <TabsContent value="overview" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Membership Overview</CardTitle>
                        <CardDescription>
                            Monthly registration activity and cumulative member
                            growth for {currentYear}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                        <ChartLineLabel data={registrationData} />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* ── Tab 2: Analytics → Group Distribution Pie Chart ── */}
            <TabsContent value="analytics" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Group Analytics</CardTitle>
                        <CardDescription>
                            Distribution of members across ministry groups.
                            Select a group to see its share.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                        <ChartPieInteractive data={groupData} />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* ── Tab 3: Reports → Payment Collections Bar Chart ── */}
            <TabsContent value="reports" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Payment Reports</CardTitle>
                        <CardDescription>
                            Monthly payment collection breakdown and compliance
                            rates for {currentYear}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                        <ChartBarLabelCustom data={paymentData} />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* ── Tab 4: Usage → Gender Distribution Area Chart ── */}
            <TabsContent value="settings" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Gender Distribution</CardTitle>
                        <CardDescription>
                            Male and female member counts over time. Toggle the
                            time range to zoom in or out.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                        <ChartAreaInteractive data={genderData} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
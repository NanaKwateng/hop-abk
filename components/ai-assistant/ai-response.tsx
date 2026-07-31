// components/ai-assistant/ai-response.tsx

"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIResponseProps {
    data: any;
    chart?: {
        type: "bar" | "line" | "pie" | "table";
        data: any[];
        config: any;
    };
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

export function AIResponse({ data, chart }: AIResponseProps) {
    if (!data && !chart) return null;

    if (chart && chart.data && chart.data.length > 0) {
        switch (chart.type) {
            case "bar":
                return <AIResponseBarChart data={chart.data} config={chart.config} />;
            case "line":
                return <AIResponseLineChart data={chart.data} config={chart.config} />;
            case "pie":
                return <AIResponsePieChart data={chart.data} config={chart.config} />;
            case "table":
                return <AIResponseTable data={chart.data} config={chart.config} />;
            default:
                return null;
        }
    }

    // If we have data but no chart config, show as table
    if (data && Array.isArray(data) && data.length > 0) {
        return <AIResponseTable data={data} config={{ columns: Object.keys(data[0]) }} />;
    }

    return null;
}

function AIResponseBarChart({ data, config }: any) {
    if (!data || data.length === 0) return null;

    return (
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={config?.xAxis || "name"} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                        }}
                    />
                    <Bar
                        dataKey={config?.yAxis || "value"}
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function AIResponseLineChart({ data, config }: any) {
    if (!data || data.length === 0) return null;

    return (
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={config?.xAxis || "name"} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey={config?.yAxis || "value"}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function AIResponsePieChart({ data, config }: any) {
    if (!data || data.length === 0) return null;

    return (
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey={config?.value || "value"}
                        nameKey={config?.label || "name"}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

function AIResponseTable({ data, config }: any) {
    if (!data || data.length === 0) return null;

    const columns = config?.columns || Object.keys(data[0]);
    const displayData = data.slice(0, 20);

    return (
        <div className="mt-4 rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        {columns.map((col: string) => (
                            <TableHead key={col} className="capitalize text-xs font-semibold">
                                {col.replace(/_/g, " ")}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {displayData.map((row: any, index: number) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                            {columns.map((col: string) => (
                                <TableCell key={col} className="text-sm">
                                    {row[col] !== undefined && row[col] !== null ? String(row[col]) : "—"}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {data.length > 20 && (
                <div className="p-2 text-center text-xs text-muted-foreground bg-muted/10">
                    Showing 20 of {data.length} results
                </div>
            )}
        </div>
    );
}
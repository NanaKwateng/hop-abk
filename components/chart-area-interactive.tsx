// components/dashboard/chart-area-interactive.tsx
"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import type { GenderDistributionData } from "@/lib/types/dashboard-analytics";

// ── Explicit colors that work on both light and dark backgrounds ──
const MALE_COLOR = "#2563eb";   // Blue-600 — always visible
const FEMALE_COLOR = "#e11d48"; // Rose-600 — always visible

const chartConfig = {
  members: {
    label: "Members",
  },
  male: {
    label: "Male",
    color: MALE_COLOR,
  },
  female: {
    label: "Female",
    color: FEMALE_COLOR,
  },
} satisfies ChartConfig;

// ── Time range options ──
type TimeRange = "12m" | "6m" | "3m";

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "12m", label: "All Time" },
  { value: "6m", label: "This Year" },
  { value: "3m", label: "Last 6 Months" },
];

interface ChartAreaInteractiveProps {
  data: GenderDistributionData;
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange>("12m");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("6m");
    }
  }, [isMobile]);

  // ── Filter snapshots based on selected time range ──
  const filteredData = React.useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "3m": {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      }
      case "6m": {
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      }
      case "12m":
      default: {
        if (data.snapshots.length > 0) {
          startDate = new Date(data.snapshots[0].date);
        } else {
          startDate = new Date(now.getFullYear() - 1, 0, 1);
        }
        break;
      }
    }

    return data.snapshots.filter(
      (snapshot) => new Date(snapshot.date) >= startDate
    );
  }, [data.snapshots, timeRange]);

  // ── Summary stats ──
  const { currentMale, currentFemale, totalMembers } = data;
  const malePercentage =
    totalMembers > 0
      ? Math.round((currentMale / totalMembers) * 100)
      : 0;
  const femalePercentage =
    totalMembers > 0
      ? Math.round((currentFemale / totalMembers) * 100)
      : 0;

  // ── Trend calculation ──
  const trend = React.useMemo(() => {
    if (filteredData.length < 2)
      return { percentage: 0, direction: "flat" as const };

    const latest = filteredData[filteredData.length - 1];
    const previous = filteredData[filteredData.length - 2];

    const latestTotal = (latest.male ?? 0) + (latest.female ?? 0);
    const previousTotal = (previous.male ?? 0) + (previous.female ?? 0);

    if (previousTotal === 0)
      return { percentage: 0, direction: "flat" as const };

    const change =
      ((latestTotal - previousTotal) / previousTotal) * 100;
    const rounded = Math.abs(Math.round(change * 10) / 10);

    return {
      percentage: rounded,
      direction:
        change > 0
          ? ("up" as const)
          : change < 0
            ? ("down" as const)
            : ("flat" as const),
    };
  }, [filteredData]);

  // ── Date range label for footer ──
  const dateRangeLabel = React.useMemo(() => {
    if (filteredData.length === 0) return "No data available";

    const first = new Date(filteredData[0].date);
    const last = new Date(filteredData[filteredData.length - 1].date);

    return `${first.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })} – ${last.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  }, [filteredData]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: MALE_COLOR }}
              />
              {currentMale} male ({malePercentage}%)
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: FEMALE_COLOR }}
              />
              {currentFemale} female ({femalePercentage}%)
            </span>
            <span className="text-muted-foreground">·</span>
            <span>{totalMembers} total</span>
          </span>
          <span className="@[540px]/card:hidden">
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: MALE_COLOR }}
              />
              {currentMale}M
            </span>{" "}
            ·{" "}
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: FEMALE_COLOR }}
              />
              {currentFemale}F
            </span>{" "}
            · {totalMembers} total
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => {
              if (v) setTimeRange(v as TimeRange);
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            {TIME_RANGE_OPTIONS.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
              >
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Select
            value={timeRange}
            onValueChange={(v) =>
              setTimeRange(v as TimeRange)
            }
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {TIME_RANGE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-lg"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* 
                    IMPORTANT: Override CSS variables inline on the container 
                    so ChartContainer/Recharts can resolve them.
                    This guarantees colors work regardless of theme config.
                */}
        <div
          style={{
            ["--color-male" as string]: MALE_COLOR,
            ["--color-female" as string]: FEMALE_COLOR,
          }}
        >
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={filteredData}
              margin={{
                left: 12,
                right: 12,
                top: 8,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (timeRange === "12m") {
                    return date.toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        year: "2-digit",
                      }
                    );
                  }
                  return date.toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                    }
                  );
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(
                        value
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      );
                    }}
                    indicator="dot"
                    formatter={(
                      value,
                      name
                    ) => {
                      const label =
                        name === "male"
                          ? "Male"
                          : "Female";
                      return (
                        <span>
                          {label}:{" "}
                          {(
                            value as number
                          ).toLocaleString()}{" "}
                          members
                        </span>
                      );
                    }}
                  />
                }
              />

              {/* Male line — hardcoded stroke for guaranteed visibility */}
              <Line
                dataKey="male"
                type="monotone"
                stroke={MALE_COLOR}
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: MALE_COLOR,
                  stroke: "white",
                  strokeWidth: 2,
                }}
              />

              {/* Female line — hardcoded stroke for guaranteed visibility */}
              <Line
                dataKey="female"
                type="monotone"
                stroke={FEMALE_COLOR}
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: FEMALE_COLOR,
                  stroke: "white",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trend.direction === "up" && (
                <>
                  Trending up by {trend.percentage}%
                  this period{" "}
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </>
              )}
              {trend.direction === "down" && (
                <>
                  Trending down by{" "}
                  {trend.percentage}% this period{" "}
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </>
              )}
              {trend.direction === "flat" && (
                <>
                  No significant change this period{" "}
                  <Minus className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {dateRangeLabel}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
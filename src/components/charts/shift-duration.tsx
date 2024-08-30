"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { DateTime } from "luxon";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RouterInputs, api } from "~/trpc/react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "~/lib/db";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const chartConfig = {
  duration: {
    label: "Work hours",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function OverviewChart() {
  const [timeRange, setTimeRange] =
    React.useState<RouterInputs["shift"]["getStats"]["timeRange"]>("WEEK");

  const data = useLiveQuery(() => getChartData({ timeRange })) ?? {
    chartData: [],
    meta: {
      totalShifts: 0,
      totalDuration: 0,
      timeRange: timeRange,
      startOfTimeRange: new Date(),
      endOfTimeRange: new Date(),
    },
  };

  return (
    <Card className="m-0 rounded-xl border-none p-0">
      <CardHeader className="flex gap-2 space-y-0 pb-0">
        <div className="grid flex-1 gap-1">
          <CardTitle>
            {timeRange === "WEEK"
              ? "Weekly"
              : timeRange === "MONTH"
                ? "Monthly"
                : "Yearly"}{" "}
            Report
          </CardTitle>
          <CardDescription>
            {data.meta.startOfTimeRange.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {data.meta.endOfTimeRange.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            (
            {timeRange === "WEEK"
              ? `Week ${DateTime.fromJSDate(data.meta.startOfTimeRange).weekNumber}`
              : timeRange === "MONTH"
                ? `Month ${DateTime.fromJSDate(data.meta.startOfTimeRange).month}`
                : `Year ${DateTime.fromJSDate(data.meta.startOfTimeRange).year}`}
            )
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs
          defaultValue="YEAR"
          className="w-full px-6 py-3"
          onValueChange={(value) => setTimeRange(value as never)}
        >
          <TabsList className="w-full">
            <TabsTrigger className="w-full" value="YEAR">
              Last Week
            </TabsTrigger>
            <TabsTrigger className="w-full" value="MONTH">
              Last Month
            </TabsTrigger>
            <TabsTrigger className="w-full" value="WEEK">
              Last Year
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data.chartData ?? []}>
            <defs>
              <linearGradient id="fillDuration" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-duration)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-duration)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="duration"
              type="natural"
              fill="url(#fillDuration)"
              stroke="var(--color-duration)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

async function getChartData(input: { timeRange: "WEEK" | "MONTH" | "YEAR" }) {
  const today = new Date();

  const startOfWeek = getStartOfWeek(today);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const start =
    input.timeRange === "WEEK"
      ? startOfWeek
      : input.timeRange === "MONTH"
        ? startOfMonth
        : startOfYear;

  const shifts = await db.shifts
    .filter((shift) => shift.startedAt > start)
    .toArray();

  return {
    chartData: shifts.map((shift) => ({
      date: shift.startedAt.toDateString(),
      duration: DateTime.fromJSDate(shift.endedAt ?? new Date())
        .diff(DateTime.fromJSDate(shift.startedAt))
        .as("hours"),
    })),
    meta: {
      totalShifts: shifts.length,
      totalDuration: shifts.reduce((acc, shift) => {
        return (
          acc +
          (shift.endedAt ?? new Date()).getTime() -
          shift.startedAt.getTime()
        );
      }, 0),
      timeRange: input.timeRange,
      startOfTimeRange: start,
      endOfTimeRange: today,
    },
  };
}

function getStartOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay(); // Sunday - Saturday : 0 - 6
  const diff = (dayOfWeek + 6) % 7; // Adjust for Sunday start
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0); // Reset time to midnight

  return startOfWeek;
}

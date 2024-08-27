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

const chartConfig = {
  duration: {
    label: "Work hours",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function OverviewChart() {
  const [timeRange, setTimeRange] =
    React.useState<RouterInputs["shift"]["getStats"]["timeRange"]>("WEEK");

  const { data } = api.shift.getStats.useQuery(
    {
      timeRange: timeRange,
    },
    {
      initialData: {
        chartData: [],
        meta: {
          totalShifts: 0,
          totalDuration: 0,
          timeRange: timeRange,
          startOfTimeRange: new Date(),
          endOfTimeRange: new Date(),
        },
      },
    },
  );


  return (
    <Card className="m-0 rounded-xl border-none p-0">
      <CardHeader className="flex gap-2 space-y-0 border-b sm:flex-row">
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
            ({timeRange === "WEEK"
              ? `Week ${DateTime.fromJSDate(data.meta.startOfTimeRange).weekNumber}`
              : timeRange === "MONTH"
                ? `Month ${DateTime.fromJSDate(data.meta.startOfTimeRange).month}`
                : `Year ${DateTime.fromJSDate(data.meta.startOfTimeRange).year}`})
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(
            value: RouterInputs["shift"]["getStats"]["timeRange"],
          ) => setTimeRange(value)}
        >
          <SelectTrigger aria-label="Select a value" className="rounded-xl">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="YEAR">Last year</SelectItem>
            <SelectItem value="MONTH">Last 30 days</SelectItem>
            <SelectItem value="WEEK">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
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

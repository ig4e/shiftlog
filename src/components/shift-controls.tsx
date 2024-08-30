"use client";

import { Shift } from "@prisma/client";
import { DateTime, Duration } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { useShiftControls } from "~/hooks/use-shift-controls";

export function ShiftControls() {
  const { data, ...meta } = useShiftControls();

  const startShift = useCallback(() => {
    void toast.promise(
      new Promise((fulfuil) =>
        fulfuil(
          db.shifts.add({
            startedAt: new Date(),
            updatedAt: new Date(),
            breaks: [],
            endedAt: null,
          }),
        ),
      ),
      {
        loading: "Starting shift...",
        success: "Shift started!",
        error: "Shift failed to start",
      },
    );
  }, []);

  const endShift = useCallback(() => {
    if (!data) return;

    void toast.promise(
      new Promise((fulfuil) =>
        fulfuil(
          db.shifts.update(data.id, {
            endedAt: new Date(),
          }),
        ),
      ),
      {
        loading: "Endinging shift...",
        success: "Shift ended!",
        error: "Shift failed to end",
      },
    );
  }, [data]);

  const startBreak = useCallback(() => {
    if (!data) return;

    void toast.promise(
      new Promise((fulfuil) =>
        fulfuil(
          db.shifts.update(data.id, {
            breaks: [...data.breaks, { startedAt: new Date(), endedAt: null }],
          }),
        ),
      ),
      {
        loading: "Starting a break...",
        success: "Break started!",
        error: "Break failed to start",
      },
    );
  }, [data]);

  const endBreak = useCallback(() => {
    if (!data) return;
    const breakIndex = data.breaks.findIndex((break_) => !break_.endedAt);
    if (breakIndex === -1) return;

    void toast.promise(
      new Promise((fulfuil) =>
        fulfuil(
          db.shifts.update(data.id, {
            breaks: [
              ...data.breaks.slice(0, breakIndex),
              {
                ...data.breaks[breakIndex]!,
                endedAt: new Date(),
              },
              ...data.breaks.slice(breakIndex + 1),
            ],
          }),
        ),
      ),
      {
        loading: "Ending a break...",
        success: "Break ended!",
        error: "Break failed to end",
      },
    );
  }, [data]);

  if (!data)
    return (
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Current Shift</CardTitle>
          <CardDescription>Start your shift!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={startShift}>
            Start
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <Card className="border-none">
      <CardContent className="pt-6">
        <CardTitle
          className={cn("mb-4 text-2xl", {
            "text-white/50": meta.ongoingBreak,
          })}
        >
          {meta.formattedTime}
        </CardTitle>

        <div>
          <div className="relative flex h-6 w-full overflow-hidden rounded-md">
            <div
              style={{
                width: `${100 - (meta.breakPercentage ?? 0)}%`,
                height: "100%",
                backgroundColor: "hsl(var(--chart-1))",
              }}
            ></div>
            <div
              style={{
                width: `${meta.breakPercentage}%`,
                height: "100%",
                backgroundColor: "hsl(var(--chart-3))",
              }}
            ></div>
          </div>

          <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: "hsl(var(--chart-1))" }}
              />
              Work hours
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: "hsl(var(--chart-3))" }}
              />
              Break hours
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="space-x-2">
        <Button
          className="w-full"
          variant={meta.ongoingBreak ? "default" : "secondary"}
          onClick={meta.ongoingBreak ? endBreak : startBreak}
        >
          {meta.ongoingBreak ? "Get to work, SLAVE!" : "Take a break"}
        </Button>
        <Button onClick={endShift} variant={"destructive"}>
          End
        </Button>
      </CardFooter>
    </Card>
  );
}

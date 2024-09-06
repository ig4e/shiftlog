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
import { db, getObjectID } from "~/lib/db";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { useShiftControls } from "~/hooks/use-shift-controls";
import { useSearchParams } from "next/navigation";

export function ShiftControls() {
  const searchParams = useSearchParams();
  const { data, ...meta } = useShiftControls({});

  const startShift = useCallback(() => {
    void toast.promise(
      new Promise((fulfuil) =>
        fulfuil(
          db.shifts.add({
            id: getObjectID(),
            startedAt: new Date(),
            endedAt: null,
            breaks: [],
            updatedAt: new Date(),
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
      new Promise((fulfuil) => {
        const updateData = {
          endedAt: new Date(),
          updatedAt: new Date(),
        };

        // If there's an ongoing break, use the startedAt of the break as the endedAt time for the shift.
        const ongoingBreakIndex = data.breaks.findIndex((break_) => !break_.endedAt);
        if (ongoingBreakIndex !== -1) {
          const breakStartedAt = data.breaks[ongoingBreakIndex]!.startedAt;
          updateData.endedAt = new Date(breakStartedAt);
          // Remove the ongoing break from the breaks array
          data.breaks.splice(ongoingBreakIndex, 1);
        }

        fulfuil(db.shifts.update(data.id, updateData));
      }),
      {
        loading: "Ending shift...",
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
            updatedAt: new Date(),
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
            updatedAt: new Date(),
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

  useEffect(() => {
    const action = searchParams.get("action") as "start" | "end" | "break" | null;
    const activeShift = data;

    if (action) {
      if (action === "start") {
        if (!activeShift) {
          startShift();
        } else if (meta.ongoingBreak) {
          endBreak();
        }
      } else if (action === "break") {
        if (activeShift) {
          if (meta.ongoingBreak) {
            endBreak();
          } else {
            startBreak();
          }
        } else {
          startShift();
          startBreak();
        }
      } else if (action === "end") {
        if (activeShift) {
          if (meta.ongoingBreak) {
            endShift(); // This will now handle ending the shift with the break's start time.
          } else {
            endShift();
          }
        }
      }
    }
  }, [searchParams]);

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

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: "hsl(var(--chart-1))" }}
              />
              Work hours
              <p className="ml-auto">{meta.formattedTime}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: "hsl(var(--chart-3))" }}
              />
              Break hours
              <p className="ml-auto">{meta.formattedBreakTime}</p>
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

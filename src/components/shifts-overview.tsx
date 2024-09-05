"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "~/lib/db";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "./ui/card";
import { Shift } from "@prisma/client";
import { useShiftControls } from "~/hooks/use-shift-controls";
import { cn } from "~/lib/utils";
import { Badge } from "./ui/badge";

export function ShiftsOverview() {
  const shifts =
    useLiveQuery(() =>
      db.shifts
        .toArray()
        .then((data) =>
          data.sort(
            (a, b) =>
              b.startedAt.getMilliseconds() - a.startedAt.getMilliseconds(),
          ),
        ),
    ) ?? [];
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: shifts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 212,
  });

  return (
    <div className="space-y-4">
      <CardTitle>Shifts Overview</CardTitle>
      <div
        ref={parentRef}
        style={{
          height: `800px`,
          overflow: "auto", // Make it scroll!
        }}
      >
        {/* The large inner element to hold all of the items */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const shift = shifts[virtualItem.index];

            if (!shift) return null;

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="p"
              >
                {/* {shift.startedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })} */}
                <ShiftCard shift={shift} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ShiftCard({ shift }: { shift: Omit<Shift, "userId"> }) {
  const meta = useShiftControls({ shiftData: shift });

  return (
    <Card className="border-none">
      <CardContent className="p-4 pt-4">
        <CardTitle className={"mb-2 text-lg"}>{meta.formattedTime}</CardTitle>
        <CardDescription className={"mb-4 text-muted-foreground"}>
          {shift.startedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}{" "}
          -{" "}
          {shift.endedAt ? (
            shift.endedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })
          ) : (
            <Badge>ACTIVE</Badge>
          )}
        </CardDescription>

        <div>
          <div className="relative flex h-4 w-full overflow-hidden rounded-md">
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
    </Card>
  );
}

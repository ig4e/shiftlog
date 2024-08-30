"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "~/lib/db";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { CardTitle } from "./ui/card";

export function ShiftsOverview() {
  const shifts =
    useLiveQuery(() => db.shifts.orderBy("startedAt").toArray()) ?? [];
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: shifts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 130,
  });

  return (
    <div>
      <CardTitle>Shifts Overview</CardTitle>
      <div
        ref={parentRef}
        style={{
          height: `400px`,
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
                {shift.startedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

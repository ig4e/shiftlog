"use client";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useCallback } from "react";
import { DateTime } from "luxon";

export function ShiftControls() {
  const { data } = api.shift.getLatest.useQuery();
  const startShiftMutation = api.shift.create.useMutation();
  const startShift = useCallback(() => {
    void toast.promise(startShiftMutation.mutateAsync(), {
      loading: "Starting shift...",
      success: "Shift started!",
      error: "Shift failed to start",
    });
  }, [startShiftMutation]);

  if (!data)
    return (
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Current Shift</CardTitle>
          <CardDescription>Start your first shift!!</CardDescription>
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
      <CardHeader>
        <CardTitle>
          {DateTime.local().diff(DateTime.fromJSDate(data.startedAt)).toHuman({ listStyle: "long" })}
        </CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}

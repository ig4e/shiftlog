"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { db } from "~/lib/db";
import { api } from "~/trpc/react";

export const SYNC_TAG = "sync-shifts";

export function useSync() {
  const syncMutation = api.shift.sync.useMutation();

  return async function syncShifts() {
    const shifts = await db.shifts.toArray();
    const account = await db.account.toCollection().first();

    if (!account) {
      toast.error("No account found to sync with.");
      throw new Error("No account found");
    }

    console.log(`[Sync] Trying...`);

    await syncMutation.mutateAsync({
      email: account.email,
      shifts: shifts.map((shift) => ({
        id: String(shift.id),

        startedAt: shift.startedAt,
        endedAt: shift.endedAt || null,

        breaks: shift.breaks.map((breakTime) => ({
          startedAt: breakTime.startedAt,
          endedAt: breakTime.endedAt || null,
        })),
        
        updatedAt: shift.updatedAt,
      })),
    });

    console.log(`[Sync] Success`);

    db.account.update(account.id, { syncedAt: new Date() });

    return true;
  };
}

export default function Syncer() {
  const syncShifts = useSync();

  useEffect(() => {
    toast.promise(syncShifts(), {
      loading: "Syncing shifts...",
      success: () => "Shifts synced successfully!",
      error: (e: Error) => "Failed to sync shifts.",
    });
  }, []);

  return null;
}

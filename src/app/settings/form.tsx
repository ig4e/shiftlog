"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockClosedIcon, SymbolIcon, TrashIcon } from "@radix-ui/react-icons";
import { useLiveQuery } from "dexie-react-hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { db } from "~/lib/db";
import { useSync } from "../sync-database";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useCallback, useState } from "react";
import { cn } from "~/lib/utils";
const formSchema = z.object({
  email: z.string().email({
    message: "Email must be a valid email.",
  }),
});

export function SettingsForm() {
  const account = useLiveQuery(() => db.account.toCollection().first());
  const startSync = useSync();
  const remoteAccountData = api.shift.getMany.useMutation();
  const deleteRemoteData = api.shift.deleteHistory.useMutation();
  const [isLocked, setIsLocked] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      email: account?.email ?? "",
    },
  });

  const deleteLocal = useCallback(async () => {
    void toast.promise(new Promise(async (r) => r(await db.delete())), {
      loading: "Deleting local data...",
      success: () => "Local data deleted successfully!",
      error: (e: Error) => "Failed to deleted local data.",
    });

    if (typeof window !== "undefined") {
      window.location.href = "/";
      window.location.reload();
    }
  }, [db]);

  const deleteRemoteAndLocal = useCallback(async () => {
    if (!account) return;

    await db.delete();
    void toast.promise(
      deleteRemoteData.mutateAsync({ email: account.email }).then(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/";
          window.location.reload();
        }
      }),
      {
        loading: "Deleting remote data...",
        success: () => "Remote data deleted successfully!",
        error: (e: Error) => "Failed to deleted remote data.",
      },
    );
  }, [deleteRemoteData, account]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const email = values.email;

    if (email) {
      if (email !== (account?.email ?? "fakeEmailMoeDestoryer9162")) {
        toast.promise(
          remoteAccountData.mutateAsync({ email }).then(async (data) => {
            await db.shifts.bulkPut(data.items);
          }),
          {
            loading: "Loading remote account data...",
            success: () => "Remote account data synced successfully!",
            error: (e: Error) => "Failed to load remote account data.",
          },
        );
      }

      if (account) {
        db.account.update(account.id, {
          email: email,
        });
      } else {
        db.account.add({
          email: email,
          syncedAt: new Date(0),
        });
      }
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="supersecretmoe@mail.moe"
                    type={"email"}
                    {...field}
                  />
                </FormControl>
                <FormDescription>This is your account email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>

      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(startSync(), {
            loading: "Syncing shifts...",
            success: () => "Shifts synced successfully!",
            error: (e: Error) => "Failed to sync shifts.",
          })
        }
      >
        <SymbolIcon className="me-2" />
        <span>Force Sync</span>
      </Button>

      <p className="mb-4 mt-16">
        Due to the developer mental health, this dangrous action does NOT have a
        confirmation.
      </p>

      <div className="relative w-full space-y-4">
        <div
          className={cn(
            "absolute inset-0 z-50 rounded-md bg-background/25 backdrop-blur-sm transition-opacity",
            { "pointer-events-none opacity-0": !isLocked },
          )}
        />

        <Button
          className="w-full"
          variant={"destructive"}
          onClick={() => void deleteLocal()}
          disabled={isLocked}
        >
          <TrashIcon className="me-2" />
          <span>Delete local data</span>
        </Button>

        <Button
          className="w-full"
          variant={"destructive"}
          onClick={() => void deleteRemoteAndLocal()}
          disabled={isLocked || !account}
        >
          <TrashIcon className="me-2" />
          <span>Delete local & remote data</span>
        </Button>
      </div>

      <Button
        className="w-full"
        variant={"destructive"}
        onClick={() => void setIsLocked((state) => !state)}
      >
        <LockClosedIcon className="me-2" />
        <span>Open LOCK</span>
      </Button>
    </>
  );
}

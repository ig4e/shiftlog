import Link from "next/link";
import { OverviewChart } from "~/components/charts/shift-duration";
import { ShiftControls } from "~/components/shift-controls";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  await api.shift.getStats.prefetch({ timeRange: "WEEK" })
  await api.shift.getLatest.prefetch()

  return (
    <HydrateClient>
      <main className="flex flex-col gap-4">
        <ShiftControls />
        <OverviewChart />
      </main>
    </HydrateClient>
  );
}

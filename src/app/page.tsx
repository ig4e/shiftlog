import { OverviewChart } from "~/components/charts/shift-duration";
import { ShiftControls } from "~/components/shift-controls";
import { ShiftsOverview } from "~/components/shifts-overview";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex flex-col gap-4">
        <ShiftControls />
        <OverviewChart />
        <ShiftsOverview />
      </main>
    </HydrateClient>
  );
}

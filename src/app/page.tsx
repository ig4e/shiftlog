import { Suspense } from "react";
import { OverviewChart } from "~/components/charts/shift-duration";
import { ShiftControls } from "~/components/shift-controls";
import { ShiftsOverview } from "~/components/shifts-overview";

export default async function Home() {
  return (
    <main className="flex flex-col gap-4">
      <Suspense>
        <ShiftControls />
      </Suspense>
      <OverviewChart />
      <ShiftsOverview />
    </main>
  );
}

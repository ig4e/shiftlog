import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="hehe">
        
      </main>
    </HydrateClient>
  );
}

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { BackgroundSyncPlugin, NetworkOnly, Serwist } from "serwist";
import { registerRoute } from "serwist/legacy";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // runtimeCaching: [
  //   {
  //     matcher: ({ request }) => request.destination === "style",
  //     handler: new CacheFirst(),
  //   },
  // ],
});

serwist.addEventListeners();

const backgroundSync = new BackgroundSyncPlugin("shift-sync", {
  maxRetentionTime: 24 * 60, // Retry for a maximum of 24 Hours (specified in minutes)
});

registerRoute(
  /\/api\/.*/,
  new NetworkOnly({
    plugins: [backgroundSync],
  }),
  "POST",
);

// const client = createTRPCClient<AppRouter>({
//   links: [
//     httpBatchLink({
//       url: `${self.location.origin}/api/trpc`,
//       transformer: SuperJSON,
//     }),
//   ],
// });

// async function syncShifts() {
//   const shifts = await db.shifts.toArray();
//   const account = await db.account.toCollection().first();
//   if (!account) return;

//   console.log(`[Sync] Trying...`);

//   try {
//     await client.shift.sync.mutate({
//       email: account.email,
//       shifts: shifts.map((shift) => ({
//         id: String(shift.id),
//         startedAt: shift.startedAt,
//         endedAt: shift.endedAt ?? undefined,
//         updatedAt: shift.updatedAt,
//       })),
//     });

//     console.log(`[Sync] Success`);

//     db.account.update(account, { syncedAt: new Date() });
//   } catch (e) {
//     console.log(`[Sync] Failed`, e);
//   }
// }

import { Shift } from "@prisma/client";
import Dexie, { EntityTable } from "dexie";

export const db = new Dexie("shiftDBv3") as Dexie & {
  shifts: EntityTable<
    Omit<Shift, "userId">,
    "id" // primary key "id" (for the typings only)
  >;
};

db.version(1).stores({
  shifts: "++id, startedAt, endedAt, updatedAt",
  auth: "++id, email"
});

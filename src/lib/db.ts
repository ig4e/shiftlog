import { Shift } from "@prisma/client";
import Dexie, { EntityTable } from "dexie";
import { ObjectId } from "mongodb";

export const db = new Dexie("shiftDBv3") as Dexie & {
  shifts: EntityTable<Omit<Shift, "userId">, "id">;
  account: EntityTable<{ id: number; email: string; syncedAt: Date }, "id">;
};

db.version(1).stores({
  shifts: "++id, startedAt, endedAt, updatedAt",
  account: "++id, email, syncedAt",
});

export function getObjectID() {
  return crypto.randomUUID();
}

import { Shift } from "@prisma/client";
import Dexie, { EntityTable } from "dexie";
import { ObjectId } from "mongodb";

export const db = new Dexie("shiftDBv1.0.1") as Dexie & {
  shifts: EntityTable<Omit<Shift, "userId">, "id">;
  account: EntityTable<{ id: number; email: string; syncedAt: Date }, "id">;
};

db.version(1).stores({
  shifts: "id",
  account: "++id",
});

export function getObjectID() {
  return crypto.randomUUID();
}

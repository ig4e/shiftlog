import { Shift } from '@prisma/client';
import Dexie, { EntityTable } from 'dexie';

export const db = new Dexie('shiftDBv2') as Dexie & {
    shifts: EntityTable<
      Shift,
      'id' // primary key "id" (for the typings only)
    >;
  };;




db.version(1).stores({
  shifts: '++id, startedAt, endedAt, updatedAt' 
});


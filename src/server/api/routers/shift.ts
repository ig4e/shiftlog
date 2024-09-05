import { DateTime } from "luxon";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const shiftRouter = createTRPCRouter({
  getMany: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        orderBy: z
          .enum([
            "startedAt_desc",
            "updatedAt_desc",
            "startedAt_asc",
            "updatedAt_asc",
          ])
          .default("startedAt_desc"),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(1000).default(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.upsert({
        where: {
          email: input.email,
        },
        create: {
          email: input.email,
        },
        update: {},
      });

      const [orderKey, orderType] = input.orderBy.split("_") as [
        "startedAt" | "updatedAt",
        "desc" | "asc",
      ];

      const totalItems = await ctx.db.shift.count({ where: { userId: user.id } });
      const items = await ctx.db.shift.findMany({
        where: { userId: user.id },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: input.limit + 1,
        orderBy: {
          [orderKey]: orderType,
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items,
        meta: {
          nextCursor,
          limit: input.limit,
          totalItems,
        },
      };
    }),

  sync: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        shifts: z.array(
          z.object({
            id: z.string(),
            startedAt: z.coerce.date(),
            endedAt: z.coerce.date().optional(),
            updatedAt: z.coerce.date(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.upsert({
        where: {
          email: input.email,
        },
        create: {
          email: input.email,
        },
        update: {},
      });

      const localShifts = await ctx.db.shift.findMany({
        where: {
          id: {
            in: input.shifts.map((shift) => shift.id),
          },
        },
      });

      const newShifts = input.shifts
        .map((shift) => {
          const localVersion = localShifts.find(
            (localShift) => localShift.id === shift.id,
          );

          return {
            ...shift,
            localVersion,
          };
        })
        .filter((shift) => {
          return (
            !shift.localVersion ||
            shift.updatedAt > shift.localVersion.updatedAt
          );
        });

      for (const shift of newShifts) {
        if (shift.localVersion) {
          await ctx.db.shift.update({
            where: {
              id: shift.id,
            },
            data: {
              startedAt: shift.startedAt,
              endedAt: shift.endedAt,
            },
          });
        } else {
          await ctx.db.shift.create({
            data: {
              id: shift.id,
              startedAt: shift.startedAt,
              endedAt: shift.endedAt,
              userId: user.id,
            },
          });
        }
      }

      return { message: "Synced, you slave." };
    }),
});

function getStartOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay(); // Sunday - Saturday : 0 - 6
  const diff = (dayOfWeek + 6) % 7; // Adjust for Sunday start
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0); // Reset time to midnight

  return startOfWeek;
}

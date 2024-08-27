import { DateTime } from "luxon";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const shiftRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure.mutation(async ({ ctx }) => {
    return ctx.db.shift.create({
      data: {
        startedAt: new Date(),
      },
    });
  }),

  update: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.shift.update({
        where: {
          id: input.id,
        },
        data: {
          endedAt: new Date(),
        },
      });
    }),

  getMany: publicProcedure
    .input(
      z.object({
        orderBy: z.enum([
          "startedAt_desc",
          "updatedAt_desc",
          "startedAt_asc",
          "updatedAt_asc",
        ]),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [orderKey, orderType] = input.orderBy.split("_") as [
        "startedAt" | "updatedAt",
        "desc" | "asc",
      ];

      const totalItems = await ctx.db.shift.count();
      const items = await ctx.db.shift.findMany({
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

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const shift = await ctx.db.shift.findFirst({
      orderBy: { startedAt: "desc" },
    });

    return shift ?? null;
  }),

  getStats: publicProcedure
    .input(z.object({ timeRange: z.enum(["WEEK", "MONTH", "YEAR"]) }))
    .query(async ({ input, ctx }) => {
      const today = new Date();

      const startOfWeek = getStartOfWeek(today);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const start =
        input.timeRange === "WEEK"
          ? startOfWeek
          : input.timeRange === "MONTH"
            ? startOfMonth
            : startOfYear;

      const shifts = await ctx.db.shift.findMany({
        where: {
          startedAt: {
            gte: start,
          },
        },
        select: {
          startedAt: true,
          endedAt: true,
        },
      });

      return {
        chartData: shifts.map((shift) => ({
          date: shift.startedAt.toDateString(),
          duration: DateTime.fromJSDate(shift.endedAt ?? new Date()).diff(
            DateTime.fromJSDate(shift.startedAt),
          ).as("hours"),
        })),
        meta: {
          totalShifts: shifts.length,
          totalDuration: shifts.reduce((acc, shift) => {
            return (
              acc +
              (shift.endedAt ?? new Date()).getTime() -
              shift.startedAt.getTime()
            );
          }, 0),
          timeRange: input.timeRange,
          startOfTimeRange: start,
          endOfTimeRange: today,
        },
      };
    }),

  sync: publicProcedure
    .input(
      z.object({
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

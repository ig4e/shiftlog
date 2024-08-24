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

  end: publicProcedure
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

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const shift = await ctx.db.shift.findFirst({
      orderBy: { startedAt: "desc" },
    });

    return shift ?? null;
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

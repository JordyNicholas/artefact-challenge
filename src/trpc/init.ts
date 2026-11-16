import { initTRPC } from "@trpc/server";
import { cache } from "react";
import { z, ZodError } from "zod";


export const createTRPCContext = cache(async () => ({}));

const t = initTRPC.create({
  // Sends Zod field errors to the client so the form can show them per field.
  errorFormatter({ shape, error}){
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null
      }
    }
  }
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
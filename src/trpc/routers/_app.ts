import { taskParams, taskService } from "@/server/tasks";
import { baseProcedure, createTRPCRouter } from "../init";
import { z } from "zod";


export const appRouter = createTRPCRouter({
  task: createTRPCRouter({
    list: baseProcedure
      .input(z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: z.number().int().min(0).nullish()
      }))
      .query(({ input }) => taskService.listTasks(input.cursor ?? 0, input.limit)),
    getById: baseProcedure
      .input(z.object({ id: z.uuid() }))
      .query(({ input }) => taskService.getTask(input.id)),
    create: baseProcedure
      .input(taskParams)
      .mutation(({ input }) => taskService.createTask(input)),
    update: baseProcedure
      .input(taskParams.extend({ id: z.uuid() }))
      .mutation(({ input }) => {
        const { id, ...data } = input
        return taskService.updateTask(id, data)
      }),
    delete: baseProcedure
      .input(z.object({ id: z.uuid() }))
      .mutation(({ input }) => taskService.deleteTask(input.id))
  })
})
export type AppRouter = typeof appRouter
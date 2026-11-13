import { taskParams, taskService } from "@/server/tasks";
import { baseProcedure, createTRPCRouter } from "../init";
import { input, z } from "zod";


export const appRouter = createTRPCRouter({
  task: createTRPCRouter({
    list: baseProcedure.query(() => taskService.listTasks()),
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
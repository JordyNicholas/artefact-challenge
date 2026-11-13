import { taskParams, taskService } from "@/server/tasks";
import { baseProcedure, createTRPCRouter } from "../init";
import { z } from "zod";


const appRouter = createTRPCRouter({
  task: createTRPCRouter({
    list: baseProcedure.query(() => taskService.listTasks()),
    getById: baseProcedure
      .input(z.object({ id: z.uuid() }))
      .query(() => taskService.getTask),
    create: baseProcedure
      .input(taskParams)
      .mutation(() => taskService.createTask),
    update: baseProcedure.mutation(() => taskService.updateTask),
    delete: baseProcedure
      .input(z.object({ id: z.uuid() }))
      .mutation(() => taskService.deleteTask)
  })
})
import { z } from "zod";
import { randomUUID } from 'crypto';
import { TRPCError } from "@trpc/server";


export const taskSchema = z.object({
  id: z.uuid(),
  titulo: z.string().trim().min(1, 'Title is required.'),
  descricao: z.string().optional(),
  dataCriacao: z.iso.datetime(),
  dataAtualizacao: z.iso.datetime().optional()
})
export type Task = z.infer<typeof taskSchema>;

export const taskParams = taskSchema.pick({
  titulo: true,
  descricao: true
})
export type TaskParams = z.infer<typeof taskParams>


class TaskService {
  private tasks: Task[] = []
  constructor () {}

  public async getTask (id: string): Promise<Task> {
    const mappedTask = await this.tasks.find((task: Task) => task.id === id);
    if (!mappedTask) {
      throw new Error(`Task ${id} not found.`)
    }

    return mappedTask;
  };

  public async listTasks (): Promise<Task[]> {
    return await this.tasks;
  };

  public async createTask (input: TaskParams): Promise<Task> {
    const findDuplicate = this.tasks.find((task: Task) => task.titulo === input.titulo)
    if (findDuplicate) throw new TRPCError({ code: 'NOT_FOUND', message: `A task with title ${input.titulo} already exists.`})

    const task = {
      id: randomUUID(),
      titulo: input.titulo,
      descricao: input.descricao,
      dataCriacao: new Date().toISOString()
    }

    this.tasks.push(task)
    return task
  };

  public async updateTask (id: string, input: TaskParams): Promise<Task> {
    const index = this.tasks.findIndex((task: Task) => task.id === id);
    if (!index) {
      throw new Error(`Task ${id} not found.`)
    }

    const mappedTask = this.tasks[index];
    return this.tasks[index] = {
      ...mappedTask,
      titulo: input.titulo ?? mappedTask.titulo,
      descricao: input.descricao ?? mappedTask.descricao,
      dataAtualizacao: new Date().toISOString()
    }
  };

  public async deleteTask (id: string): Promise<void> {
    const mappedTask = this.tasks.find((task: Task) => task.id === id);
    if (!mappedTask) {
      throw new Error(`Task ${id} not found.`)
    }

    const findIndex = this.tasks.findIndex((task: Task) => task.id === id)
    this.tasks.splice(findIndex, 1);
  };
}

export const taskService = new TaskService()
import { z } from "zod";
import { randomUUID } from 'crypto';
import { TRPCError } from "@trpc/server";


export const taskSchema = z.object({
  id: z.uuid(),
  titulo: z.string().trim().min(1, 'Title is required.'),
  descricao: z.string().trim().optional(),
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
    const mappedTask = this.tasks.find((task: Task) => task.id === id);
    if (!mappedTask) throw new TRPCError({ code: 'NOT_FOUND', message: `Task ${id} not found.` })
    return mappedTask;
  };

  public async listTasks (): Promise<Task[]> {
    return this.tasks;
  };

  public async createTask (input: TaskParams): Promise<Task> {
    const findDuplicate = this.tasks.find((task: Task) => task.titulo.toLowerCase() === input.titulo.toLowerCase())
    if (findDuplicate) throw new TRPCError({ code: 'CONFLICT', message: `A task with title ${input.titulo} already exists.`})

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
    if (index === -1) throw new TRPCError({ code: 'NOT_FOUND', message: `Task ${id} not found.` })
    const mappedTask = this.tasks[index];

    if (mappedTask.titulo.toLowerCase() === input.titulo.toLowerCase()) throw new TRPCError({ code: 'CONFLICT', message: `A Task with title ${input.titulo} already exists.` })
    return this.tasks[index] = {
      ...mappedTask,
      titulo: input.titulo,
      descricao: input.descricao,
      dataAtualizacao: new Date().toISOString()
    }
  };

  public async deleteTask (id: string): Promise<void> {
    const findIndex = this.tasks.findIndex((task: Task) => task.id === id)
    if (findIndex === -1) throw new TRPCError({ code: 'NOT_FOUND', message: `No task with id ${id} was found.`})
    this.tasks.splice(findIndex, 1);
  };
}

export const taskService = new TaskService()
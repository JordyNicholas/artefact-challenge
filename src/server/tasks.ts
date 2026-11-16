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
    const index = this.getTaskIndex(id);
    return this.tasks[index];
  };

  public async listTasks (cursor: number = 0, limit: number = 10): Promise<{ items: Task[], nextCursor: number | null}> {
    const items = this.tasks.slice(cursor, cursor + limit);
    const next = cursor + limit;
    const nextCursor = next < this.tasks.length ? next : null;
    return { items, nextCursor }
  };

  public async createTask (input: TaskParams): Promise<Task> {
    this.assertUniqueTitle(input.titulo)

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
    const index = this.getTaskIndex(id);
    this.assertUniqueTitle(input.titulo, id)

    const mappedTask = this.tasks[index];
    return this.tasks[index] = {
      ...mappedTask,
      titulo: input.titulo,
      descricao: input.descricao,
      dataAtualizacao: new Date().toISOString()
    }
  };

  public async deleteTask (id: string): Promise<void> {
    const index = this.getTaskIndex(id);
    this.tasks.splice(index, 1);
  };

  private assertUniqueTitle (title: string, id?: string): void {
    const duplicate = this.tasks.find((task) => task.id !== id && task.titulo.toLowerCase() === title.toLowerCase());
    if (duplicate) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `A task with title ${title} already exists.`
      })
    }
  }

  private getTaskIndex (id: string): number {
    const index = this.tasks.findIndex((task: Task) => task.id === id);
    if (index === -1) throw new TRPCError({ code: 'NOT_FOUND', message: `Task ${id} not found.` })

    return index
  }

  public get size(): number {
    return this.tasks.length;
  }
}

export const taskService = new TaskService()
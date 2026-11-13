import { z } from "zod";
import { randomUUID } from 'crypto';


export const taskSchema = z.object({
  id: z.uuid(),
  title: z
    .string()
    .trim()
    .min(5, 'Title is required, with a minimum of 5 characters.')
    .nonempty()
    .nonoptional(),
  description: z
    .string()
    .optional(),
  createdDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional()
})
export type Task = z.infer<typeof taskSchema>;
export type TaskSearchParams = Partial<Task>;
export type TaskParams = Omit<Task, 'id' | 'createdDate' | 'updatedDate'>


export class taskService {

  constructor () {

  }

  public async getTask (id: string): Promise<Task> {};
  public async listTasks (searchParams: TaskSearchParams): Promise<Task[]> {};
  public async createTask (input: TaskParams): Promise<void> {};
  public async updateTask (input: TaskParams): Promise<void> {};
  public async deleteTask (id: string): Promise<void> {};
}
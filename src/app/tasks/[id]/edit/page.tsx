import { TaskForm } from "@/app/_components/task-form";
import { caller } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const task = await caller.task.getById({ id });
    return <TaskForm task={task} />;
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === 'NOT_FOUND' || error.code === 'BAD_REQUEST') {
        notFound();
      }
    }

    throw error;
  }
}
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { TaskList } from "./_components/task-list";
import Link from "next/link";


export default function Home() {

  void getQueryClient()
    .infiniteQuery(
      trpc.task.list.infiniteQueryOptions(
        { limit: 10 },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
      ))
    .catch(() => {})

  return (
    <HydrateClient>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2x1 font-semibold">Tasks</h1>
        <Link
          href={"/tasks/new"}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Task
        </Link>
      </header>
      <TaskList/>
    </HydrateClient>
  );
}

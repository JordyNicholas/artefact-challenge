import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { TaskList } from "./_components/task-list";


export default function Home() {

  void getQueryClient()
    .query(trpc.task.list.queryOptions())
    .catch(() => {})

  return (
    <HydrateClient>
      <TaskList/>
    </HydrateClient>
  );
}

import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { TaskList } from "./_components/task-list";


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
      <TaskList/>
    </HydrateClient>
  );
}

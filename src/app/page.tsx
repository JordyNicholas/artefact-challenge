import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      { void getQueryClient().query(trpc.task.list.queryOptions()) }
    </HydrateClient>
  );
}

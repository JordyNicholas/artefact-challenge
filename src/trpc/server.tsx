import 'server-only'; // <-- ensure this file cannot be imported from the client

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

const createContext = async () =>
  createTRPCContext();

export const trpc = createTRPCOptionsProxy({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient,
});
// If your router is on a separate server, pass a client instead:
// createTRPCOptionsProxy({
//   client: createTRPCClient({ links: [httpLink({ url: '...' })] }),
//   queryClient: getQueryClient,
// });

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export const caller = appRouter.createCaller(createContext);
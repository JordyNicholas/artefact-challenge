# Task Manager - Artefact Challenge

A simple task manager built with Next.js 15 and tRPC for the Artefact Software Engineer case. Tasks are stored in memory, so there is no database to set up.

## Stack

- Next.js 15 (App Router)
- tRPC v11 with TanStack Query
- Zod for validation
- Tailwind CSS 4
- TypeScript

## How to run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). No environment variables or database are needed.

## Features

- Create, list, edit and delete tasks (title, optional description, creation date)
- Validation on the client and on the server, with field-level error messages
- Meaningful errors: duplicate titles return `CONFLICT`, unknown ids return `NOT_FOUND`
- Task list rendered on the server (SSR) and hydrated on the client
- Infinite scroll (10 tasks per page)
- Loading, success and error states, plus a toast after deleting a task

## How it works

1. The browser calls tRPC procedures through the route handler under `src/app/api/trpc`.
2. Each procedure validates the input with Zod and calls `TaskService`.
3. `TaskService` applies the business rules and reads or writes the in-memory array.
4. Errors are thrown as `TRPCError` (`NOT_FOUND`, `CONFLICT`) and shown in the UI.

## Project structure

```
src/
  server/tasks.ts        In-memory task service (business rules)
  trpc/                  tRPC setup: init, routers, client and server helpers
  app/page.tsx           Task list page (SSR)
  app/tasks/new          Create task page
  app/tasks/[id]/edit    Edit task page
  app/_components        Task list and task form (client components)
```

## Technical decisions

- **In-memory service as a singleton.** `TaskService` keeps the tasks in an array and holds the business rules (unique title, not found). The tRPC router stays thin: it validates the input with Zod and calls the service.
- **Validation on both sides.** The form checks the title before sending, for quick feedback. The server is the source of truth: Zod validates every input, and the `errorFormatter` sends field errors back so the form can show them.
- **SSR with prefetch.** The home page prefetches the first page of tasks on the server and passes it to the client with `HydrateClient`, so the list is already in the HTML on first load.
- **Offset cursor pagination.** `task.list` returns `items` and `nextCursor`. The client uses `useInfiniteQuery` and an `IntersectionObserver` to load the next page when the user reaches the end of the list.
- **Cache invalidation.** After create, update or delete, the app invalidates `task.list` with `pathKey()`, so every cached version of the list is refreshed.

## Limitations

- Data is lost when the server restarts, since it only lives in memory.
- No authentication.

## Possible improvements

- Persist tasks in a database
- Dark mode
- Automated tests

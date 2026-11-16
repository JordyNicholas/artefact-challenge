'use client'

import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Toast = { type: 'success' | 'error'; message: string } | null;

export function TaskList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<Toast>(null);

  const { data, isPending, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: 10 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    ));
  const tasks = data?.pages.flatMap((page) => page.items) ?? [];

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const deleteTask = useMutation(trpc.task.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.task.list.pathKey() });
      setToast({ type: 'success', message: 'Task deleted successfully.' });
    },
    onError: (error) => {
      setToast({ type: 'error', message: error.message });
    }
  }));

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleDelete(id: string): void {
    if (!window.confirm('Delete this task?')) return;
    deleteTask.mutate({ id });
  }

  if (isPending) return (
    <ul className="space-y-3">
      {[1, 2, 3].map((i) => (
        <li
          key={i}
          className="h-24 animate-pulse rounded-xl bg-zinc-200"
        />
      ))}
    </ul>
  )

  if (isError) return (
    <p className="rounded-lg bg-red-50 p-4 text-red-700">
      {error.message}
    </p>
  )

  return (
    <>
    { !tasks.length
      ? (
        <p
          className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            No tasks yet
        </p>)
      : (
        <ul className="space-y-3">
        { tasks.map((task) => (
          <li key={ task.id } className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">

          <h2 className="font-medium"> { task.titulo } </h2>

          { task.descricao && <p className="mt-1 text-sm text-zinc-600">
            {task.descricao}
          </p> }

          <time className="mt-2 block text-xs text-zinc-400">
            { new Date(task.dataCriacao).toLocaleDateString('en-US') }
          </time>

          <div className="mt-3 flex gap-3 text-sm">
            <Link
              className="text-indigo-600 hover:underline"
              href={`/tasks/${task.id}/edit`}
              >
                Edit
            </Link>
            <button
              className="text-red-600 hover:underline disabled:opacity-50"
              onClick={() => handleDelete(task.id)}
              disabled={deleteTask.isPending && deleteTask.variables?.id === task.id}
            >
            { deleteTask.isPending && deleteTask.variables?.id === task.id
              ? 'Deleting...'
              : 'Delete'
            }
            </button>
          </div>

          </li>
        ))}
        </ul>
      )}

      <div ref={sentinelRef} />
      { isFetchingNextPage &&
        <p className="py-4 text-center text-sm text-zinc-500">
          Loading more...
        </p>
      }

      { toast && (
        <div
          role="status"
          className={
            `fixed bottom-4 right-4 rounded-lg px-4 py-2 text-sm text-white shadow-lg
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
          `}
        >
          {toast.message}
        </div>
      )}
      </>
    )
  }
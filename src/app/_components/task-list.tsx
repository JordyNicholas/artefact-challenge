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
    if (!el || hasNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const deleteTask = useMutation(trpc.task.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.task.list.queryKey() });
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

  if (isPending) return <p>Loading...</p>
  if (isError) return <p>{error.message}</p>

  return (
    <>
    { !tasks.length
      ? ( <p>No tasks yet</p>)
      : (
        <ul>
        { tasks.map((task) => (
          <li key={ task.id }>
          <h2>{ task.titulo }</h2>
          { task.descricao && <p>{task.descricao}</p> }
          <time>{ new Date(task.dataCriacao).toLocaleDateString('en-US') }</time>
          <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
          <button
            onClick={() => handleDelete(task.id)}
            disabled={deleteTask.isPending && deleteTask.variables?.id === task.id}
          >
          { deleteTask.isPending && deleteTask.variables?.id === task.id
            ? 'Deleting...'
            : 'Delete'
          }
          </button>
          </li>
        ))}
        </ul>
      )}

      <div ref={sentinelRef} />
      { isFetchingNextPage && <p>Loading more...</p> }

      { toast && (
        <div role="status" className="fixed bottom-4 right-4">
        {toast.message}
        </div>
      )}
      </>
    )
  }
'use client'

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type SubmitEvent } from "react";

type Props = { task?: { id: string, titulo: string, descricao?: string }};

export function TaskForm({ task }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isEdit = !!task;

  const [titulo, setTitulo] = useState<string>(task?.titulo ?? '');
  const [descricao, setDescricao] = useState<string>(task?.descricao ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: trpc.task.list.pathKey() });
    setSuccess(isEdit ? 'Changes saved.' : 'Task created.');
    if (!isEdit) {
      setTitulo('');
      setDescricao('')
    };
  }

  const create = useMutation(trpc.task.create.mutationOptions({ onSuccess }));
  const update = useMutation(trpc.task.update.mutationOptions({ onSuccess }));
  const mutation = isEdit ? update : create;

  const serverFieldErrors = mutation.error?.data?.zodError?.fieldErrors;
  const serverError = mutation.error && !serverFieldErrors ? mutation.error.message : null;

  // Client check for quick feedback; the server is still the source of truth.
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(null);

    if (!titulo.trim()) {
      setTitleError('Title is required.');
      return;
    }
    setTitleError(null);

    const data = { titulo, descricao: descricao || undefined };
    if (isEdit) update.mutate({ id: task.id, ...data });
    else create.mutate(data);
  }
  const titleMessage = titleError ?? serverFieldErrors?.titulo?.[0];
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">
        { isEdit ? 'Edit Task' : 'New Task' }
      </h1>

      <form
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="titulo">Title</label>
          <input
            className={
              `w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${titleMessage ? 'border-red-500' : 'border-zinc-300'}`
            }
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          {titleMessage && <p className="mt-1 text-sm text-red-600">{titleMessage}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="descricao">Description</label>
          <textarea
            id="descricao"
            rows={4}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        { serverError && <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {serverError}
        </p>}
        { success && <p
            role="status"
            className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {success}
        </p>}

        <div className="flex items-center justify-between">
          <Link
            href='/'
            className="text-sm text-zinc-600 hover:underline"
          >
            Back to tasks
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            { mutation.isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Create task' }
          </button>
        </div>
      </form>
    </>
  );
}
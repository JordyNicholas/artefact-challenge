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

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="titulo">Title</label>
      <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      {(titleError ?? serverFieldErrors?.titulo?.[0]) && (
        <p>{titleError ?? serverFieldErrors?.titulo?.[0]}</p>
      )}

      <label htmlFor="descricao">Description</label>
      <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

      { serverError && <p role="alert"> {serverError} </p> }
      { success && <p role="status"> {success} </p> }

      <button type="submit" disabled={mutation.isPending}>
        {
          mutation.isPending
          ? 'Saving...'
          : isEdit
            ? 'Save changes'
            : 'Create task'
        }
      </button>
      <Link href='/'>Back to tasks</Link>
    </form>
  );
}
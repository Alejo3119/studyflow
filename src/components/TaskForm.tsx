"use client";

import { useRef } from "react";
import { createTask } from "@/app/tasks/actions";

export function TaskForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTask(formData);
        formRef.current?.reset();
      }}
      className="grid gap-3 rounded-lg border border-border bg-card p-4"
    >
      <input
        name="title"
        placeholder="¿Qué tienes que hacer?"
        required
        className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <input
          name="subject"
          placeholder="Materia"
          className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          name="priority"
          defaultValue="MEDIUM"
          className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="LOW">Prioridad baja</option>
          <option value="MEDIUM">Prioridad media</option>
          <option value="HIGH">Prioridad alta</option>
        </select>
        <input
          type="date"
          name="dueDate"
          className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Agregar
        </button>
      </div>
      <textarea
        name="description"
        placeholder="Notas (opcional)"
        rows={2}
        className="resize-none rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </form>
  );
}

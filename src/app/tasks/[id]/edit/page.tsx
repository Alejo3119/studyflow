import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTask } from "@/app/tasks/actions";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getCurrentUserId } from "@/lib/current-user";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function EditTaskPage(
  props: PageProps<"/tasks/[id]/edit">,
) {
  const userId = await getCurrentUserId();
  if (!userId) return <SignInPrompt />;

  const { id } = await props.params;
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) notFound();

  const updateTaskWithId = updateTask.bind(null, task.id);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">Editar tarea</h1>
      <form action={updateTaskWithId} className="grid gap-3">
        <label className="grid gap-1 text-sm">
          Título
          <input
            name="title"
            defaultValue={task.title}
            required
            className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Materia
          <input
            name="subject"
            defaultValue={task.subject ?? ""}
            className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            Prioridad
            <select
              name="priority"
              defaultValue={task.priority}
              className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Fecha límite
            <input
              type="date"
              name="dueDate"
              defaultValue={toDateInputValue(task.dueDate)}
              className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Notas
          <textarea
            name="description"
            defaultValue={task.description ?? ""}
            rows={3}
            className="resize-none rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Guardar cambios
          </button>
          <a
            href="/tasks"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent/10"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}

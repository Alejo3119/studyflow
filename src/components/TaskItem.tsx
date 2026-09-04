import Link from "next/link";
import type { Task } from "@prisma/client";
import { deleteTask, toggleTask } from "@/app/tasks/actions";
import { isPriority, PRIORITY_CLASS, PRIORITY_LABEL } from "@/lib/priority";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function TaskItem({ task }: { task: Task }) {
  const priority = isPriority(task.priority) ? task.priority : "MEDIUM";

  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <form action={toggleTask.bind(null, task.id, !task.completed)}>
        <button
          type="submit"
          aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
          className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
            task.completed
              ? "border-accent bg-accent"
              : "border-border hover:border-accent"
          }`}
        />
      </form>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            task.completed ? "text-muted line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 truncate text-xs text-muted">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className={`rounded px-1.5 py-0.5 font-medium ${PRIORITY_CLASS[priority]}`}>
            {PRIORITY_LABEL[priority]}
          </span>
          {task.subject && (
            <span className="rounded bg-accent/10 px-1.5 py-0.5 font-medium text-accent">
              {task.subject}
            </span>
          )}
          {task.dueDate && (
            <span className="text-muted">{formatDate(task.dueDate)}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <Link
          href={`/tasks/${task.id}/edit`}
          className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-accent/10 hover:text-accent"
        >
          Editar
        </Link>
        <form action={deleteTask.bind(null, task.id)}>
          <button
            type="submit"
            className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            Eliminar
          </button>
        </form>
      </div>
    </li>
  );
}

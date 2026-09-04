import type { Task } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getCurrentUserId } from "@/lib/current-user";
import { isCalendarConnected } from "@/lib/google-calendar";
import { syncFromGoogleCalendar } from "@/app/tasks/sync-actions";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function groupTasks(tasks: Task[]) {
  const today0 = startOfToday();
  const today1 = endOfToday();

  const groups = {
    overdue: [] as Task[],
    today: [] as Task[],
    upcoming: [] as Task[],
    noDate: [] as Task[],
    completed: [] as Task[],
  };

  for (const task of tasks) {
    if (task.completed) {
      groups.completed.push(task);
    } else if (!task.dueDate) {
      groups.noDate.push(task);
    } else if (task.dueDate < today0) {
      groups.overdue.push(task);
    } else if (task.dueDate <= today1) {
      groups.today.push(task);
    } else {
      groups.upcoming.push(task);
    }
  }

  return groups;
}

function TaskGroup({ title, tasks }: { title: string; tasks: Task[] }) {
  if (tasks.length === 0) return null;
  return (
    <section className="grid gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title} · {tasks.length}
      </h2>
      <ul className="grid gap-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}

export default async function TasksPage() {
  const userId = await getCurrentUserId();
  if (!userId) return <SignInPrompt />;

  const [tasks, connected] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
    isCalendarConnected(),
  ]);
  const groups = groupTasks(tasks);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tareas</h1>
          <p className="text-sm text-muted">
            {tasks.filter((t) => !t.completed).length} pendientes
          </p>
        </div>
        {connected && (
          <form
            action={async () => {
              "use server";
              await syncFromGoogleCalendar();
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent/10 hover:text-accent"
            >
              Sincronizar con Google Calendar
            </button>
          </form>
        )}
      </div>

      <TaskForm />

      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          No tienes tareas todavía. ¡Agrega la primera arriba!
        </p>
      ) : (
        <div className="grid gap-6">
          <TaskGroup title="Vencidas" tasks={groups.overdue} />
          <TaskGroup title="Hoy" tasks={groups.today} />
          <TaskGroup title="Próximas" tasks={groups.upcoming} />
          <TaskGroup title="Sin fecha" tasks={groups.noDate} />
          <TaskGroup title="Completadas" tasks={groups.completed} />
        </div>
      )}
    </div>
  );
}

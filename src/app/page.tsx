import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TaskItem } from "@/components/TaskItem";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [pendingCount, overdueCount, todayTasks] = await Promise.all([
    prisma.task.count({ where: { completed: false } }),
    prisma.task.count({
      where: { completed: false, dueDate: { lt: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.task.findMany({
      where: { completed: false, dueDate: { lte: todayEnd } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-xl font-semibold">Hola 👋</h1>
        <p className="text-sm text-muted">Este es tu resumen de hoy.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{pendingCount}</p>
          <p className="text-xs text-muted">Tareas pendientes</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold text-danger">{overdueCount}</p>
          <p className="text-xs text-muted">Vencidas</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{todayTasks.length}</p>
          <p className="text-xs text-muted">Para hoy</p>
        </div>
      </div>

      <section className="grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Tareas de hoy
          </h2>
          <Link href="/tasks" className="text-xs font-medium text-accent">
            Ver todas →
          </Link>
        </div>
        {todayTasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            No tienes tareas pendientes para hoy. 🎉
          </p>
        ) : (
          <ul className="grid gap-2">
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

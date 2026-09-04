import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TaskItem } from "@/components/TaskItem";
import { toggleHabitToday } from "@/app/habits/actions";
import { calculateStreak, dateKey } from "@/lib/streak";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [pendingCount, overdueCount, todayTasks, habits] = await Promise.all([
    prisma.task.count({ where: { completed: false } }),
    prisma.task.count({
      where: { completed: false, dueDate: { lt: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.task.findMany({
      where: { completed: false, dueDate: { lte: todayEnd } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.habit.findMany({ include: { completions: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const today = dateKey(new Date());

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

      {habits.length > 0 && (
        <section className="grid gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Hábitos
            </h2>
            <Link href="/habits" className="text-xs font-medium text-accent">
              Ver todos →
            </Link>
          </div>
          <ul className="grid gap-2">
            {habits.map((habit) => {
              const doneToday = habit.completions.some(
                (c) => dateKey(c.date) === today,
              );
              const streak = calculateStreak(habit.completions.map((c) => c.date));
              return (
                <li
                  key={habit.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: habit.color }}
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                    />
                    <p className="text-sm font-medium">{habit.name}</p>
                    <span className="text-xs text-muted">🔥 {streak}</span>
                  </div>
                  <form action={toggleHabitToday.bind(null, habit.id, !doneToday)}>
                    <button
                      type="submit"
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        doneToday
                          ? "bg-accent/10 text-accent"
                          : "bg-accent text-accent-foreground hover:opacity-90"
                      }`}
                    >
                      {doneToday ? "Hecho ✓" : "Marcar"}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

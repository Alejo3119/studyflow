import type { Habit, HabitCompletion } from "@prisma/client";
import { deleteHabit, toggleHabitToday } from "@/app/habits/actions";
import { calculateStreak, dateKey, lastDays } from "@/lib/streak";

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

export function HabitCard({
  habit,
}: {
  habit: Habit & { completions: HabitCompletion[] };
}) {
  const completionKeys = new Set(habit.completions.map((c) => dateKey(c.date)));
  const streak = calculateStreak(habit.completions.map((c) => c.date));
  const week = lastDays(7);
  const today = dateKey(new Date());
  const doneToday = completionKeys.has(today);

  return (
    <li className="grid gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: habit.color }}
            className="h-2.5 w-2.5 shrink-0 rounded-full"
          />
          <p className="text-sm font-medium">{habit.name}</p>
        </div>
        <form action={deleteHabit.bind(null, habit.id)}>
          <button
            type="submit"
            className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            Eliminar
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {week.map((date) => {
            const key = dateKey(date);
            const done = completionKeys.has(key);
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted">
                  {WEEKDAYS[date.getDay()]}
                </span>
                <span
                  className="h-5 w-5 rounded-full border border-border"
                  style={{
                    backgroundColor: done ? habit.color : "transparent",
                  }}
                />
              </div>
            );
          })}
        </div>
        <p className="text-sm font-semibold whitespace-nowrap">
          🔥 {streak} {streak === 1 ? "día" : "días"}
        </p>
      </div>

      <form action={toggleHabitToday.bind(null, habit.id, !doneToday)}>
        <button
          type="submit"
          className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            doneToday
              ? "bg-accent/10 text-accent"
              : "bg-accent text-accent-foreground hover:opacity-90"
          }`}
        >
          {doneToday ? "Hecho hoy ✓" : "Marcar como hecho hoy"}
        </button>
      </form>
    </li>
  );
}

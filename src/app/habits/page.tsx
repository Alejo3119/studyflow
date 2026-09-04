import { prisma } from "@/lib/prisma";
import { HabitForm } from "@/components/HabitForm";
import { HabitCard } from "@/components/HabitCard";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return <SignInPrompt />;

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { completions: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-xl font-semibold">Hábitos</h1>
        <p className="text-sm text-muted">Construye rachas, un día a la vez.</p>
      </div>

      <HabitForm />

      {habits.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          Todavía no tienes hábitos. ¡Agrega el primero arriba!
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </ul>
      )}
    </div>
  );
}

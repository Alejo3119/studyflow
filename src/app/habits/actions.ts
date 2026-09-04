"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { atMidnight } from "@/lib/streak";

export async function createHabit(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const color = String(formData.get("color") ?? "#6366f1");

  await prisma.habit.create({ data: { name, color } });

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function deleteHabit(id: string) {
  await prisma.habit.delete({ where: { id } });

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function toggleHabitToday(id: string, done: boolean) {
  const today = atMidnight(new Date());

  if (done) {
    await prisma.habitCompletion.upsert({
      where: { habitId_date: { habitId: id, date: today } },
      update: {},
      create: { habitId: id, date: today },
    });
  } else {
    await prisma.habitCompletion.deleteMany({
      where: { habitId: id, date: today },
    });
  }

  revalidatePath("/habits");
  revalidatePath("/");
}

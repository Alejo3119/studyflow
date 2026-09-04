"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function parseDueDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  return new Date(value);
}

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await prisma.task.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      subject: String(formData.get("subject") ?? "").trim() || null,
      priority: String(formData.get("priority") ?? "MEDIUM"),
      dueDate: parseDueDate(formData.get("dueDate")),
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function toggleTask(id: string, completed: boolean) {
  await prisma.task.update({
    where: { id },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function updateTask(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await prisma.task.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      subject: String(formData.get("subject") ?? "").trim() || null,
      priority: String(formData.get("priority") ?? "MEDIUM"),
      dueDate: parseDueDate(formData.get("dueDate")),
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

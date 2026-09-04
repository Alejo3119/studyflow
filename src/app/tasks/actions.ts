"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  isCalendarConnected,
  updateCalendarEvent,
} from "@/lib/google-calendar";

function parseDueDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  return new Date(value);
}

/** Creates, updates or removes the Google Calendar event that mirrors a task's due date. */
async function syncTaskToGoogle(task: {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  googleEventId: string | null;
}) {
  if (!(await isCalendarConnected())) return;

  if (!task.dueDate) {
    if (task.googleEventId) {
      await deleteCalendarEvent(task.googleEventId);
      await prisma.task.update({
        where: { id: task.id },
        data: { googleEventId: null },
      });
    }
    return;
  }

  if (task.googleEventId) {
    const ok = await updateCalendarEvent(task, task.googleEventId);
    if (!ok) {
      const newId = await createCalendarEvent(task);
      await prisma.task.update({
        where: { id: task.id },
        data: { googleEventId: newId },
      });
    }
  } else {
    const newId = await createCalendarEvent(task);
    if (newId) {
      await prisma.task.update({
        where: { id: task.id },
        data: { googleEventId: newId },
      });
    }
  }
}

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const task = await prisma.task.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      subject: String(formData.get("subject") ?? "").trim() || null,
      priority: String(formData.get("priority") ?? "MEDIUM"),
      dueDate: parseDueDate(formData.get("dueDate")),
    },
  });

  await syncTaskToGoogle(task);

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
  const task = await prisma.task.delete({ where: { id } });

  if (task.googleEventId && (await isCalendarConnected())) {
    await deleteCalendarEvent(task.googleEventId);
  }

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function updateTask(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      subject: String(formData.get("subject") ?? "").trim() || null,
      priority: String(formData.get("priority") ?? "MEDIUM"),
      dueDate: parseDueDate(formData.get("dueDate")),
    },
  });

  await syncTaskToGoogle(task);

  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

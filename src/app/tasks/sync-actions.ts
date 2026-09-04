"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createCalendarEvent, listUpcomingCalendarEvents } from "@/lib/google-calendar";

/** Pushes local tasks that have a due date but never made it to Google (e.g. connected after creating them). */
async function pushPendingTasks() {
  const pending = await prisma.task.findMany({
    where: { googleEventId: null, dueDate: { not: null } },
  });

  let pushed = 0;
  for (const task of pending) {
    const eventId = await createCalendarEvent(task);
    if (eventId) {
      await prisma.task.update({ where: { id: task.id }, data: { googleEventId: eventId } });
      pushed += 1;
    }
  }
  return pushed;
}

/** Pulls events from Google Calendar and creates local tasks for any not already linked. */
async function pullNewEvents() {
  const events = await listUpcomingCalendarEvents();
  if (events.length === 0) return 0;

  const existing = await prisma.task.findMany({
    where: { googleEventId: { not: null } },
    select: { googleEventId: true },
  });
  const known = new Set(existing.map((t) => t.googleEventId));

  let imported = 0;
  for (const event of events) {
    if (!event.id || known.has(event.id)) continue;
    if (event.extendedProperties?.private?.studyflowTaskId) continue;

    const rawDate = event.start?.date ?? event.start?.dateTime;
    if (!rawDate) continue;

    await prisma.task.create({
      data: {
        title: event.summary || "(Sin título)",
        description: event.description ?? null,
        dueDate: new Date(rawDate),
        googleEventId: event.id,
      },
    });
    imported += 1;
  }
  return imported;
}

/** Two-way sync: pushes local tasks missing from Google, then pulls new Google events in as tasks. */
export async function syncFromGoogleCalendar() {
  const pushed = await pushPendingTasks();
  const imported = await pullNewEvents();

  revalidatePath("/tasks");
  revalidatePath("/");
  return { pushed, imported };
}

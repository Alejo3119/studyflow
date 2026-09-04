"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { listUpcomingCalendarEvents } from "@/lib/google-calendar";

/** Pulls events from Google Calendar and creates local tasks for any not already linked. */
export async function syncFromGoogleCalendar() {
  const events = await listUpcomingCalendarEvents();
  if (events.length === 0) return { imported: 0 };

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

  revalidatePath("/tasks");
  revalidatePath("/");
  return { imported };
}

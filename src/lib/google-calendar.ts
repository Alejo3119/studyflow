import type { Task } from "@prisma/client";
import { auth } from "@/auth";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

async function calendarFetch(path: string, init?: RequestInit) {
  const session = await auth();
  const accessToken = session?.accessToken;
  if (!accessToken) return null;

  const res = await fetch(`${CALENDAR_API}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Google Calendar API error", res.status, await res.text());
    return null;
  }
  if (res.status === 204) return {};
  return res.json();
}

export async function isCalendarConnected() {
  const session = await auth();
  return Boolean(session?.accessToken);
}

function toEventBody(task: Pick<Task, "id" | "title" | "description" | "dueDate">) {
  const date = task.dueDate!.toISOString().slice(0, 10);
  return {
    summary: task.title,
    description: task.description ?? undefined,
    start: { date },
    end: { date },
    extendedProperties: { private: { studyflowTaskId: task.id } },
  };
}

export async function createCalendarEvent(
  task: Pick<Task, "id" | "title" | "description" | "dueDate">,
): Promise<string | null> {
  if (!task.dueDate) return null;
  const event = await calendarFetch("/calendars/primary/events", {
    method: "POST",
    body: JSON.stringify(toEventBody(task)),
  });
  return event?.id ?? null;
}

export async function updateCalendarEvent(
  task: Pick<Task, "id" | "title" | "description" | "dueDate">,
  googleEventId: string,
): Promise<boolean> {
  if (!task.dueDate) return false;
  const event = await calendarFetch(`/calendars/primary/events/${googleEventId}`, {
    method: "PATCH",
    body: JSON.stringify(toEventBody(task)),
  });
  return Boolean(event);
}

export async function deleteCalendarEvent(googleEventId: string): Promise<void> {
  await calendarFetch(`/calendars/primary/events/${googleEventId}`, {
    method: "DELETE",
  });
}

export type RemoteEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: { date?: string; dateTime?: string };
  extendedProperties?: { private?: { studyflowTaskId?: string } };
};

export async function listUpcomingCalendarEvents(): Promise<RemoteEvent[]> {
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 7);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 90);

  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const data = await calendarFetch(`/calendars/primary/events?${params.toString()}`);
  return data?.items ?? [];
}

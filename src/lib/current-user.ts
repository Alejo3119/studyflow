import { auth } from "@/auth";

/** Returns the current user's internal id, or null if not signed in. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

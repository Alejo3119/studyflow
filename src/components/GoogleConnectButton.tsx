import { auth, signIn, signOut } from "@/auth";

export async function GoogleConnectButton() {
  const session = await auth();

  if (session?.accessToken) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          title={session.user?.email ?? undefined}
          className="rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
        >
          Google conectado ✓
        </button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/tasks" });
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent/10 hover:text-accent"
      >
        Conectar Google Calendar
      </button>
    </form>
  );
}

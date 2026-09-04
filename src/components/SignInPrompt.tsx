import { signIn } from "@/auth";

export function SignInPrompt() {
  return (
    <div className="grid place-items-center gap-4 rounded-lg border border-dashed border-border p-10 text-center">
      <div>
        <h1 className="text-lg font-semibold">Bienvenido a StudyFlow</h1>
        <p className="mt-1 text-sm text-muted">
          Conecta tu cuenta de Google para ver tus tareas y hábitos.
        </p>
      </div>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/tasks" });
        }}
      >
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Conectar con Google
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";

const links = [
  { href: "/", label: "Panel" },
  { href: "/tasks", label: "Tareas" },
  { href: "/habits", label: "Hábitos" },
];

export function Nav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Study<span className="text-accent">Flow</span>
        </Link>
        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-accent/10 hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

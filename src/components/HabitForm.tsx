"use client";

import { useRef } from "react";
import { createHabit } from "@/app/habits/actions";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

export function HabitForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createHabit(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-4"
    >
      <input
        name="name"
        placeholder="Nuevo hábito (ej. Leer 20 min)"
        required
        className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="flex gap-1.5">
        {COLORS.map((color, i) => (
          <label key={color} className="cursor-pointer">
            <input
              type="radio"
              name="color"
              value={color}
              defaultChecked={i === 0}
              className="peer sr-only"
            />
            <span
              style={{ backgroundColor: color }}
              className="block h-6 w-6 rounded-full ring-offset-2 ring-offset-card peer-checked:ring-2 peer-checked:ring-foreground"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Agregar
      </button>
    </form>
  );
}

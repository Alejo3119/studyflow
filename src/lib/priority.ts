export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type PriorityValue = (typeof PRIORITIES)[number];

export const PRIORITY_LABEL: Record<PriorityValue, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export const PRIORITY_CLASS: Record<PriorityValue, string> = {
  LOW: "bg-slate-500/10 text-slate-500",
  MEDIUM: "bg-amber-500/10 text-amber-500",
  HIGH: "bg-red-500/10 text-red-500",
};

export function isPriority(value: string): value is PriorityValue {
  return (PRIORITIES as readonly string[]).includes(value);
}

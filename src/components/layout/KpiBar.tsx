type Kpi = {
  label: string;
  value: string;
  hint?: string;
  accent?: "green" | "blue" | "amber" | "red" | "teal";
};

const accentMap = {
  green: "text-accent-green-light",
  blue: "text-accent-blue",
  amber: "text-accent-amber",
  red: "text-accent-red",
  teal: "text-accent-teal",
};

export function KpiBar({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-5 border-b border-border bg-card">
      {items.map((it, i) => (
        <div
          key={i}
          className={`px-4 py-2 ${
            i < items.length - 1 ? "border-r border-border" : ""
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {it.label}
          </div>
          <div className="flex items-baseline gap-2">
            <div
              className={`font-mono text-lg font-semibold ${
                accentMap[it.accent ?? "green"]
              }`}
            >
              {it.value}
            </div>
          </div>
          {it.hint && (
            <div className="text-[10px] text-muted-foreground">{it.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}

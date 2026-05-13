import type { ReactNode } from "react";

export function Placeholder({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex-1 grid place-items-center p-8">
      <div className="max-w-md text-center">
        {icon && (
          <div className="mx-auto h-12 w-12 rounded-lg bg-card-2 border border-border grid place-items-center mb-4 text-accent-green-light">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <p className="mt-4 text-[11px] font-mono text-muted-foreground">
          TAHAP berikutnya akan dibangun setelah foundation diverifikasi.
        </p>
      </div>
    </div>
  );
}

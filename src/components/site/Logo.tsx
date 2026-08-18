import { Link } from "@tanstack/react-router";
import mark from "@/assets/logo-mark.png";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-7 w-7" : "h-10 w-10";
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl sm:text-2xl";

  return (
    <Link
      to="/"
      aria-label="Maré de Prata — página inicial"
      className={cn("group flex min-w-0 items-center gap-3", className)}
    >
      <img
        src={mark}
        alt=""
        width={64}
        height={64}
        className={cn(
          dims,
          "shrink-0 opacity-90 transition-transform duration-700 group-hover:rotate-[8deg]",
        )}
      />
      <span className="min-w-0">
        <span
          className={cn(
            "font-display block truncate leading-none tracking-[0.18em] text-silver-gradient",
            text,
          )}
        >
          MARÉ DE PRATA
        </span>
        <span className="mt-1 hidden text-[0.55rem] tracking-[0.42em] text-muted-foreground sm:block">
          BOUTIQUE
        </span>
      </span>
    </Link>
  );
}

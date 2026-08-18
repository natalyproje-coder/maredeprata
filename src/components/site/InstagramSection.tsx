import { Instagram } from "lucide-react";
import { categories } from "@/lib/catalog";

export function InstagramSection() {
  const tiles = [...categories, ...categories].slice(0, 6);

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="eyebrow">@maredeprata</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">Siga a Maré de Prata</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Descubra novidades, inspirações e lançamentos.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile, index) => (
            <a
              key={`${tile.slug}-${index}`}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden"
              aria-label={`Publicação do Instagram: ${tile.name}`}
            >
              <img
                src={tile.image}
                alt={tile.name}
                width={1024}
                height={1280}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 grid place-items-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Instagram className="h-5 w-5 text-silver" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { img } from "@/data/images";
import { cn } from "@/lib/utils";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [""];
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
        <img key={active} src={img(list[active])} alt={`${alt} — foto ${active + 1}`} width={1280} height={896} className="rise-in h-full w-full object-cover" />
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
                i === active ? "border-gold" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={img(src)} alt="" loading="lazy" width={320} height={224} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

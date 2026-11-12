import { useRef, type ReactNode } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { img } from "@/data/images";

export function AdminTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-3xl">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ConfirmDelete({ name, onConfirm }: { name: string; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive" aria-label={`Eliminar ${name}`}><Trash2 /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {name}?</AlertDialogTitle>
          <AlertDialogDescription>Esta acción no se puede deshacer. Si solo quieres ocultarlo, desactívalo.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const MAX_BYTES = 1_500_000;

/** Demo image upload: stores the image as a data URL. Swap for file storage when Cloud is enabled. */
export function ImageUpload({ images, onChange, multiple = true }: { images: string[]; onChange: (imgs: string[]) => void; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return toast.error("Solo se permiten imágenes.");
      if (file.size > MAX_BYTES) return toast.error("La imagen supera 1,5 MB.");
      const reader = new FileReader();
      reader.onload = () => onChange(multiple ? [...images, String(reader.result)] : [String(reader.result)]);
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="space-y-1.5">
      <Label>Imágenes</Label>
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <div key={i} className="relative h-16 w-20 overflow-hidden rounded-md border">
            <img src={img(src)} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label="Quitar imagen" className="absolute top-0.5 right-0.5 rounded-full bg-card/90 p-0.5"><X className="h-3 w-3" /></button>
          </div>
        ))}
        <button type="button" onClick={() => input.current?.click()} className="flex h-16 w-20 flex-col items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground hover:border-gold">
          <ImagePlus className="h-4 w-4" /> Subir
        </button>
        <input ref={input} type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
      </div>
      <p className="text-[0.7rem] text-muted-foreground">Demo: las imágenes se guardan en este navegador (máx. 1,5 MB).</p>
    </div>
  );
}

export function Field({ label, htmlFor, children, error }: { label: string; htmlFor?: string; children: ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

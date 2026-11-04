"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary, type UploadScope } from "@/lib/cloudinary-upload";
import { useDemoMode } from "@/lib/demo/mode";
import { DEMO_IMAGE_LIBRARY } from "@/lib/demo/seed";
import { cn } from "@/lib/utils";

export function ImageUploader({
  value,
  onChange,
  scope = "product",
  multiple = true,
  label = "Images",
  hint,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  scope?: UploadScope;
  multiple?: boolean;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { demo } = useDemoMode();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, multiple ? 6 : 1)) {
        urls.push(await uploadToCloudinary(file, scope));
      }
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
      toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-cream/40">{label}</p>
        <span className="text-[0.62rem] text-cream/25">
          {value.length} {value.length === 1 ? "file" : "files"}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2.5">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative size-24 overflow-hidden rounded-xl border border-cream/12 bg-ink-3"
          >
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            {index === 0 && multiple ? (
              <span className="absolute left-1.5 top-1.5 rounded bg-ink/75 px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-cream/70">
                Main
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/80 text-cream/70 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "grid size-24 place-items-center rounded-xl border border-dashed border-cream/20 text-cream/35 transition-colors hover:border-ember/50 hover:text-ember-3",
            uploading && "opacity-60",
          )}
          aria-label="Upload image"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {demo ? (
        <div className="mt-3 rounded-xl border border-cream/10 bg-cream/[0.015] p-3">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-cream/30">
            Demo image library
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO_IMAGE_LIBRARY.slice(0, 12).map((url) => {
              const active = value.includes(url);
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() =>
                    onChange(
                      multiple
                        ? active
                          ? value.filter((entry) => entry !== url)
                          : [...value, url]
                        : [url],
                    )
                  }
                  className={cn(
                    "relative size-12 overflow-hidden rounded-lg border transition-all",
                    active ? "border-ember ring-1 ring-ember/50" : "border-cream/10 opacity-70 hover:opacity-100",
                  )}
                  aria-label={active ? "Remove this demo image" : "Use this demo image"}
                  aria-pressed={active}
                >
                  <Image src={url} alt="" fill sizes="48px" className="object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="mt-2 text-[0.66rem] text-cream/25">
        {hint ??
          (demo
            ? "Pick from the demo image library — uploads need Cloudinary credentials."
            : "Signed upload via Cloudinary — the API secret stays on the server.")}
      </p>
    </div>
  );
}

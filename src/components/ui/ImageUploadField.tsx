"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  uploadPublicImage,
  type MediaBucket,
} from "@/lib/storage-upload";
import { cn } from "@/lib/utils";

export function ImageUploadField({
  label,
  value,
  onChange,
  bucket,
  folder,
  kind,
  aspectClass = "aspect-video",
  disabled,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket: MediaBucket;
  folder: string;
  kind: string;
  aspectClass?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setUploading(true);
    try {
      const { publicUrl } = await uploadPublicImage({
        bucket,
        folder,
        kind,
        file,
      });
      onChange(publicUrl);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-muted ring-1 ring-border/60",
          aspectClass,
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image yet
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
        {value ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || uploading}
            onClick={() => onChange("")}
          >
            Clear
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <p className="text-[11px] text-muted-foreground">
        Saved to live Supabase Storage ({bucket}).
      </p>
    </div>
  );
}

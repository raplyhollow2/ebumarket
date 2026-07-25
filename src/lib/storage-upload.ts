import { createClient } from "@/lib/supabase/client";

export type MediaBucket = "profile-media" | "center-media" | "listing-photos";

/**
 * Upload an image to a public Supabase Storage bucket and return its public URL.
 * Path convention: `{folder}/{kind}-{timestamp}.{ext}`
 */
export async function uploadPublicImage(opts: {
  bucket: MediaBucket;
  folder: string;
  kind: string;
  file: File;
}): Promise<{ publicUrl: string; path: string }> {
  const supabase = createClient();
  const ext =
    opts.file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `${opts.folder}/${opts.kind}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(opts.bucket)
    .upload(path, opts.file, {
      upsert: true,
      contentType: opts.file.type || "image/jpeg",
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(opts.bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

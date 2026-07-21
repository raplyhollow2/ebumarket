"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TeenShell } from "@/components/layout/teen-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORIES,
  CONDITIONS,
  REQUIRED_ANGLES,
  SIZES,
  type ListingType,
  type PhotoAngle,
} from "@/lib/types";

type Slot = { file: File | null; preview: string | null };

export function ListingComposer({
  type,
  userId,
}: {
  type: ListingType;
  userId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [size, setSize] = useState<string>(SIZES[2]);
  const [condition, setCondition] = useState<string>(CONDITIONS[1]);
  const [price, setPrice] = useState("");
  const [slots, setSlots] = useState<Record<PhotoAngle, Slot>>({
    front: { file: null, preview: null },
    back: { file: null, preview: null },
    tag: { file: null, preview: null },
    defect: { file: null, preview: null },
    other: { file: null, preview: null },
  });

  const requiredReady = useMemo(
    () => REQUIRED_ANGLES.every((a) => slots[a].file),
    [slots],
  );

  function setAngle(angle: PhotoAngle, file: File | null) {
    setSlots((prev) => {
      if (prev[angle].preview) URL.revokeObjectURL(prev[angle].preview!);
      return {
        ...prev,
        [angle]: {
          file,
          preview: file ? URL.createObjectURL(file) : null,
        },
      };
    });
  }

  function submit() {
    startTransition(async () => {
      if (!title.trim()) {
        toast.error("Add a title");
        return;
      }
      if (!requiredReady) {
        toast.error("Add Front, Back, Tag, and Defect photos");
        return;
      }
      const priceCents =
        type === "marketplace" ? Math.round(Number(price) * 100) : null;
      if (type === "marketplace" && (!priceCents || priceCents <= 0)) {
        toast.error("Enter a valid price");
        return;
      }

      const supabase = createClient();
      const { data: listing, error } = await supabase
        .from("listings")
        .insert({
          seller_id: userId,
          type,
          title: title.trim(),
          description: description.trim(),
          category,
          size,
          condition,
          price_cents: priceCents,
          currency: "BTN",
          status: "pending",
        })
        .select("id")
        .single();
      if (error || !listing) {
        toast.error(error?.message ?? "Could not create listing");
        return;
      }

      const angles = REQUIRED_ANGLES.concat(
        slots.other.file ? (["other"] as PhotoAngle[]) : [],
      );
      for (let i = 0; i < angles.length; i++) {
        const angle = angles[i];
        const file = slots[angle].file!;
        const path = `${userId}/${listing.id}/${angle}-${Date.now()}`;
        const { error: upErr } = await supabase.storage
          .from("listing-photos")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) {
          toast.error(upErr.message);
          return;
        }
        const { data: pub } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(path);
        const { error: photoErr } = await supabase.from("listing_photos").insert({
          listing_id: listing.id,
          angle,
          storage_path: path,
          public_url: pub.publicUrl,
          sort_order: i,
        });
        if (photoErr) {
          toast.error(photoErr.message);
          return;
        }
      }

      toast.success("Sent for verification");
      router.push("/activity");
      router.refresh();
    });
  }

  return (
    <TeenShell>
      <div className="mb-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {type === "marketplace" ? "Sell an item" : "List a donation"}
        </h1>
        <p className="text-sm text-muted-foreground">
          One screen — submit for Verified by Zyra review.
        </p>
      </div>

      <div className="space-y-4 pb-24">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Denim jacket"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Size</Label>
            <Select value={size} onValueChange={(v) => v && setSize(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Condition</Label>
          <Select value={condition} onValueChange={(v) => v && setCondition(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {type === "marketplace" && (
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (BTN / Nu.)</Label>
            <Input
              id="price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="500"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Fit, brand, any notes"
          />
        </div>

        <div>
          <Label>Photos (required angles)</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {REQUIRED_ANGLES.map((angle) => (
              <label
                key={angle}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-card text-center text-xs capitalize"
              >
                {slots[angle].preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slots[angle].preview!}
                    alt={angle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-muted-foreground">{angle}</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) =>
                    setAngle(angle, e.target.files?.[0] ?? null)
                  }
                />
              </label>
            ))}
          </div>
          <label className="mt-2 flex h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            + More photos
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAngle("other", e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-lg px-4 pb-2">
        <Button
          className="h-12 w-full shadow-lg"
          disabled={pending}
          onClick={submit}
        >
          {pending ? "Submitting…" : "Submit for verification"}
        </Button>
      </div>
    </TeenShell>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
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
import { CENTER_TYPE_LABELS } from "@/lib/donor-tiers";
import {
  CATEGORIES,
  CONDITIONS,
  REQUIRED_ANGLES,
  SIZES,
  type DonationCenter,
  type ListingType,
  type PhotoAngle,
} from "@/lib/types";

type Slot = { file: File | null; preview: string | null };

type BasketItem = {
  key: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  centerId: string | null;
  centerName: string | null;
  slots: Record<PhotoAngle, Slot>;
};

const NONE_CENTER = "__none__";

function emptySlots(): Record<PhotoAngle, Slot> {
  return {
    front: { file: null, preview: null },
    back: { file: null, preview: null },
    tag: { file: null, preview: null },
    defect: { file: null, preview: null },
    other: { file: null, preview: null },
  };
}

function revokeSlots(slots: Record<PhotoAngle, Slot>) {
  for (const s of Object.values(slots)) {
    if (s.preview) URL.revokeObjectURL(s.preview);
  }
}

async function createListingWithPhotos(opts: {
  userId: string;
  type: ListingType;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  priceCents: number | null;
  centerId: string | null;
  slots: Record<PhotoAngle, Slot>;
}) {
  const supabase = createClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      seller_id: opts.userId,
      type: opts.type,
      title: opts.title.trim(),
      description: opts.description.trim(),
      category: opts.category,
      size: opts.size,
      condition: opts.condition,
      price_cents: opts.priceCents,
      currency: "BTN",
      status: "pending",
      center_id: opts.centerId,
    })
    .select("id")
    .single();
  if (error || !listing) {
    throw new Error(error?.message ?? "Could not create listing");
  }

  const angles = REQUIRED_ANGLES.concat(
    opts.slots.other.file ? (["other"] as PhotoAngle[]) : [],
  );
  for (let i = 0; i < angles.length; i++) {
    const angle = angles[i];
    const file = opts.slots[angle].file!;
    const path = `${opts.userId}/${listing.id}/${angle}-${Date.now()}-${i}`;
    const { error: upErr } = await supabase.storage
      .from("listing-photos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) throw new Error(upErr.message);
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
    if (photoErr) throw new Error(photoErr.message);
  }
  return listing.id as string;
}

export function ListingComposer({
  type,
  userId,
  centers = [],
  initialCenterId = null,
}: {
  type: ListingType;
  userId: string;
  centers?: Pick<
    DonationCenter,
    "id" | "name" | "center_type" | "area" | "is_verified"
  >[];
  initialCenterId?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [size, setSize] = useState<string>(SIZES[2]);
  const [condition, setCondition] = useState<string>(CONDITIONS[1]);
  const [price, setPrice] = useState("");
  const [centerId, setCenterId] = useState<string>(
    initialCenterId && centers.some((c) => c.id === initialCenterId)
      ? initialCenterId
      : NONE_CENTER,
  );
  const [slots, setSlots] = useState<Record<PhotoAngle, Slot>>(emptySlots);
  const [basket, setBasket] = useState<BasketItem[]>([]);

  const isDonation = type === "donation";

  const selectedCenter = useMemo(
    () => centers.find((c) => c.id === centerId) ?? null,
    [centers, centerId],
  );

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

  function resetForm(keepCenter = true) {
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setSize(SIZES[2]);
    setCondition(CONDITIONS[1]);
    setPrice("");
    if (!keepCenter) setCenterId(NONE_CENTER);
    setSlots((prev) => {
      revokeSlots(prev);
      return emptySlots();
    });
  }

  function validateCurrent(): string | null {
    if (!title.trim()) return "Add a title";
    if (!requiredReady) return "Add Front, Back, Tag, and Defect photos";
    if (type === "marketplace") {
      const priceCents = Math.round(Number(price) * 100);
      if (!priceCents || priceCents <= 0) return "Enter a valid price";
    }
    return null;
  }

  function addToBasket() {
    const err = validateCurrent();
    if (err) {
      toast.error(err);
      return;
    }
    const item: BasketItem = {
      key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      size,
      condition,
      centerId: centerId !== NONE_CENTER ? centerId : null,
      centerName: selectedCenter?.name ?? null,
      slots,
    };
    setBasket((prev) => [...prev, item]);
    // Detach current slots into basket — don't revoke previews
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setSize(SIZES[2]);
    setCondition(CONDITIONS[1]);
    setSlots(emptySlots());
    toast.success(`Added to basket (${basket.length + 1})`);
  }

  function removeFromBasket(key: string) {
    setBasket((prev) => {
      const target = prev.find((i) => i.key === key);
      if (target) revokeSlots(target.slots);
      return prev.filter((i) => i.key !== key);
    });
  }

  function submitMarketplace() {
    startTransition(async () => {
      const err = validateCurrent();
      if (err) {
        toast.error(err);
        return;
      }
      try {
        await createListingWithPhotos({
          userId,
          type: "marketplace",
          title,
          description,
          category,
          size,
          condition,
          priceCents: Math.round(Number(price) * 100),
          centerId: null,
          slots,
        });
        toast.success("Sent for verification");
        router.push("/activity");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Submit failed");
      }
    });
  }

  function submitBasket() {
    startTransition(async () => {
      // Include in-progress form if valid
      let items = [...basket];
      const formErr = validateCurrent();
      if (!formErr && title.trim() && requiredReady) {
        items = [
          ...items,
          {
            key: "current",
            title: title.trim(),
            description: description.trim(),
            category,
            size,
            condition,
            centerId: centerId !== NONE_CENTER ? centerId : null,
            centerName: selectedCenter?.name ?? null,
            slots,
          },
        ];
      }

      if (items.length === 0) {
        toast.error("Add at least one item to the basket");
        return;
      }

      try {
        for (const item of items) {
          await createListingWithPhotos({
            userId,
            type: "donation",
            title: item.title,
            description: item.description,
            category: item.category,
            size: item.size,
            condition: item.condition,
            priceCents: null,
            centerId: item.centerId,
            slots: item.slots,
          });
        }
        toast.success(
          items.length === 1
            ? "1 donation sent for verification"
            : `${items.length} donations sent for verification`,
        );
        setBasket([]);
        resetForm(true);
        router.push("/activity");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Submit failed");
      }
    });
  }

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {isDonation ? "Donation basket" : "Sell an item"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isDonation
            ? "Add multiple clothes to your basket, then submit all for Zyra verification."
            : "One screen — submit for Verified by Zyra review."}
        </p>
      </div>

      {isDonation && basket.length > 0 ? (
        <div className="mb-6 space-y-2 rounded-2xl bg-card p-3 ring-1 ring-border/60">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              Basket · {basket.length} item{basket.length === 1 ? "" : "s"}
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                basket.forEach((i) => revokeSlots(i.slots));
                setBasket([]);
              }}
            >
              Clear
            </Button>
          </div>
          <ul className="space-y-2">
            {basket.map((item, idx) => (
              <li
                key={item.key}
                className="flex items-center gap-3 rounded-xl bg-muted/50 p-2"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.slots.front.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.slots.front.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {idx + 1}. {item.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.category} · {item.size}
                    {item.centerName ? ` · ${item.centerName}` : " · Peer gift"}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => removeFromBasket(item.key)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={`space-y-4 ${isDonation ? "pb-36" : "pb-24"}`}>
        {isDonation ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {basket.length === 0 ? "Item 1" : `Next item (${basket.length + 1})`}
          </p>
        ) : null}

        {isDonation && centers.length > 0 ? (
          <div className="space-y-1.5">
            <Label>Donate to (optional)</Label>
            <Select value={centerId} onValueChange={(v) => v && setCenterId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Peer gift or pick a centre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_CENTER}>
                  Peer gift — anyone can claim
                </SelectItem>
                {centers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.area ? ` · ${c.area}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCenter ? (
              <p className="text-xs text-muted-foreground">
                Tagged for {selectedCenter.name} (
                {CENTER_TYPE_LABELS[selectedCenter.center_type] ?? "centre"}).{" "}
                <Link href="/donate/centers" className="underline">
                  Browse centres
                </Link>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Or{" "}
                <Link href="/donate/centers" className="underline">
                  browse orphanages & centres
                </Link>{" "}
                first.
              </p>
            )}
          </div>
        ) : null}

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

      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-lg space-y-2 px-4 pb-2 md:bottom-4">
        {isDonation ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full bg-background shadow-lg"
              disabled={pending}
              onClick={addToBasket}
            >
              + Add to basket
            </Button>
            <Button
              className="h-12 w-full shadow-lg"
              disabled={pending}
              onClick={submitBasket}
            >
              {pending
                ? "Submitting…"
                : basket.length > 0
                  ? `Submit basket (${basket.length}${title.trim() && requiredReady ? "+1" : ""})`
                  : "Submit for verification"}
            </Button>
          </>
        ) : (
          <Button
            className="h-12 w-full shadow-lg"
            disabled={pending}
            onClick={submitMarketplace}
          >
            {pending ? "Submitting…" : "Submit for verification"}
          </Button>
        )}
      </div>
    </ResponsiveLayoutWrapper>
  );
}

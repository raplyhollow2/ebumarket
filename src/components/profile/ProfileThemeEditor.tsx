"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { createClient } from "@/lib/supabase/client";
import type {
  ProfileBackgroundStyle,
  ProfileCustomLink,
  ProfileLayoutStyle,
  ProfileTheme,
} from "@/lib/types";

const BACKGROUNDS: { value: ProfileBackgroundStyle; label: string }[] = [
  { value: "plain", label: "Plain" },
  { value: "soft_wash", label: "Soft wash" },
  { value: "grid_dots", label: "Grid dots" },
  { value: "photo_blur", label: "Photo blur" },
];

const LAYOUTS: { value: ProfileLayoutStyle; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "stacked", label: "Stacked" },
  { value: "magazine", label: "Magazine" },
];

const EMPTY_THEME: Omit<ProfileTheme, "user_id" | "updated_at"> = {
  banner_url: null,
  avatar_url: null,
  bio: "",
  accent_color: "#1c3024",
  background_style: "soft_wash",
  layout_style: "classic",
  show_donation_stats: true,
  show_listings: true,
  custom_links: [],
};

function normalizeLinks(raw: unknown): ProfileCustomLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is ProfileCustomLink =>
        Boolean(l) &&
        typeof l === "object" &&
        typeof (l as ProfileCustomLink).label === "string" &&
        typeof (l as ProfileCustomLink).url === "string",
    )
    .slice(0, 5);
}

export function ProfileThemeEditor({
  userId,
  theme,
}: {
  userId: string;
  theme: ProfileTheme | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initial = theme
    ? {
        ...theme,
        custom_links: normalizeLinks(theme.custom_links),
      }
    : { ...EMPTY_THEME, custom_links: [] as ProfileCustomLink[] };

  const [bannerUrl, setBannerUrl] = useState(initial.banner_url ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url ?? "");
  const [bio, setBio] = useState(initial.bio);
  const [accent, setAccent] = useState(initial.accent_color || "#1c3024");
  const [background, setBackground] = useState<ProfileBackgroundStyle>(
    initial.background_style,
  );
  const [layout, setLayout] = useState<ProfileLayoutStyle>(initial.layout_style);
  const [showStats, setShowStats] = useState(initial.show_donation_stats);
  const [showListings, setShowListings] = useState(initial.show_listings);
  const [links, setLinks] = useState<ProfileCustomLink[]>(
    initial.custom_links.length
      ? initial.custom_links
      : [{ label: "", url: "" }],
  );

  function save() {
    startTransition(async () => {
      const cleanLinks = links
        .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
        .filter((l) => l.label && l.url)
        .slice(0, 5);

      const supabase = createClient();
      const payload = {
        user_id: userId,
        banner_url: bannerUrl.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim(),
        accent_color: accent.trim() || "#1c3024",
        background_style: background,
        layout_style: layout,
        show_donation_stats: showStats,
        show_listings: showListings,
        custom_links: cleanLinks,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profile_themes")
        .upsert(payload, { onConflict: "user_id" });

      if (error) toast.error(error.message);
      else {
        toast.success("Page style saved");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl bg-card p-4 ring-1 ring-border/60">
      <div>
        <h2 className="font-medium">Customize page</h2>
        <p className="text-xs text-muted-foreground">
          Tumblr-style public profile — banner, accent, bio, layout.
        </p>
      </div>

      <div
        className="overflow-hidden rounded-xl ring-1 ring-border/50"
        style={{ borderColor: accent }}
      >
        <div
          className="h-20 bg-muted bg-cover bg-center"
          style={{
            backgroundImage: bannerUrl
              ? `url(${bannerUrl})`
              : `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 40%, white))`,
          }}
        />
        <div className="flex items-end gap-3 px-3 pb-3 -mt-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background ring-2 ring-background"
            style={{ backgroundColor: accent }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-white/90">You</span>
            )}
          </div>
          <p className="mb-1 line-clamp-2 flex-1 text-xs text-muted-foreground">
            {bio || "Your bio preview…"}
          </p>
        </div>
      </div>

      <ImageUploadField
        label="Banner image"
        value={bannerUrl}
        onChange={setBannerUrl}
        bucket="profile-media"
        folder={userId}
        kind="banner"
        aspectClass="aspect-[21/9]"
        disabled={pending}
      />
      <ImageUploadField
        label="Avatar image"
        value={avatarUrl}
        onChange={setAvatarUrl}
        bucket="profile-media"
        folder={userId}
        kind="avatar"
        aspectClass="aspect-square max-w-[140px]"
        disabled={pending}
      />
      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="A short about for your page"
          maxLength={280}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Accent</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-10 w-14 p-1"
            />
            <Input value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Background</Label>
          <Select
            value={background}
            onValueChange={(v) => v && setBackground(v as ProfileBackgroundStyle)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BACKGROUNDS.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Layout</Label>
        <Select
          value={layout}
          onValueChange={(v) => v && setLayout(v as ProfileLayoutStyle)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LAYOUTS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-stats">Show donor stats</Label>
        <Switch
          id="show-stats"
          checked={showStats}
          onCheckedChange={setShowStats}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-listings">Show listings</Label>
        <Switch
          id="show-listings"
          checked={showListings}
          onCheckedChange={setShowListings}
        />
      </div>

      <div className="space-y-2">
        <Label>Custom links (max 5)</Label>
        {links.map((link, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Label"
              value={link.label}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], label: e.target.value };
                setLinks(next);
              }}
            />
            <Input
              placeholder="https://"
              value={link.url}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], url: e.target.value };
                setLinks(next);
              }}
            />
          </div>
        ))}
        {links.length < 5 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLinks([...links, { label: "", url: "" }])}
          >
            + Link
          </Button>
        ) : null}
      </div>

      <Button disabled={pending} onClick={save} className="w-full">
        {pending ? "Saving…" : "Save page style"}
      </Button>
    </div>
  );
}

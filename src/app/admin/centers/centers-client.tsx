"use client";

import { useMemo, useState, useTransition } from "react";
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
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { createClient } from "@/lib/supabase/client";
import { CENTER_TYPE_LABELS } from "@/lib/donor-tiers";
import type {
  CenterMember,
  CenterType,
  DonationCenter,
  Profile,
} from "@/lib/types";

type MemberRow = CenterMember & {
  profiles?: Pick<Profile, "id" | "display_name"> | null;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function AdminCentersClient({
  centers: initialCenters,
  members: initialMembers,
  profiles,
}: {
  centers: DonationCenter[];
  members: MemberRow[];
  profiles: Pick<Profile, "id" | "display_name" | "area">[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [centers, setCenters] = useState(initialCenters);
  const [members, setMembers] = useState(initialMembers);

  const [name, setName] = useState("");
  const [centerType, setCenterType] = useState<CenterType>("orphanage");
  const [area, setArea] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [needs, setNeeds] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const [memberCenterId, setMemberCenterId] = useState(
    initialCenters[0]?.id ?? "",
  );
  const [memberUserId, setMemberUserId] = useState(profiles[0]?.id ?? "");
  const [memberRole, setMemberRole] = useState<"owner" | "staff">("staff");

  const membersByCenter = useMemo(() => {
    const map: Record<string, MemberRow[]> = {};
    for (const m of members) {
      (map[m.center_id] ??= []).push(m);
    }
    return map;
  }, [members]);

  function createCenter() {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const slug = slugify(name) || `centre-${Date.now()}`;
      const { data, error } = await supabase
        .from("donation_centers")
        .insert({
          name: name.trim(),
          center_type: centerType,
          slug,
          area: area.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          needs: needs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          cover_url: coverUrl.trim() || null,
          is_verified: true,
          is_active: true,
        })
        .select("*")
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      setCenters((prev) =>
        [...prev, data as DonationCenter].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setName("");
      setTagline("");
      setDescription("");
      setNeeds("");
      setCoverUrl("");
      toast.success("Centre created");
      router.refresh();
    });
  }

  function toggleFlag(
    id: string,
    field: "is_verified" | "is_active",
    value: boolean,
  ) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("donation_centers")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setCenters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      );
      toast.success("Updated");
      router.refresh();
    });
  }

  function addMember() {
    if (!memberCenterId || !memberUserId) {
      toast.error("Pick centre and user");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("center_members")
        .upsert(
          {
            center_id: memberCenterId,
            user_id: memberUserId,
            member_role: memberRole,
          },
          { onConflict: "center_id,user_id" },
        )
        .select("*, profiles:user_id(id, display_name)")
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      setMembers((prev) => {
        const without = prev.filter(
          (m) =>
            !(
              m.center_id === memberCenterId && m.user_id === memberUserId
            ),
        );
        return [...without, data as MemberRow];
      });
      toast.success("Staff linked");
      router.refresh();
    });
  }

  function removeMember(id: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("center_members")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Removed");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card p-4">
        <h2 className="font-medium">Add centre</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Orphanage / community centre / shelter — verified by default for ops speed.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={centerType}
              onValueChange={(v) => v && setCenterType(v as CenterType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CENTER_TYPE_LABELS) as CenterType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {CENTER_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Area</Label>
            <Input value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Tagline</Label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Needs (comma-separated)</Label>
            <Input
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
              placeholder="Jackets, Shoes"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <ImageUploadField
              label="Cover image"
              value={coverUrl}
              onChange={setCoverUrl}
              bucket="center-media"
              folder="covers"
              kind="cover"
              aspectClass="aspect-[21/9]"
              disabled={pending}
            />
          </div>
        </div>
        <Button className="mt-3" disabled={pending} onClick={createCenter}>
          Create centre
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Directory ({centers.length})</h2>
        {centers.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border bg-card p-3 space-y-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {CENTER_TYPE_LABELS[c.center_type] ?? c.center_type}
                  {c.area ? ` · ${c.area}` : ""} · {c.slug}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={c.is_verified ? "default" : "outline"}
                  disabled={pending}
                  onClick={() => toggleFlag(c.id, "is_verified", !c.is_verified)}
                >
                  {c.is_verified ? "Verified" : "Unverified"}
                </Button>
                <Button
                  size="sm"
                  variant={c.is_active ? "default" : "outline"}
                  disabled={pending}
                  onClick={() => toggleFlag(c.id, "is_active", !c.is_active)}
                >
                  {c.is_active ? "Active" : "Inactive"}
                </Button>
              </div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {(membersByCenter[c.id] ?? []).length === 0 ? (
                <li>No staff linked</li>
              ) : (
                (membersByCenter[c.id] ?? []).map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>
                      {m.profiles?.display_name ?? m.user_id.slice(0, 8)} ·{" "}
                      {m.member_role}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => removeMember(m.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))
              )}
            </ul>
            <div className="pt-1">
              <ImageUploadField
                label="Update cover"
                value={c.cover_url ?? ""}
                onChange={(url) => {
                  startTransition(async () => {
                    const supabase = createClient();
                    const { error } = await supabase
                      .from("donation_centers")
                      .update({
                        cover_url: url || null,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("id", c.id);
                    if (error) {
                      toast.error(error.message);
                      return;
                    }
                    setCenters((prev) =>
                      prev.map((x) =>
                        x.id === c.id ? { ...x, cover_url: url || null } : x,
                      ),
                    );
                    toast.success("Cover saved");
                    router.refresh();
                  });
                }}
                bucket="center-media"
                folder={c.id}
                kind="cover"
                aspectClass="aspect-[21/9]"
                disabled={pending}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-card p-4 space-y-3">
        <h2 className="font-medium">Link staff</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Centre</Label>
            <Select
              value={memberCenterId}
              onValueChange={(v) => v && setMemberCenterId(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Centre" />
              </SelectTrigger>
              <SelectContent>
                {centers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>User</Label>
            <Select
              value={memberUserId}
              onValueChange={(v) => v && setMemberUserId(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.display_name || p.id.slice(0, 8)}
                    {p.area ? ` · ${p.area}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={memberRole}
              onValueChange={(v) =>
                v && setMemberRole(v as "owner" | "staff")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button disabled={pending} onClick={addMember}>
          Add member
        </Button>
      </section>
    </div>
  );
}

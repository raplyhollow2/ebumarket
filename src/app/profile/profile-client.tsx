"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { MeetupPoint, Profile } from "@/lib/types";

export function ProfileClient({
  profile,
  meetups,
}: {
  profile: Profile;
  meetups: MeetupPoint[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [area, setArea] = useState(profile.area);
  const [label, setLabel] = useState("");
  const canApprove =
    profile.role === "admin" || Boolean(profile.can_approve);

  function saveProfile() {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, area })
        .eq("id", profile.id);
      if (error) toast.error(error.message);
      else {
        toast.success("Profile saved");
        router.refresh();
      }
    });
  }

  function addMeetup() {
    if (!label.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("meetup_points").insert({
        user_id: profile.id,
        label: label.trim(),
      });
      if (error) toast.error(error.message);
      else {
        setLabel("");
        toast.success("Meetup added");
        router.refresh();
      }
    });
  }

  function removeMeetup(id: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("meetup_points").delete().eq("id", id);
      if (error) toast.error(error.message);
      else {
        toast.success("Removed");
        router.refresh();
      }
    });
  }

  function logout() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {canApprove ? (
        <Link
          href="/admin"
          className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground"
        >
          <div>
            <p className="font-medium">Approval queue</p>
            <p className="text-xs text-primary-foreground/80">
              Review pending marketplace & donation listings
            </p>
          </div>
          <span aria-hidden>→</span>
        </Link>
      ) : null}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Display name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Area</Label>
          <Input value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <Button disabled={pending} onClick={saveProfile}>
          Save profile
        </Button>
      </div>

      <div>
        <h2 className="font-medium">Meetup spots</h2>
        <ul className="mt-2 space-y-2">
          {meetups.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-xl bg-card px-3 py-2 ring-1 ring-border/60"
            >
              <span className="text-sm">{m.label}</span>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => removeMeetup(m.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Add public meetup"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Button disabled={pending} onClick={addMeetup}>
            Add
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={logout}
      >
        Log out
      </Button>
    </div>
  );
}

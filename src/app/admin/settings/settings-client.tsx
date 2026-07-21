"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const CURRENCIES = ["BTN", "INR", "USD"] as const;

export function AdminSettingsClient({
  initialCurrency,
  initialFeePercent,
  users,
}: {
  initialCurrency: string;
  initialFeePercent: number;
  users: (Profile & { email?: string | null })[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [currency, setCurrency] = useState(initialCurrency);
  const [fee, setFee] = useState(String(initialFeePercent));
  const [rows, setRows] = useState(users);

  function savePlatform() {
    startTransition(async () => {
      const supabase = createClient();
      const feeNum = Number(fee);
      if (Number.isNaN(feeNum) || feeNum < 0 || feeNum > 100) {
        toast.error("Fee percent must be 0–100");
        return;
      }
      const updates = [
        supabase.from("app_config").upsert(
          {
            key: "currency",
            value: currency,
          },
          { onConflict: "key" },
        ),
        supabase.from("app_config").upsert(
          {
            key: "platform_fee_percent",
            value: feeNum,
          },
          { onConflict: "key" },
        ),
      ];
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error)?.error;
      if (err) {
        toast.error(err.message);
        return;
      }
      // Align existing listings to platform currency
      await supabase
        .from("listings")
        .update({ currency })
        .neq("currency", currency);
      toast.success("Platform settings saved");
      router.refresh();
    });
  }

  function updateUser(
    id: string,
    patch: Partial<Pick<Profile, "role" | "can_approve">>,
  ) {
    startTransition(async () => {
      const supabase = createClient();
      const next = {
        ...patch,
        ...(patch.role === "admin" ? { can_approve: true } : {}),
      };
      const { error } = await supabase
        .from("profiles")
        .update(next)
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setRows((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...next } : u)),
      );
      toast.success("User updated");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-card p-4 ring-1 ring-border/70">
        <h2 className="text-lg font-semibold">Currency & fees</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform currency for new and existing listings. Default is BTN (Nu.).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select
              value={currency}
              onValueChange={(v) => v && setCurrency(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "BTN" ? "BTN — Bhutanese Ngultrum (Nu.)" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fee">Platform fee %</Label>
            <Input
              id="fee"
              inputMode="decimal"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
        </div>
        <Button className="mt-4" disabled={pending} onClick={savePlatform}>
          Save platform settings
        </Button>
      </section>

      <section className="rounded-2xl bg-card p-4 ring-1 ring-border/70">
        <h2 className="text-lg font-semibold">Users & who can approve</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Admins always approve. Toggle <strong>Can approve</strong> to let
          other users access the approval queue.
        </p>
        <ul className="mt-4 divide-y divide-border/70">
          {rows.map((u) => (
            <li
              key={u.id}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {u.display_name || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {u.area || "No area"} · {u.id.slice(0, 8)}…
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={u.role}
                  onValueChange={(v) =>
                    v &&
                    updateUser(u.id, {
                      role: v as Profile["role"],
                      can_approve: v === "admin" ? true : u.can_approve,
                    })
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={Boolean(u.can_approve) || u.role === "admin"}
                    disabled={u.role === "admin" || pending}
                    onChange={(e) =>
                      updateUser(u.id, { can_approve: e.target.checked })
                    }
                  />
                  Can approve
                </label>
              </div>
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="py-4 text-sm text-muted-foreground">No users yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

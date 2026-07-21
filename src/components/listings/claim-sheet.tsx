"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AuthSheet } from "@/components/auth/auth-sheet";
import { createClient } from "@/lib/supabase/client";

export function ClaimSheet({
  open,
  onOpenChange,
  listingId,
  isAuthed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listingId: string;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [pickup, setPickup] = useState("");
  const [asOrg, setAsOrg] = useState(false);

  function submit() {
    if (!isAuthed) {
      setAuthOpen(true);
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthOpen(true);
        return;
      }
      if (asOrg) {
        await supabase
          .from("profiles")
          .update({ is_organization: true })
          .eq("id", user.id);
      }
      const { error } = await supabase.from("donation_claims").insert({
        listing_id: listingId,
        claimer_id: user.id,
        message: message.trim(),
        contact: contact.trim(),
        pickup_preference: pickup.trim(),
        status: "requested",
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Request sent");
      onOpenChange(false);
      router.push("/activity");
      router.refresh();
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Request this donation</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 pb-6">
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Contact</Label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone or email"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred pickup</Label>
              <Input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Saturday afternoon"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={asOrg}
                onCheckedChange={(v) => setAsOrg(Boolean(v))}
              />
              Claiming as an organization
            </label>
            <Button className="h-12 w-full" disabled={pending} onClick={submit}>
              {pending ? "Sending…" : "Send request"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <AuthSheet open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}

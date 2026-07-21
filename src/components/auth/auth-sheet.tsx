"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

type Mode = "signup" | "login";

export function AuthSheet({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState("");
  const [meetup, setMeetup] = useState("");
  const [ageOk, setAgeOk] = useState(false);

  function reset() {
    setDisplayName("");
    setEmail("");
    setPassword("");
    setArea("");
    setMeetup("");
    setAgeOk(false);
  }

  function submit() {
    startTransition(async () => {
      const supabase = createClient();
      try {
        if (mode === "signup") {
          if (!ageOk) {
            toast.error("Confirm you are 13+ to continue.");
            return;
          }
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { display_name: displayName, area },
            },
          });
          if (error) throw error;
          const userId = data.user?.id;
          if (userId) {
            await supabase
              .from("profiles")
              .update({ display_name: displayName, area })
              .eq("id", userId);
            if (meetup.trim()) {
              await supabase.from("meetup_points").insert({
                user_id: userId,
                label: meetup.trim(),
              });
            }
          }
          toast.success("Welcome to Zyra");
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          toast.success("Logged in");
        }
        onOpenChange(false);
        reset();
        router.refresh();
        onSuccess?.();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Auth failed");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[90dvh] max-w-lg rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "signup" ? "Create your Zyra" : "Log in to Zyra"}
          </SheetTitle>
          <SheetDescription>
            Browse freely. Sign in when you sell, buy, or claim.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3 overflow-y-auto pb-6">
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Maya"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="area">Your area</Label>
                <Input
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Northside"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meetup">First meetup spot (optional)</Label>
                <Input
                  id="meetup"
                  value={meetup}
                  onChange={(e) => setMeetup(e.target.value)}
                  placeholder="Mall food court"
                />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
          {mode === "signup" && (
            <div className="space-y-2 rounded-lg bg-muted/60 p-3">
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={ageOk}
                  onCheckedChange={(v) => setAgeOk(Boolean(v))}
                  className="mt-0.5"
                />
                <span>I confirm I&apos;m 13+</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Under 16? Ask a parent or guardian if you&apos;re unsure about joining.
              </p>
            </div>
          )}
          <Button className="h-12 w-full" disabled={pending} onClick={submit}>
            {pending ? "Working…" : mode === "signup" ? "Sign up" : "Log in"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          >
            {mode === "signup"
              ? "Already have an account? Log in"
              : "Need an account? Sign up"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

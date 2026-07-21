"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "signup" | "login";

export function AuthSheet({
  open,
  onOpenChange,
  onSuccess,
  initialMode = "login",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialMode?: Mode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState("");
  const [meetup, setMeetup] = useState("");
  const [ageOk, setAgeOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
    }
  }, [open, initialMode]);

  function reset() {
    setDisplayName("");
    setEmail("");
    setPassword("");
    setArea("");
    setMeetup("");
    setAgeOk(false);
    setError(null);
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      try {
        if (!email.trim() || !password) {
          throw new Error("Email and password are required");
        }

        if (mode === "signup") {
          if (!displayName.trim()) {
            throw new Error("Display name is required");
          }
          if (!ageOk) {
            throw new Error("Confirm you are 13+ to continue");
          }

          const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                display_name: displayName.trim(),
                area: area.trim(),
              },
            },
          });
          if (signUpError) throw signUpError;

          // Confirm email in MVP (Supabase may require confirmation)
          await fetch("/api/auth/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim() }),
          });

          // Ensure we have a session
          if (!data.session) {
            const { error: signInError } = await supabase.auth.signInWithPassword(
              {
                email: email.trim(),
                password,
              },
            );
            if (signInError) throw signInError;
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("profiles")
              .upsert({
                id: user.id,
                display_name: displayName.trim(),
                area: area.trim(),
              });
            if (meetup.trim()) {
              await supabase.from("meetup_points").insert({
                user_id: user.id,
                label: meetup.trim(),
              });
            }
          }
          toast.success("Welcome to Zyra");
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email: email.trim(),
              password,
            },
          );
          if (signInError) {
            // Retry once after confirming email (common MVP friction)
            if (/confirm|confirmation/i.test(signInError.message)) {
              await fetch("/api/auth/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
              });
              const retry = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
              });
              if (retry.error) throw retry.error;
            } else {
              throw signInError;
            }
          }
          toast.success("Logged in");
        }

        onOpenChange(false);
        reset();
        router.refresh();
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Auth failed";
        setError(message);
        toast.error(message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
            {mode === "signup" ? "Sign up" : "Log in"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Create your Zyra account to sell, buy, or donate."
              : "Welcome back — log in to continue."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            className={cn(
              "h-9 rounded-md text-sm font-medium transition",
              mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            Log in
          </button>
          <button
            type="button"
            className={cn(
              "h-9 rounded-md text-sm font-medium transition",
              mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
          >
            Sign up
          </button>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Maya"
                  autoComplete="nickname"
                  required
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
                <Label htmlFor="meetup">Meetup spot (optional)</Label>
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
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
              minLength={6}
            />
          </div>

          {mode === "signup" && (
            <label className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={ageOk}
                onChange={(e) => setAgeOk(e.target.checked)}
              />
              <span>
                I confirm I&apos;m 13+.
                <span className="mt-1 block text-xs text-muted-foreground">
                  Under 16? Ask a parent or guardian if you&apos;re unsure.
                </span>
              </span>
            </label>
          )}

          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="h-11 w-full" disabled={pending}>
            {pending
              ? "Working…"
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

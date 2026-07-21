"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthSheet } from "@/components/auth/auth-sheet";
import { Button } from "@/components/ui/button";

export function AdminLoginGate() {
  const [open, setOpen] = useState(true);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
        Admin approval
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Log in with an admin account to review pending listings.
      </p>
      <Button className="mt-6 h-11" onClick={() => setOpen(true)}>
        Log in as admin
      </Button>
      <Link href="/" className="mt-4 text-sm underline">
        Back to app
      </Link>
      <AuthSheet
        open={open}
        onOpenChange={setOpen}
        initialMode="login"
        onSuccess={() => {
          window.location.href = "/admin";
        }}
      />
    </div>
  );
}

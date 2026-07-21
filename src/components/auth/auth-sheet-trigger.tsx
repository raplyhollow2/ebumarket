"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthSheet } from "@/components/auth/auth-sheet";

export function AuthSheetTrigger({ label = "Log in / Sign up" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="h-12" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <AuthSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

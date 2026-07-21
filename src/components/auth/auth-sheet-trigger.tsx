"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthSheet } from "@/components/auth/auth-sheet";

export function AuthSheetTrigger({
  label = "Log in / Sign up",
  mode = "login",
  className,
  variant = "default",
  size = "default",
}: {
  label?: string;
  mode?: "login" | "signup";
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className={className}
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <AuthSheet open={open} onOpenChange={setOpen} initialMode={mode} />
    </>
  );
}

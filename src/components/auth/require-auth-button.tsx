"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthSheet } from "@/components/auth/auth-sheet";

export function RequireAuthButton({
  children,
  isAuthed,
  className,
  variant = "default",
  size = "default",
  onAuthedClick,
}: {
  children: React.ReactNode;
  isAuthed: boolean;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  onAuthedClick?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className={className}
        variant={variant}
        size={size}
        onClick={() => {
          if (isAuthed) onAuthedClick?.();
          else setOpen(true);
        }}
      >
        {children}
      </Button>
      <AuthSheet
        open={open}
        onOpenChange={setOpen}
        onSuccess={onAuthedClick}
        initialMode="login"
      />
    </>
  );
}

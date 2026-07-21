"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AuthSheet } from "@/components/auth/auth-sheet";
import { cn } from "@/lib/utils";

export function RequireAuthLink({
  href,
  isAuthed,
  children,
  className,
}: {
  href: string;
  isAuthed: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (isAuthed) {
    return (
      <Link
        href={href}
        className={cn(buttonVariants({ size: "sm" }), className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn(buttonVariants({ size: "sm" }), className)}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <AuthSheet
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => router.push(href)}
      />
    </>
  );
}

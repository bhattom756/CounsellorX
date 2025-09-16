"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AuthDialogGate() {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAuthRoute = useMemo(() => pathname?.startsWith("/login") || pathname?.startsWith("/signup"), [pathname]);

  useEffect(() => {
    if (!loading) {
      if (isAuthRoute) {
        setOpen(false);
      } else {
        setOpen(!user);
      }
    }
  }, [user, loading, isAuthRoute]);

  if (loading || isAuthRoute) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-blue-100 border-1 border-amber-50 h-50"  showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>You are not logged in</DialogTitle>
          <DialogDescription>
            Kindly log in to continue using the app.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Link href="/signup" className="w-full">
            <Button className="w-full transition-transform duration-200 hover:scale-[1.02] hover:shadow-md" variant="outline">Sign up</Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button className="w-full transition-transform duration-200 hover:scale-[1.02] hover:shadow-md">Log in</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}



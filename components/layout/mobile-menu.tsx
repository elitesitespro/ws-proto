"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import styles from "./mobile-menu.module.css";

type MobileMenuProps = {
  items: readonly { label: string; href: string }[];
};

export function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.root} onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <XIcon aria-hidden="true" className="size-(--icon-size-min)" />
        ) : (
          <MenuIcon aria-hidden="true" className="size-(--icon-size-min)" />
        )}
      </Button>

      <div
        id="mobile-navigation"
        className={cn(
          "absolute inset-x-0 top-full border-b border-border/50 bg-background/90 px-3 pb-3 shadow-lg backdrop-blur-xl",
          !open && "hidden"
        )}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1 py-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="flex min-h-6 items-center rounded-lg px-2 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border/50 pt-2">
          <Link
            href="/sign-in"
            prefetch={false}
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full bg-transparent"
            )}
          >
            Sign in
          </Link>
          <Link
            href="/create-account"
            prefetch={false}
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full"
            )}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

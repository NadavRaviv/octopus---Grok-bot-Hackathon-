"use client";

import Link from "next/link";
import { Octopus } from "@/components/octopus";
import { Button } from "@/components/ui/button";

export function Splash() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--journey-h))] flex-col items-center justify-center gap-4">
      <Octopus className="size-24" />
      <p className="animate-pulse text-sm text-muted-foreground">Untangling tentacles…</p>
    </div>
  );
}

export function Lost({ message }: { message: string }) {
  return (
    <div className="flex min-h-[calc(100dvh-var(--journey-h))] flex-col items-center justify-center gap-5 px-6 text-center">
      <Octopus className="size-36" mood="sleepy" />
      <h1 className="font-display text-3xl font-black">Hmm, this link went for a swim</h1>
      <p className="max-w-md text-muted-foreground">{message}</p>
      <Button render={<Link href="/" />} nativeButton={false} size="lg" className="rounded-xl">
        Back to Octopus
      </Button>
    </div>
  );
}

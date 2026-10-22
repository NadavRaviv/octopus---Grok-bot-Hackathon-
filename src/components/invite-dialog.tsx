"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { MemberAvatar } from "@/components/member-avatar";
import { Octopus } from "@/components/octopus";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Member, Tribe } from "@/lib/types";

export function InviteDialog({
  open,
  onOpenChange,
  tribe,
  me,
  members,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tribe: Tribe;
  me: Member | null;
  members: Member[];
}) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const ref = me?.id ?? members[0]?.id;
  const link = `${origin}/invite/${tribe.id}${ref ? `?ref=${ref}` : ""}`;
  const pitch = `I'm in ${tribe.name} on Octopus 🐙 ${tribe.tagline} Join us:`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard can be blocked in iframes; the link is still selectable.
    }
    setCopied(true);
    toast.success("Invite link copied. Go grow that tribe!");
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden bg-panel p-0 sm:max-w-md">
        <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia px-6 pt-6 pb-16">
          <DialogTitle className="font-display text-2xl font-black text-white">Grow {tribe.name}</DialogTitle>
          <DialogDescription className="max-w-[16rem] text-white/85">
            Friends who join land straight in this tribe, then Grok matches them into new ones.
          </DialogDescription>
          <Octopus className="absolute -right-2 -bottom-6 size-32" mood="wink" />
        </div>
        <div className="space-y-5 p-6">
          <div className="flex items-center justify-center gap-2" aria-hidden>
            {me && <MemberAvatar name={me.name} src={me.avatar} className="size-10 rounded-full ring-2 ring-white" />}
            <span className="text-muted-foreground">→</span>
            <span className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-white/30 text-lg">
              🙋
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="flex -space-x-2">
              {["🙋‍♀️", "🙋‍♂️", "🙋"].map((e) => (
                <span key={e} className="flex size-8 items-center justify-center rounded-full bg-rail text-sm ring-2 ring-panel">
                  {e}
                </span>
              ))}
            </span>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Your personal invite link
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="h-10 min-w-0 flex-1 rounded-lg bg-rail px-3 text-sm text-muted-foreground outline-none"
                aria-label="Invite link"
              />
              <Button onClick={copy} className="h-10 rounded-lg px-4">
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="h-10"
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${pitch} ${link}`)}`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
              nativeButton={false}
            >
              💬 WhatsApp
            </Button>
            <Button
              variant="secondary"
              className="h-10"
              render={
                <a
                  href={`https://x.com/intent/post?text=${encodeURIComponent(pitch)}&url=${encodeURIComponent(link)}`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
              nativeButton={false}
            >
              𝕏 Post
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            render={<a href={link} target="_blank" rel="noreferrer" />}
            nativeButton={false}
          >
            <ExternalLink /> Preview what your friend sees
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

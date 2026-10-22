"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Mood = "happy" | "wink" | "party" | "sleepy";

// Four left arms; the right four are mirrored around x=100.
const ARMS_LEFT = [
  "M58 98 C 34 92, 20 70, 28 50 C 33 39, 46 42, 42 53",
  "M58 112 C 32 118, 16 140, 26 158 C 32 168, 46 162, 42 152",
  "M70 124 C 54 142, 50 168, 64 180 C 72 186, 82 178, 74 170",
  "M88 130 C 84 150, 80 168, 84 182 C 87 190, 96 190, 93 182",
];

function mirror(d: string) {
  return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${200 - Number(x)} ${y}`);
}

const ARMS = [...ARMS_LEFT, ...ARMS_LEFT.map(mirror)];

export function Octopus({
  className,
  mood = "happy",
  animated = true,
  litArms,
  title = "Octopus mascot",
}: {
  className?: string;
  mood?: Mood;
  animated?: boolean;
  /** Number of arms (0-8) to light up, used as a skill progress meter. */
  litArms?: number;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const body = `url(#body-${id})`;
  const lit = litArms ?? 8;
  const order = [0, 4, 1, 5, 2, 6, 3, 7];
  const isLit = (i: number) => order.indexOf(i) < lit;

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={title}
      className={cn("overflow-visible", animated && "octo-bob", className)}
    >
      <defs>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="55%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="0" floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter={`url(#shadow-${id})`}>
        {/* White sticker outline */}
        <g fill="none" stroke="#fff" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round">
          {ARMS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <ellipse cx="100" cy="84" rx="62" ry="60" fill="#fff" />
        <ellipse cx="100" cy="114" rx="52" ry="28" fill="#fff" />
        {mood === "party" && <path d="M78 34 L100 -14 L122 34 Z" fill="#fff" stroke="#fff" strokeWidth="14" strokeLinejoin="round" />}

        {/* Arms */}
        <g fill="none" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
          {ARMS.map((d, i) => {
            const wave = animated && mood !== "sleepy" && (i === 0 || i === 4);
            return (
              <path
                key={i}
                d={d}
                stroke={isLit(i) ? body : "#4b4d57"}
                className={cn(
                  wave && (i === 0 ? "octo-wave" : "octo-wave-r"),
                  animated && !wave && "octo-wiggle",
                )}
                style={animated && !wave ? { animationDelay: `${i * 0.15}s` } : undefined}
              />
            );
          })}
        </g>
        {/* Suckers */}
        <g fill="#fde7f3" opacity="0.85">
          {[
            [34, 150],
            [56, 170],
            [86, 172],
            [166, 150],
            [144, 170],
            [114, 172],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.6" opacity={isLit(order[i % 8]) ? 1 : 0.2} />
          ))}
        </g>

        {/* Head */}
        <ellipse cx="100" cy="84" rx="54" ry="52" fill={body} />
        <ellipse cx="100" cy="112" rx="45" ry="22" fill={body} />
        <ellipse cx="76" cy="52" rx="15" ry="8" fill="#fff" opacity="0.45" transform="rotate(-25 76 52)" />
        <circle cx="96" cy="44" r="3.5" fill="#fff" opacity="0.5" />

        {/* Face */}
        {mood === "sleepy" ? (
          <g stroke="#1e1b2e" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M70 92 Q80 98 90 92" />
            <path d="M110 92 Q120 98 130 92" />
          </g>
        ) : (
          <g>
            <ellipse cx="80" cy="90" rx="11" ry="13" fill="#1e1b2e" />
            <circle cx="84" cy="85" r="4.2" fill="#fff" />
            <circle cx="77" cy="95" r="2" fill="#fff" />
            {mood === "wink" ? (
              <path d="M109 92 Q120 82 131 92" stroke="#1e1b2e" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            ) : (
              <>
                <ellipse cx="120" cy="90" rx="11" ry="13" fill="#1e1b2e" />
                <circle cx="124" cy="85" r="4.2" fill="#fff" />
                <circle cx="117" cy="95" r="2" fill="#fff" />
              </>
            )}
          </g>
        )}
        <ellipse cx="64" cy="108" rx="9" ry="5.5" fill="#fb7185" opacity="0.7" />
        <ellipse cx="136" cy="108" rx="9" ry="5.5" fill="#fb7185" opacity="0.7" />
        {mood === "party" || mood === "wink" ? (
          <path d="M90 106 Q100 120 110 106 Z" fill="#1e1b2e" stroke="#1e1b2e" strokeWidth="3" strokeLinejoin="round" />
        ) : (
          <path d="M92 106 Q100 114 108 106" stroke="#1e1b2e" strokeWidth="4" strokeLinecap="round" fill="none" />
        )}

        {mood === "party" && (
          <g>
            <path d="M80 34 L100 -10 L120 34 Z" fill="#fee75c" />
            <path d="M86 22 L114 22 M92 8 L108 8" stroke="#eb459e" strokeWidth="5" strokeLinecap="round" />
            <circle cx="100" cy="-12" r="7" fill="#eb459e" stroke="#fff" strokeWidth="3" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function OctopusWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Octopus className="size-9" animated={false} mood="wink" />
      <span className="font-display text-xl font-black tracking-tight">octopus</span>
    </span>
  );
}

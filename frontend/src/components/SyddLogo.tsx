"use client";

import React, { useId } from "react";

type SyddLogoProps = {
  className?: string;
  size?: number;
};

export function SyddLogo({ className = "w-10 h-10", size = 40 }: SyddLogoProps) {
  const id = useId();
  // Sanitize useId string for valid SVG ID references
  const cleanId = id.replace(/:/g, "");
  const bgGlowId = `sydd-bg-${cleanId}`;
  const emeraldGlowId = `sydd-glow-${cleanId}`;
  const emeraldGradId = `sydd-grad-${cleanId}`;
  const borderGradId = `sydd-border-${cleanId}`;
  const glowBlurId = `sydd-blur-${cleanId}`;

  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SYDD Logo"
      role="img"
    >
      <defs>
        {/* Background Gradient */}
        <radialGradient id={bgGlowId} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#121824" />
          <stop offset="100%" stopColor="#08090d" />
        </radialGradient>

        {/* Emerald Glow */}
        <radialGradient id={emeraldGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>

        {/* Emerald Letter Gradient */}
        <linearGradient id={emeraldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Inner Border Glow */}
        <linearGradient id={borderGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
        </linearGradient>

        <filter id={glowBlurId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="30" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Base Dark Canvas */}
      <rect width="512" height="512" rx="112" fill={`url(#${bgGlowId})`} />

      {/* Outer Subtle Stroke */}
      <rect
        x="8"
        y="8"
        width="496"
        height="496"
        rx="104"
        fill="none"
        stroke={`url(#${borderGradId})`}
        strokeWidth="4"
      />

      {/* Ambient Glow Behind S */}
      <circle cx="256" cy="256" r="160" fill={`url(#${emeraldGlowId})`} filter={`url(#${glowBlurId})`} />

      {/* Inner Elevated Tile */}
      <rect
        x="76"
        y="76"
        width="360"
        height="360"
        rx="80"
        fill="#0d1117"
        stroke={`url(#${borderGradId})`}
        strokeWidth="3"
      />

      {/* Stylized Monogram S */}
      <path
        d="M336 188 C336 148 304 128 256 128 C204 128 172 152 172 192 C172 232 208 248 260 264 C316 280 344 300 344 340 C344 388 304 416 252 416 C192 416 156 384 156 336 L204 336 C204 360 224 376 252 376 C280 376 296 360 296 340 C296 316 272 304 224 288 C172 272 124 252 124 192 C124 144 164 88 256 88 C340 88 384 140 384 188 Z"
        fill={`url(#${emeraldGradId})`}
      />

      {/* Active Consistency Dot */}
      <circle cx="340" cy="380" r="14" fill="#34d399" />
    </svg>
  );
}

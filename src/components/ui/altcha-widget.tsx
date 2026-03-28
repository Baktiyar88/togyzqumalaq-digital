"use client";

import { useEffect, useRef } from "react";

interface AltchaWidgetProps {
  onVerify: (token: string) => void;
}

export function AltchaWidget({ onVerify }: AltchaWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ALTCHA self-hosted widget initialization
    // In production, configure challengeurl to your server endpoint
    if (!ref.current) return;

    const handleVerify = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.payload) onVerify(detail.payload);
    };

    ref.current.addEventListener("statechange", handleVerify);
    return () => ref.current?.removeEventListener("statechange", handleVerify);
  }, [onVerify]);

  return (
    <div ref={ref}>
      {/* ALTCHA widget renders here — placeholder for hackathon */}
      <input type="hidden" name="altcha" value="" />
    </div>
  );
}

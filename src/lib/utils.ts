import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUrl(url: string) {
  if (!url) return url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

// System join/leave chatter ("X joined the channel", "Y left the channel",
// "New member joined the channel") carries no academic signal and must never be
// ingested into the announcements table. Returns true for such noise.
export function isJoinLeaveMessage(content: string): boolean {
  const c = content.trim().toLowerCase();
  if (!c) return false;
  return (
    /(joined|left|was added to|was invited to|was removed from)\s+(the\s+)?channel/.test(c) ||
    /new member joined the channel/.test(c) ||
    /^<?@!?[\w\d]+>?\s+(joined|left|was added to|was invited to|was removed from)\b/.test(c)
  );
}

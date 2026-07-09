import "server-only";
import { isJoinLeaveMessage } from "@/lib/utils";

const DISCORD_API = "https://discord.com/api/v10";

export interface DiscordMessage {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  url: string;
}

// Discord's message object — only the fields we surface.
interface RawDiscordMessage {
  id: string;
  content?: string;
  timestamp?: string;
  author?: { username?: string };
  type?: number;
}

function normalizeMessage(raw: RawDiscordMessage, channelId: string): DiscordMessage {
  return {
    id: raw.id,
    content: raw.content ?? "",
    author: raw.author?.username ?? "",
    timestamp: raw.timestamp ?? "",
    url: `https://discord.com/channels/@me/${channelId}/${raw.id}`,
  };
}

// Discord system message types that are member join/leave chatter.
const DISCORD_SYSTEM_NOISE_TYPES = new Set([6, 7]);

async function discordGet(token: string, path: string): Promise<RawDiscordMessage[]> {
  const res = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: token },
  });

  if (!res.ok) {
    throw new Error(`Discord API error (${res.status}) for ${path}`);
  }

  return (await res.json()) as RawDiscordMessage[];
}

export async function fetchChannelMessages(
  token: string,
  channelId: string,
  limit = 50
): Promise<DiscordMessage[]> {
  const raw = await discordGet(token, `/channels/${channelId}/messages?limit=${limit}`);

  return raw
    .filter((m) => !m.type || !DISCORD_SYSTEM_NOISE_TYPES.has(m.type))
    .map((m) => normalizeMessage(m, channelId))
    .filter((m) => m.content.trim().length > 0)
    .filter((m) => !isJoinLeaveMessage(m.content));
}

export async function fetchPinnedMessages(
  token: string,
  channelId: string
): Promise<DiscordMessage[]> {
  const raw = await discordGet(token, `/channels/${channelId}/pins`);

  return raw
    .filter((m) => !m.type || !DISCORD_SYSTEM_NOISE_TYPES.has(m.type))
    .map((m) => normalizeMessage(m, channelId))
    .filter((m) => m.content.trim().length > 0)
    .filter((m) => !isJoinLeaveMessage(m.content));
}

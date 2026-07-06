import "server-only";

// Minimal Slack bot-token history fetch. SERVER ONLY — the bot token is a
// secret and must never reach the browser. Returns normalized shapes.

const SLACK_API = "https://slack.com/api";

export interface SlackMessage {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  url: string;
}

interface RawSlackMessage {
  ts: string;
  text?: string;
  user?: string;
  bot_id?: string;
  username?: string;
}

function normalizeMessage(raw: RawSlackMessage, channelId: string): SlackMessage {
  const tsId = raw.ts.replace(".", "");
  return {
    id: raw.ts,
    content: raw.text ?? "",
    author: raw.username || raw.bot_id || raw.user || "Slack User",
    timestamp: new Date(parseFloat(raw.ts) * 1000).toISOString(),
    url: `https://slack.com/archives/${channelId}/p${tsId}`,
  };
}

// Fetch channel history from conversations.history API
export async function fetchSlackMessages(
  token: string,
  channelId: string,
  limit = 50
): Promise<SlackMessage[]> {
  const params = new URLSearchParams({
    channel: channelId,
    limit: String(limit),
  });

  const res = await fetch(`${SLACK_API}/conversations.history?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!res.ok) {
    throw new Error(`Slack API HTTP error (${res.status})`);
  }

  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Slack API error: ${json.error || "unknown error"}`);
  }

  const messages = (json.messages ?? []) as RawSlackMessage[];

  return messages
    .map((m) => normalizeMessage(m, channelId))
    .filter((m) => m.content.trim().length > 0);
}

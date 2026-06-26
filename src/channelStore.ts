/**
 * Channel Store Module
 *
 * Manages persistent storage of welcome-channel mappings per server.
 * Data lives in a single JSON file at the project root.
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChannelEntry {
  channelId: string;
  locked: boolean;
}

/** Maps server ID -> channel configuration. */
type Store = Record<string, ChannelEntry>;

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const STORE_PATH = path.resolve(__dirname, "..", "welcome-channels.json");

// ---------------------------------------------------------------------------
// Disk I/O
// ---------------------------------------------------------------------------

/**
 * Load store from disk, migrating any old-format (plain string) entries.
 * Returns an empty store when the file is missing or unparseable.
 */
function load(): Store {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed: Record<string, unknown> = JSON.parse(raw);
    const migrated: Store = {};

    for (const [serverId, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        // Legacy: value was just the channel ID
        migrated[serverId] = { channelId: value, locked: false };
      } else if (
        value !== null &&
        typeof value === "object" &&
        "channelId" in value
      ) {
        const entry = value as Record<string, unknown>;
        migrated[serverId] = {
          channelId: String(entry.channelId),
          locked: Boolean(entry.locked),
        };
      }
      // Silently drop entries that don't match either format.
    }

    return migrated;
  } catch {
    return {};
  }
}

function save(data: Store): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

let store: Store = load();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getWelcomeChannel(serverId: string): string | undefined {
  return store[serverId]?.channelId;
}

export function isChannelLocked(serverId: string): boolean {
  return store[serverId]?.locked ?? false;
}

/**
 * Update the welcome channel entry for a server.
 * Skips the disk write when nothing actually changed (avoid churning the file
 * on every message in auto-track mode).
 */
export function setWelcomeChannel(
  serverId: string,
  channelId: string,
  locked = false,
): void {
  const current = store[serverId];
  if (
    current?.channelId !== channelId ||
    current?.locked !== locked
  ) {
    store[serverId] = { channelId, locked };
    save(store);
  }
}

/** Lock a channel permanently (called by /setwelcomechannel). */
export function lockWelcomeChannel(
  serverId: string,
  channelId: string,
): void {
  store[serverId] = { channelId, locked: true };
  save(store);
}

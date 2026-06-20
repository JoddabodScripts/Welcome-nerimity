/**
 * Channel Store Module
 * Manages persistent storage of welcome channel mappings per server
 * Data is stored in welcome-channels.json in the project root
 */

import * as fs from "fs";
import * as path from "path";

// Path to the JSON file that stores welcome channel mappings
// Located in project root (one level up from build/)
const STORE_PATH = path.resolve(__dirname, "..", "welcome-channels.json");

/**
 * Store structure: maps server IDs to channel configuration
 * Each server has a channel ID and a locked flag
 */
interface Store {
  [serverId: string]: {
    channelId: string;  // The channel ID where welcome messages are sent
    locked: boolean;    // Whether auto-tracking is disabled for this server
  };
}

/**
 * Load welcome channel data from disk
 * Handles migration from old format (string) to new format (object with locked flag)
 * @returns Store object, or empty object if file doesn't exist or is corrupted
 */
function load(): Store {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const data = JSON.parse(raw);
    // Migrate old format (string) to new format (object with locked flag)
    const migrated: Store = {};
    for (const [serverId, value] of Object.entries(data)) {
      if (typeof value === "string") {
        // Old format: just channel ID as string
        migrated[serverId] = { channelId: value, locked: false };
      } else {
        // New format: object with channelId and locked flag
        migrated[serverId] = value as { channelId: string; locked: boolean };
      }
    }
    return migrated;
  } catch {
    // File doesn't exist or is invalid JSON - return empty store
    return {};
  }
}

/**
 * Save welcome channel data to disk
 * @param data - Store object to persist
 */
function save(data: Store): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

// In-memory cache of the store, loaded on module initialization
let store: Store = load();

/**
 * Get the welcome channel ID for a specific server
 * @param serverId - The server ID to look up
 * @returns Channel ID if found, undefined otherwise
 */
export function getWelcomeChannel(serverId: string): string | undefined {
  return store[serverId]?.channelId;
}

/**
 * Check if a server's welcome channel is locked (auto-tracking disabled)
 * @param serverId - The server ID to check
 * @returns true if locked, false if not locked or server not found
 */
export function isChannelLocked(serverId: string): boolean {
  return store[serverId]?.locked ?? false;
}

/**
 * Set the welcome channel for a server
 * Only writes to disk if the channel ID or lock status actually changed
 * @param serverId - The server ID
 * @param channelId - The channel ID to set
 * @param locked - Whether to disable auto-tracking (default: false)
 */
export function setWelcomeChannel(serverId: string, channelId: string, locked = false): void {
  const current = store[serverId];
  // Only update if different or lock status changed (avoid unnecessary disk writes)
  if (!current || current.channelId !== channelId || current.locked !== locked) {
    store[serverId] = { channelId, locked };
    save(store);
  }
}

/**
 * Lock the welcome channel for a server (disables auto-tracking)
 * Used by the /setwelcomechannel command to permanently set a channel
 * @param serverId - The server ID
 * @param channelId - The channel ID to lock
 */
export function lockWelcomeChannel(serverId: string, channelId: string): void {
  store[serverId] = { channelId, locked: true };
  save(store);
}

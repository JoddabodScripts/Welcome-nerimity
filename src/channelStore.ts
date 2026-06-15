import * as fs from "fs";
import * as path from "path";

const STORE_PATH = path.resolve(__dirname, "..", "welcome-channels.json");

interface Store {
  [serverId: string]: {
    channelId: string;
    locked: boolean;
  };
}

function load(): Store {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const data = JSON.parse(raw);
    // Migrate old format (string) to new format (object with locked flag)
    const migrated: Store = {};
    for (const [serverId, value] of Object.entries(data)) {
      if (typeof value === "string") {
        migrated[serverId] = { channelId: value, locked: false };
      } else {
        migrated[serverId] = value as { channelId: string; locked: boolean };
      }
    }
    return migrated;
  } catch {
    return {};
  }
}

function save(data: Store): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

let store: Store = load();

export function getWelcomeChannel(serverId: string): string | undefined {
  return store[serverId]?.channelId;
}

export function isChannelLocked(serverId: string): boolean {
  return store[serverId]?.locked ?? false;
}

export function setWelcomeChannel(serverId: string, channelId: string, locked = false): void {
  const current = store[serverId];
  // Only update if different or lock status changed
  if (!current || current.channelId !== channelId || current.locked !== locked) {
    store[serverId] = { channelId, locked };
    save(store);
  }
}

export function lockWelcomeChannel(serverId: string, channelId: string): void {
  store[serverId] = { channelId, locked: true };
  save(store);
}

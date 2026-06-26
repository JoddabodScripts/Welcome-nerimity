

import { config } from "dotenv";
import { Client, Events, RolePermissions } from "@nerimity/nerimity.js";
import { buildWelcomeEmbed } from "./welcomeCard";
import {
  getWelcomeChannel,
  setWelcomeChannel,
  lockWelcomeChannel,
  isChannelLocked,
} from "./channelStore";

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

config();

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("BOT_TOKEN environment variable is required");
  process.exit(1);
}

const TEST_COMMAND = "cool!testing!testing!command";
const PRESENCE_INTERVAL_MS = 15_000;

const client = new Client();

// ---------------------------------------------------------------------------
// Activity presence rotation
// ---------------------------------------------------------------------------

let activityIndex = 0;

function buildActivityPresets(count: number) {
  const label = `${count} server${count !== 1 ? "s" : ""}`;
  return [
    {
      action: "Playing",
      name: "Welcomer Bot",
      startedAt: Date.now(),
      title: label,
      subtitle: "/setwelcomechannel",
    },
    {
      action: "Watching",
      name: "New Members Arrive",
      startedAt: Date.now(),
      title: "👋",
      subtitle: "Greetings!",
    },
  ];
}

function rotatePresence() {
  try {
    const count = client.servers?.cache?.size ?? 0;
    const activities = buildActivityPresets(count);
    const activity = activities[activityIndex % activities.length];
    activityIndex++;
    client.user?.setActivity(activity);
  } catch (e) {
    console.error("[presence] Update failed:", (e as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

client.on(Events.Ready, () => {
  console.log(`Welcomer bot connected as ${client.user?.username}`);

  client
    .updateCommands(TOKEN, [
      {
        name: "setwelcomechannel",
        description: "Set and lock welcome channel to this channel",
        args: "",
      },
    ])
    .catch((err) => console.error("[commands] Registration failed:", err));

  rotatePresence();
  setInterval(rotatePresence, PRESENCE_INTERVAL_MS);
});

client.on(Events.ServerJoined, (server) => {
  for (const [id, channel] of client.channels.cache) {
    if (channel.server?.id === server.id) {
      setWelcomeChannel(server.id, id);
      console.log(`[server] Welcome channel set for ${server.name} -> ${id}`);
      return;
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.user.id === client.user?.id) return;
  const server = message.channel?.server;

  // Test command -- button selector to verify welcome cards
  if (message.content?.trim() === TEST_COMMAND) {
    message.channel
      .send("Pick the right button to send a test welcome:", {
        buttons: [
          { id: "poopy", label: "poopy" },
          { id: "smooky", label: "smooky" },
          { id: "schlooki", label: "schlooki" },
        ],
      })
      .catch((err) => console.error("[test] Button send failed:", err));
    return;
  }

  // /setwelcomechannel -- admin-only permanent channel lock
  if (message.command?.name === "setwelcomechannel") {
    if (!server) {
      await message.reply("This command can only be used in a server.").catch(() => {});
      return;
    }

    const member = message.member;
    if (!member) {
      await message.reply("Unable to verify your permissions.").catch(() => {});
      return;
    }

    if (!member.hasPermission(RolePermissions.ADMIN)) {
      await message.reply("You need admin permissions to use this command.").catch(() => {});
      return;
    }

    lockWelcomeChannel(server.id, message.channelId);
    await message
      .reply("Welcome channel has been set to this channel and will no longer auto-update.")
      .catch(() => {});

    console.log(
      `[server] Channel locked for ${server.name} (${server.id}) -> ${message.channelId}`
    );
    return;
  }

  // Auto-track: keep welcome channel on the most recently active channel
  if (server && !isChannelLocked(server.id)) {
    setWelcomeChannel(server.id, message.channelId);
  }
});

client.on(Events.MessageButtonClick, (button) => {
  if (button.id === "smooky") {
    const server = button.channel?.server;
    const memberCount = server?.members?.cache?.size ?? 0;

    const html = buildWelcomeEmbed({
      avatarUrl: button.user?.avatar ?? "",
      username: button.user?.username ?? "Unknown",
      serverName: server?.name ?? "",
      memberCount,
    });

    button.channel
      .send(`Welcome [@:${button.userId}] (test)!`, { htmlEmbed: html })
      .catch((err) => console.error("[test] Welcome card send failed:", err));
  } else if (["poopy", "schlooki"].includes(button.id)) {
    button.respond({ content: "Wrong button! Try again." }).catch(() => {});
  }
});

client.on(Events.ServerMemberJoined, async (member) => {
  const server = member.server;
  if (!server) return;

  const channelId = getWelcomeChannel(server.id);
  if (!channelId) {
    console.log(`[welcome] No channel configured for ${server.name}, skipping`);
    return;
  }

  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error(`[welcome] Channel ${channelId} not found in cache for ${server.name}`);
    return;
  }

  console.log(`[welcome] ${member.user.username} joined ${server.name}`);

  const memberCount = server.members?.cache?.size ?? 0;
  const html = buildWelcomeEmbed({
    avatarUrl: member.user.avatar ?? "",
    username: member.user.username,
    serverName: server.name,
    memberCount,
  });

  try {
    await channel.send(`Welcome [@:${member.user.id}]!`, { htmlEmbed: html });
    console.log(`[welcome] Sent for ${member.user.username} in ${server.name}`);
  } catch (err) {
    console.error("[welcome] Failed to send:", err);
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

client.login(TOKEN);

import { config } from "dotenv";
import { Client, Events, RolePermissions } from "@nerimity/nerimity.js";
import { buildWelcomeEmbed } from "./welcomeCard";
import { getWelcomeChannel, setWelcomeChannel, lockWelcomeChannel, isChannelLocked } from "./channelStore";

// Load environment variables from .env file
config();

// Bot token from environment - required for authentication
const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.error("BOT_TOKEN environment variable is required");
  process.exit(1);
}

// Initialize the Nerimity client
const client = new Client();

let activityIndex = 0;
function updatePresence(client: Client) {
  try {
    const serverCount = client.servers?.cache?.size ?? 0;
    const serverLabel = `${serverCount} server${serverCount !== 1 ? "s" : ""}`;
    const activities = [
      {
        action: "Playing",
        name: "Welcomer Bot",
        startedAt: Date.now(),
        title: serverLabel,
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
    const activity = activities[activityIndex % activities.length];
    activityIndex += 1;
    client.user?.setActivity(activity);
  } catch (e) {
    console.error("[bot] Failed to update presence:", (e as Error).message);
  }
}

/**
 * Bot ready event - fires when client successfully connects
 */
client.on(Events.Ready, () => {
  console.log(`Welcomer bot connected as ${client.user?.username}`);
  updatePresence(client);
  setInterval(() => updatePresence(client), 15000);
});

/**
 * Server joined event - auto-set welcome channel when bot joins a new server
 * Picks the first available channel in the server as the default
 */
client.on(Events.ServerJoined, (server) => {
  for (const [id, channel] of client.channels.cache) {
    if (channel.server?.id === server.id) {
      setWelcomeChannel(server.id, id);
      console.log(`Auto-set welcome channel for server ${server.name} to ${id}`);
      return;
    }
  }
});

/**
 * Message create event - handles multiple functions:
 * 1. Updates welcome channel to most recently active channel (unless locked)
 * 2. Processes test command for manual testing
 * 3. Handles /setwelcomechannel command to lock a specific channel
 */
client.on(Events.MessageCreate, (message) => {
  // Ignore messages from the bot itself
  if (message.user.id === client.user?.id) return;
  const server = message.channel?.server;

  // Test command — send buttons to verify before sending test welcome
  if (message.content?.trim() === "cool!testing!testing!command") {
    message.channel.send("Pick the right button to send a test welcome:", {
      buttons: [
        { id: "poopy", label: "poopy" },
        { id: "smooky", label: "smooky" },
        { id: "schlooki", label: "schlooki" },
      ],
    }).catch(console.error);
    return;
  }

  // Handle /setwelcomechannel command - allows admins to lock welcome channel
  if (message.command && message.command.name === "setwelcomechannel") {
    if (!server) {
      message.reply("This command can only be used in a server.").catch(console.error);
      return;
    }

    // Check if user has admin permissions
    const member = message.member;
    if (!member) {
      message.reply("Unable to verify your permissions.").catch(console.error);
      return;
    }

    const hasAdmin = member.hasPermission(RolePermissions.ADMIN);
    if (!hasAdmin) {
      message.reply("You need admin permissions to use this command.").catch(console.error);
      return;
    }

    // Lock the welcome channel to this channel (disables auto-tracking)
    lockWelcomeChannel(server.id, message.channelId);
    message.reply(`Welcome channel has been set to this channel and will no longer auto-update.`).catch(console.error);
    console.log(`Welcome channel locked for server ${server.name} (${server.id}) to channel ${message.channelId}`);
    return;
  }

  // Auto-update welcome channel to most recently active channel (unless locked)
  // This allows the bot to follow server activity naturally
  if (server && !isChannelLocked(server.id)) {
    setWelcomeChannel(server.id, message.channelId);
  }
});

/**
 * Handle button clicks for the test command
 * Only the "smooky" button sends a test welcome card
 */
client.on(Events.MessageButtonClick, (button) => {
  if (button.id === "smooky") {
    // Correct button - send test welcome card
    const server = button.channel?.server;
    const memberCount = server?.members?.cache?.size ?? 0;
    const html = buildWelcomeEmbed({
      avatarUrl: button.user?.avatar ?? "",
      username: button.user?.username ?? "Unknown",
      serverName: server?.name ?? "",
      memberCount: memberCount,
    });
    button.channel.send(`Welcome [@:${button.userId}] (test)!`, { htmlEmbed: html }).catch(console.error);
  } else if (button.id === "poopy" || button.id === "schlooki") {
    // Wrong button - show error message
    button.respond({ content: "Wrong button! Try again." }).catch(console.error);
  }
});

/**
 * Handle new member joins - send welcome card to tracked channel
 * This is the main event that triggers when someone joins the server
 */
client.on(Events.ServerMemberJoined, async (member) => {
  const server = member.server;
  if (!server) return;

  // Get the stored welcome channel for this server
  const channelId = getWelcomeChannel(server.id);
  if (!channelId) {
    console.log(`No tracked channel for server ${server.name}, skipping welcome`);
    return;
  }

  // Retrieve the channel from cache
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error(`Tracked channel ${channelId} not found in cache for server ${server.name}`);
    return;
  }

  console.log(`Member joined: ${member.user.username} in server ${server.name}`);

  // Get total member count from the server's member cache
  // This represents how many members are currently in the server
  const memberCount = server.members?.cache?.size ?? 0;

  // Build the HTML welcome card with user info and member count
  const html = buildWelcomeEmbed({
    avatarUrl: member.user.avatar ?? "",
    username: member.user.username,
    serverName: server.name,
    memberCount: memberCount,
  });

  // Send the welcome message with user mention and HTML embed
  try {
    await channel.send(`Welcome [@:${member.user.id}]!`, { htmlEmbed: html });
    console.log(`Welcome message sent for ${member.user.username} in ${server.name}`);
  } catch (err) {
    console.error("Failed to send welcome message:", err);
  }
});

client.login(TOKEN);

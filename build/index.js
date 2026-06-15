"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const nerimity_js_1 = require("@nerimity/nerimity.js");
const welcomeCard_1 = require("./welcomeCard");
const channelStore_1 = require("./channelStore");
// Load environment variables from .env file
(0, dotenv_1.config)();
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
    console.error("BOT_TOKEN environment variable is required");
    process.exit(1);
}
const client = new nerimity_js_1.Client();
client.on(nerimity_js_1.Events.Ready, () => {
    console.log(`bot connected as ${client.user?.username}`);
});
// When the bot joins a new server, auto-set the welcome channel to first channel
client.on(nerimity_js_1.Events.ServerJoined, (server) => {
    for (const [id, channel] of client.channels.cache) {
        if (channel.server?.id === server.id) {
            (0, channelStore_1.setWelcomeChannel)(server.id, id);
            console.log(`Auto-set welcome channel for server ${server.name} to ${id}`);
            return;
        }
    }
});
// Track the last channel a message was sent in, per server
client.on(nerimity_js_1.Events.MessageCreate, (message) => {
    if (message.user.id === client.user?.id)
        return;
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
    // Handle /setwelcomechannel command
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
        const hasAdmin = member.hasPermission(nerimity_js_1.RolePermissions.ADMIN);
        if (!hasAdmin) {
            message.reply("You need admin permissions to use this command.").catch(console.error);
            return;
        }
        // Lock the welcome channel to this channel
        (0, channelStore_1.lockWelcomeChannel)(server.id, message.channelId);
        message.reply(`Welcome channel has been set to this channel and will no longer auto-update.`).catch(console.error);
        console.log(`Welcome channel locked for server ${server.name} (${server.id}) to channel ${message.channelId}`);
        return;
    }
    // Auto-update welcome channel only if not locked
    if (server && !(0, channelStore_1.isChannelLocked)(server.id)) {
        (0, channelStore_1.setWelcomeChannel)(server.id, message.channelId);
    }
});
// Handle button clicks for the test command
client.on(nerimity_js_1.Events.MessageButtonClick, (button) => {
    if (button.id === "smooky") {
        const server = button.channel?.server;
        const html = (0, welcomeCard_1.buildWelcomeEmbed)({
            avatarUrl: button.user?.avatar ?? "",
            username: button.user?.username ?? "Unknown",
            serverName: server?.name ?? "",
        });
        button.channel.send(`Welcome [@:${button.userId}] (test)!`, { htmlEmbed: html }).catch(console.error);
    }
    else if (button.id === "poopy" || button.id === "schlooki") {
        button.respond({ content: "Wrong button! Try again." }).catch(console.error);
    }
});
client.on(nerimity_js_1.Events.ServerMemberJoined, async (member) => {
    const server = member.server;
    if (!server)
        return;
    const channelId = (0, channelStore_1.getWelcomeChannel)(server.id);
    if (!channelId) {
        console.log(`No tracked channel for server ${server.name}, skipping welcome`);
        return;
    }
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error(`Tracked channel ${channelId} not found in cache for server ${server.name}`);
        return;
    }
    console.log(`Member joined: ${member.user.username} in server ${server.name}`);
    const html = (0, welcomeCard_1.buildWelcomeEmbed)({
        avatarUrl: member.user.avatar ?? "",
        username: member.user.username,
        serverName: server.name,
    });
    try {
        await channel.send(`Welcome [@:${member.user.id}]!`, { htmlEmbed: html });
        console.log(`Welcome message sent for ${member.user.username} in ${server.name}`);
    }
    catch (err) {
        console.error("Failed to send welcome message:", err);
    }
});
client.login(TOKEN);
//# sourceMappingURL=index.js.map

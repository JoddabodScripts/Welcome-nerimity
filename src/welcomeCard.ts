/**
 * Options for building a welcome embed card
 */
export interface WelcomeEmbedOptions {
  /** Relative path to user's avatar (will be prepended with CDN URL) */
  avatarUrl: string;
  /** Username of the new member */
  username: string;
  /** Name of the server they joined */
  serverName: string;
  /** Optional member count to display "Member #X" badge */
  memberCount?: number;
}

/** Background image URL for the welcome card */
const BG_IMAGE =
  "https://png.pngtree.com/thumb_back/fh260/background/20250401/pngtree-amazing-blue-and-purple-galaxy-background-with-stars-in-the-night-image_17161504.jpg";

/**
 * Escapes HTML special characters to prevent tag injection
 * CRITICAL: Nerimity's HTML validator counts tags via regex - unescaped < or > 
 * in usernames/server names will break tag validation
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Builds an HTML welcome card embed with user info and server details
 * @param opts - Welcome card configuration options
 * @returns HTML string with inline CSS for the welcome card
 */
export function buildWelcomeEmbed(opts: WelcomeEmbedOptions): string {
  // Construct full avatar URL from Nerimity CDN
  const avatarSrc = opts.avatarUrl
    ? `https://cdn.nerimity.com/${opts.avatarUrl}`
    : "";

  // Remove pipe character from server name to avoid display conflicts
  const sname = opts.serverName.replace("|", "");
  // Build display name with username and server name (both HTML-escaped)
  const displayName = `${escapeHtml(opts.username)} | 💖 ${escapeHtml(sname)}`;
  
  // Only show member count badge if memberCount is provided
  const memberBadge = opts.memberCount 
    ? `<div class="member-badge">👤 Member #${opts.memberCount}</div>` 
    : '';

  return `
<style>
.embedmain {
  width: 100%;
  max-width: 500px;
  margin: 0;
  padding: 0;
  position: relative;
}

.bgimage {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(4px) brightness(0.4);
}

.text {
  position: relative;
  color: white;
  font-family: Arial, sans-serif;
  padding: 60px 22px 50px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-img {
  width: 130px;
  height: 130px;
  border-radius: 50%;
}

.uname {
  font-size: 26px;
  font-weight: bold;
  margin-top: 10px;
  text-align: center;
}

.message {
  font-size: 16px;
  text-align: center;
  margin-top: 40px;
}

.member-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 15px;
  color: #fff;
  backdrop-filter: blur(10px);
}
</style>
<div class="embedmain"><img class="bgimage" src="${BG_IMAGE}" /><div class="text"><div class="top-section"><img class="avatar-img" src="${avatarSrc}" /><div class="uname">${displayName}</div>${memberBadge}</div><div class="message">Welcome to the server!</div></div></div>
`.trim();
}

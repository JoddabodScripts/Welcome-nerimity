/**
 * Welcome Card
 *
 * Builds an HTML-embed welcome card for the Nerimity chat platform.
 *
 * CRITICAL: All user-provided strings (username, server name) must be
 * HTML-escaped.  Nerimity's server-side HTML validator counts opening tags
 * via regex; an unescaped `<` in a display name will break validation.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WelcomeEmbedOptions {
  /** Relative path to user's avatar (prepended with CDN URL). */
  avatarUrl: string;
  /** Username of the new member. */
  username: string;
  /** Name of the server they joined. */
  serverName: string;
  /** Optional member count -- displays a "Member #X" badge. */
  memberCount?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CDN_BASE = "https://cdn.nerimity.com";
const BG_IMAGE =
  "https://png.pngtree.com/thumb_back/fh260/background/20250401/" +
  "pngtree-amazing-blue-and-purple-galaxy-background-with-stars-in-the-night-image_17161504.jpg";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

/**
 * Build the full HTML embed string for a welcome card.
 *
 * The card shows:
 *  - A blurred space/galaxy background
 *  - The user's avatar (circular crop)
 *  - The username and server name
 *  - An optional "Member #N" badge
 *  - A "Welcome to the server!" message
 */
export function buildWelcomeEmbed(opts: WelcomeEmbedOptions): string {
  const avatarSrc = opts.avatarUrl
    ? `${CDN_BASE}/${opts.avatarUrl}`
    : "";
  const safeName = `${escapeHtml(opts.username)} | 💖 ${escapeHtml(opts.serverName.replace("|", ""))}`;
  const badgeHtml = opts.memberCount
    ? `<div class="member-badge">👤 Member #${opts.memberCount}</div>`
    : "";

  const html = `<style>
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
      <div class="embedmain">
        <img class="bgimage" src="${BG_IMAGE}" />
        <div class="text">
          <div class="top-section">
            <img class="avatar-img" src="${avatarSrc}" />
            <div class="uname">${safeName}</div>
            ${badgeHtml}
          </div>
          <div class="message">Welcome to the server!</div>
        </div>
      </div>`;

  return html.trim();
}

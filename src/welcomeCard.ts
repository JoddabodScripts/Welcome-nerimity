export interface WelcomeEmbedOptions {
  avatarUrl: string;
  username: string;
  serverName: string;
}

const BG_IMAGE =
  "https://png.pngtree.com/thumb_back/fh260/background/20250401/pngtree-amazing-blue-and-purple-galaxy-background-with-stars-in-the-night-image_17161504.jpg";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildWelcomeEmbed(opts: WelcomeEmbedOptions): string {
  const avatarSrc = opts.avatarUrl
    ? `https://cdn.nerimity.com/${opts.avatarUrl}`
    : "";

  const sname = opts.serverName.replace("|", "");
  const displayName = `${escapeHtml(opts.username)} | 💖 ${escapeHtml(sname)}`;

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
</style>
<div class="embedmain"><img class="bgimage" src="${BG_IMAGE}" /><div class="text"><div class="top-section"><img class="avatar-img" src="${avatarSrc}" /><div class="uname">${displayName}</div></div><div class="message">Welcome to the server!</div></div></div>
`.trim();
}

/**
 * Revisa si los videos del canal se pueden insertar en un sitio externo.
 * Uso: node scripts/check-embed.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

async function call(pathname, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${pathname}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", env.YOUTUBE_API_KEY);

  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    console.log(`ERROR ${res.status}:`, body?.error?.message);
    process.exit(1);
  }
  return body;
}

(async () => {
  const channel = await call("channels", {
    part: "contentDetails",
    id: env.YOUTUBE_CHANNEL_ID,
  });

  const playlist = channel.items[0].contentDetails.relatedPlaylists.uploads;
  const items = await call("playlistItems", {
    part: "contentDetails",
    playlistId: playlist,
    maxResults: "50",
  });

  const ids = items.items.map((i) => i.contentDetails.videoId);
  const videos = await call("videos", {
    part: "snippet,status,contentDetails,player",
    id: ids.join(","),
  });

  for (const v of videos.items) {
    console.log("=".repeat(56));
    console.log("titulo     :", v.snippet.title);
    console.log("id         :", v.id);
    console.log("privacidad :", v.status.privacyStatus);
    console.log("insertable :", v.status.embeddable ? "SI" : "NO  <-- no se puede reproducir fuera de YouTube");
    console.log("duracion   :", v.contentDetails.duration);
    console.log("licencia   :", v.status.license);
    console.log("para ninos :", v.status.madeForKids ? "si" : "no");
    if (v.contentDetails.regionRestriction) {
      console.log("region     :", JSON.stringify(v.contentDetails.regionRestriction));
    }
  }
})();

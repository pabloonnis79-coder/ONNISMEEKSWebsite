/**
 * Resuelve el canal configurado y lista sus ultimos videos.
 * Uso: node scripts/channel-info.cjs
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
    console.log(`ERROR ${res.status}:`, body?.error?.message ?? JSON.stringify(body));
    process.exit(1);
  }
  return body;
}

(async () => {
  const handle = env.YOUTUBE_CHANNEL_HANDLE;
  const channelId = env.YOUTUBE_CHANNEL_ID;

  const params = { part: "snippet,statistics,contentDetails" };
  if (channelId) params.id = channelId;
  else params.forHandle = handle.startsWith("@") ? handle : `@${handle}`;

  const data = await call("channels", params);
  const channel = data.items?.[0];

  if (!channel) {
    console.log("No se encontro el canal con", channelId || handle);
    return;
  }

  console.log("Canal   :", channel.snippet.title);
  console.log("Handle  :", channel.snippet.customUrl ?? "(sin handle)");
  console.log("ID      :", channel.id);
  console.log("Videos  :", channel.statistics?.videoCount ?? "?");
  console.log("Creado  :", channel.snippet.publishedAt?.slice(0, 10));
  console.log("Uploads :", channel.contentDetails.relatedPlaylists.uploads);

  const playlist = channel.contentDetails.relatedPlaylists.uploads;
  const items = await call("playlistItems", {
    part: "contentDetails,snippet",
    playlistId: playlist,
    maxResults: "10",
  });

  console.log("\nUltimos videos:");
  if ((items.items ?? []).length === 0) {
    console.log("  (el canal no tiene videos publicos)");
    return;
  }

  for (const item of items.items) {
    const desc = (item.snippet.description ?? "").trim();
    const estructurada = /^\s*(CLIENTE|PROYECTO|A(N|Ñ)O|SERVICIOS)\s*:/im.test(desc);
    console.log(
      `  ${item.contentDetails.videoId}  ${item.snippet.publishedAt.slice(0, 10)}  ` +
        `${estructurada ? "[con formato]" : "[sin formato]"}  ${item.snippet.title}`,
    );
  }
})();

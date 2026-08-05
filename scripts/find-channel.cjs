/**
 * Busca el canal de YouTube por nombre y muestra los candidatos.
 * Uso: node scripts/find-channel.cjs "onnis meeks"
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

const key = env.YOUTUBE_API_KEY;
const query = process.argv[2] ?? "onnis meeks";

async function call(pathname, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${pathname}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", key);

  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    console.log(`ERROR ${res.status}:`, body?.error?.message ?? JSON.stringify(body));
    process.exit(1);
  }
  return body;
}

(async () => {
  const found = await call("search", {
    part: "snippet",
    type: "channel",
    maxResults: "5",
    q: query,
  });

  const ids = (found.items ?? []).map((i) => i.snippet.channelId ?? i.id.channelId);
  if (ids.length === 0) {
    console.log(`Sin resultados para "${query}"`);
    return;
  }

  const detail = await call("channels", {
    part: "snippet,statistics,contentDetails",
    id: ids.join(","),
  });

  for (const c of detail.items ?? []) {
    console.log("-".repeat(60));
    console.log("Nombre  :", c.snippet.title);
    console.log("Handle  :", c.snippet.customUrl ?? "(sin handle)");
    console.log("ID      :", c.id);
    console.log("Videos  :", c.statistics?.videoCount ?? "?");
    console.log("Subs    :", c.statistics?.subscriberCount ?? "oculto");
    console.log("Pais    :", c.snippet.country ?? "?");
    console.log("Uploads :", c.contentDetails?.relatedPlaylists?.uploads);
  }
})();

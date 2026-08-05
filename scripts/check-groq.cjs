/**
 * Verifica que la key de Groq responda y que el modelo configurado exista.
 * Uso: node scripts/check-groq.cjs
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

const modelo = env.GROQ_MODEL || "llama-3.3-70b-versatile";

(async () => {
  const list = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` },
  });

  if (!list.ok) {
    console.log(`ERROR ${list.status}:`, (await list.text()).slice(0, 300));
    process.exit(1);
  }

  const { data } = await list.json();
  const ids = data.map((m) => m.id);
  console.log("key valida, modelos disponibles:", ids.length);
  console.log(`modelo configurado: ${modelo} -> ${ids.includes(modelo) ? "OK" : "NO EXISTE"}`);

  if (!ids.includes(modelo)) {
    console.log("\nAlternativas:");
    for (const id of ids.filter((i) => /llama|gpt-oss|qwen/i.test(i)).slice(0, 10)) {
      console.log("  -", id);
    }
    return;
  }

  const chat = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: 60,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Respondes solo con JSON valido." },
        { role: "user", content: 'Devolve {"ok": true, "idioma": "es"} y nada mas.' },
      ],
    }),
  });

  const body = await chat.json();
  if (!chat.ok) {
    console.log(`ERROR en chat ${chat.status}:`, JSON.stringify(body).slice(0, 300));
    process.exit(1);
  }

  console.log("prueba de generacion:", body.choices?.[0]?.message?.content?.trim());
})();

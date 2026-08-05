/**
 * Verifica los usuarios del panel y si el registro publico quedo cerrado.
 * Uso: node scripts/check-auth.cjs
 */
const { createClient } = require("@supabase/supabase-js");
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

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

(async () => {
  const { data, error } = await db.auth.admin.listUsers();

  if (error) {
    console.log("ERROR:", error.message);
    process.exit(1);
  }

  console.log("usuarios:", data.users.length);
  for (const u of data.users) {
    console.log(
      ` - ${u.email}` +
        `  confirmado: ${u.email_confirmed_at ? "si" : "NO"}` +
        `  creado: ${u.created_at.slice(0, 10)}` +
        `  ultimo acceso: ${u.last_sign_in_at ? u.last_sign_in_at.slice(0, 16) : "nunca"}`,
    );
  }

  // Si el alta publica sigue abierta, este intento devuelve algo distinto de
  // "signups not allowed".
  const anon = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const probe = await anon.auth.signUp({
    email: `probe-${Date.now()}@example.invalid`,
    password: `probe-${Math.random().toString(36).slice(2)}-Aa1!`,
  });

  const msg = probe.error?.message ?? "";
  const cerrado = /not allowed|disabled|signups/i.test(msg);
  console.log(
    `\nregistro publico: ${cerrado ? "CERRADO (bien)" : "ABIERTO (hay que apagarlo)"}` +
      (msg ? `  [${msg}]` : ""),
  );
})();

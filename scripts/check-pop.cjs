/**
 * Prueba si el POP3 de Zoho acepta la cuenta. Solo se conecta, se autentica y
 * pregunta cuantos mensajes hay. No baja, no borra ni modifica nada.
 *
 *   node scripts/check-pop.cjs
 */
const tls = require("node:tls");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const HOST = process.env.POP_HOST || "pop.zoho.com";
const USER = env.SMTP_USER;
const PASS = env.SMTP_PASS;

if (!USER || !PASS) { console.log("Faltan credenciales en .env.local"); process.exit(1); }
console.log(`servidor : ${HOST}:995`);
console.log(`cuenta   : ${USER}\n`);

const pasos = [`USER ${USER}`, `PASS ${PASS}`, "STAT", "QUIT"];
let i = -1;

const socket = tls.connect({ host: HOST, port: 995, servername: HOST }, () => {});
socket.setEncoding("utf8");
socket.setTimeout(20000);

socket.on("data", (linea) => {
  const texto = linea.trim();
  // No imprimimos el comando PASS, obviamente.
  const etiqueta = i < 0 ? "saludo" : pasos[i].startsWith("PASS") ? "PASS" : pasos[i];
  console.log(`${etiqueta.padEnd(10)} -> ${texto}`);

  if (texto.startsWith("-ERR")) {
    console.log("\nPOP3 RECHAZADO.");
    socket.end();
    return;
  }

  i += 1;
  if (i >= pasos.length) { socket.end(); return; }
  socket.write(pasos[i] + "\r\n");
});

socket.on("timeout", () => { console.log("Sin respuesta a tiempo."); socket.destroy(); });
socket.on("error", (e) => console.log("ERROR:", e.message));

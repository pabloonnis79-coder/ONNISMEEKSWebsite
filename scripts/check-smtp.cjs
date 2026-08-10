/**
 * Prueba el SMTP de Zoho con las variables de .env.local.
 *
 *   node scripts/check-smtp.cjs           -> solo verifica la conexion y el login
 *   node scripts/check-smtp.cjs --enviar  -> ademas manda un correo de prueba
 *
 * La primera forma no manda nada: abre la conexion, se autentica y corta. Es
 * suficiente para saber si el plan gratuito de Zoho habilita SMTP.
 */
const nodemailer = require("nodemailer");
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

const HOST = env.SMTP_HOST || "smtp.zoho.com";
const PORT = Number(env.SMTP_PORT || 465);
const USER = env.SMTP_USER;
const PASS = env.SMTP_PASS;
const FROM = env.SMTP_FROM || USER;
const TO = env.CONTACT_INBOX || USER;

if (!USER || !PASS) {
  console.log("Faltan SMTP_USER o SMTP_PASS en .env.local. Nada que probar.");
  process.exit(1);
}

console.log(`servidor : ${HOST}:${PORT}`);
console.log(`cuenta   : ${USER}`);
console.log(`clave    : ${PASS.length} caracteres`);
console.log(`de       : ${FROM}`);
console.log(`para     : ${TO}`);
console.log("");

const transporte = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: PORT === 465,
  auth: { user: USER, pass: PASS },
  requireTLS: true,
  logger: false,
});

(async () => {
  try {
    await transporte.verify();
    console.log("LOGIN OK -> el plan habilita SMTP y la clave sirve.");
  } catch (error) {
    console.log("FALLO:", error.message);
    if (/535|auth/i.test(error.message)) {
      console.log(
        "  Suele ser: clave de aplicacion mal copiada, cuenta equivocada,\n" +
          "  o que el plan no habilita SMTP.",
      );
    }
    if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED/i.test(error.message)) {
      console.log(
        "  No se llego al servidor. Puede ser la region: probar\n" +
          "  smtp.zoho.eu, smtp.zoho.in o smtp.zohocloud.ca en SMTP_HOST.",
      );
    }
    process.exit(1);
  }

  if (!process.argv.includes("--enviar")) {
    console.log("\n(No mande ningun correo. Agregar --enviar para probar el envio.)");
    return;
  }

  const info = await transporte.sendMail({
    from: `ONNIS & MEEKS <${FROM}>`,
    to: TO,
    subject: "Prueba del formulario de contacto",
    text:
      "Si estas leyendo esto, el formulario de la web ya avisa por correo.\n" +
      "Las consultas van a llegar aca y tambien quedan en /admin/mensajes.",
  });

  console.log("\nENVIADO ->", info.messageId);
  if (info.rejected?.length) console.log("rechazados:", info.rejected);
})();

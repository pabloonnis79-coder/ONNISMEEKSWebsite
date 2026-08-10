import "server-only";
import nodemailer from "nodemailer";
import { site } from "@/lib/site";

/**
 * Aviso por correo de cada consulta del formulario.
 *
 * Sale por el SMTP de Zoho, la misma casilla corporativa que ya está andando.
 * Así el aviso llega desde info@onnismeeks.com y no hace falta contratar ni
 * verificar nada más.
 *
 * Todo esto es opcional a propósito. Si faltan las variables, el sitio sigue
 * funcionando igual: el mensaje ya quedó guardado en la base y se lee desde
 * /admin/mensajes. El correo es el aviso, no el registro.
 *
 * La clave NO es la contraseña de Zoho: es una contraseña de aplicación, que se
 * genera en accounts.zoho.com → Seguridad → Contraseñas de aplicación y se
 * puede revocar sola sin tocar la cuenta.
 */

/** Servidor de Zoho. Cambia según la región donde se creó la cuenta. */
const HOST = process.env.SMTP_HOST ?? "smtp.zoho.com";
const PORT = Number(process.env.SMTP_PORT ?? 465);

/** La casilla que se autentica. Tiene que ser la cuenta real, no un alias. */
const USER = process.env.SMTP_USER ?? "";
const PASS = process.env.SMTP_PASS ?? "";

/**
 * Remitente. Zoho solo acepta la propia cuenta o uno de sus alias: si acá va
 * una dirección ajena, el servidor contesta "Relaying not allowed".
 */
const FROM = process.env.SMTP_FROM ?? site.contact.email;

/** Destino de las consultas. */
const TO = process.env.CONTACT_INBOX ?? site.contact.email;

export type ConsultaEmail = {
  name: string;
  email: string;
  company?: string | null;
  budget?: string | null;
  message: string;
};

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function cuerpoHtml(c: ConsultaEmail): string {
  const filas = [
    ["Nombre", c.name],
    ["Correo", c.email],
    ["Empresa", c.company || "—"],
    ["Presupuesto", c.budget || "—"],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#8a8a8a;font-size:13px">${k}</td><td style="padding:6px 0;font-size:14px;color:#111">${escapar(String(v))}</td></tr>`,
    )
    .join("");

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a8a">Consulta desde el sitio</p>
  <h1 style="margin:0 0 20px;font-size:22px;color:#111">${escapar(c.name)}</h1>
  <table style="border-collapse:collapse;margin-bottom:20px">${filas}</table>
  <div style="border-left:3px solid #e0e0e0;padding-left:16px;font-size:15px;line-height:1.6;color:#111;white-space:pre-wrap">${escapar(c.message)}</div>
  <p style="margin-top:28px;font-size:12px;color:#8a8a8a">
    Respondé este correo y le llega directo a quien escribió. La consulta también
    queda en <a href="${site.url}/admin/mensajes" style="color:#8a8a8a">el panel</a>.
  </p>
</div>`;
}

export function cuerpoTexto(c: ConsultaEmail): string {
  return [
    `Consulta desde el sitio`,
    ``,
    `Nombre: ${c.name}`,
    `Correo: ${c.email}`,
    `Empresa: ${c.company || "—"}`,
    `Presupuesto: ${c.budget || "—"}`,
    ``,
    c.message,
    ``,
    `Ver en el panel: ${site.url}/admin/mensajes`,
  ].join("\n");
}

/**
 * El transporte se arma una sola vez y se reusa entre invocaciones: abrir una
 * conexión TLS nueva por cada consulta es caro y Zoho lo penaliza.
 */
let transporte: nodemailer.Transporter | null = null;

function obtenerTransporte() {
  if (!USER || !PASS) return null;

  transporte ??= nodemailer.createTransport({
    host: HOST,
    port: PORT,
    // 465 es TLS directo; 587 arranca en claro y sube con STARTTLS.
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
    requireTLS: true,
  });

  return transporte;
}

/**
 * Devuelve true si el aviso salió. Nunca lanza: que falle el correo no puede
 * romperle el formulario a quien nos está escribiendo.
 */
export async function avisarConsulta(c: ConsultaEmail): Promise<boolean> {
  const mailer = obtenerTransporte();
  if (!mailer) return false;

  try {
    await mailer.sendMail({
      from: `${site.name} <${FROM}>`,
      to: TO,
      // Así "Responder" en el cliente de correo le contesta a la persona.
      replyTo: `${c.name} <${c.email}>`,
      subject: `Consulta web — ${c.name}${c.company ? ` (${c.company})` : ""}`,
      text: cuerpoTexto(c),
      html: cuerpoHtml(c),
    });

    return true;
  } catch (error) {
    console.error("[email]", error);
    return false;
  }
}

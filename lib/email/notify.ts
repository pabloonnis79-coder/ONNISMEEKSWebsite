import "server-only";
import { site } from "@/lib/site";

/**
 * Aviso por correo de cada consulta del formulario.
 *
 * Se manda con Resend por HTTP, sin librería: es una sola llamada y así no
 * sumamos una dependencia más al bundle del servidor.
 *
 * Todo esto es opcional a propósito. Si no hay RESEND_API_KEY el sitio sigue
 * andando igual: el mensaje ya quedó guardado en la base y se lee desde
 * /admin/mensajes. El correo es el aviso, no el registro.
 */

const API = "https://api.resend.com/emails";

/** Remitente. Va en un subdominio propio para no tocar el DKIM de Zoho. */
const FROM = process.env.RESEND_FROM ?? "ONNIS & MEEKS <web@send.onnismeeks.com>";

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

function cuerpoHtml(c: ConsultaEmail): string {
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
    Respondé este correo y le llega directo. También queda en
    <a href="${site.url}/admin/mensajes" style="color:#8a8a8a">el panel</a>.
  </p>
</div>`;
}

/**
 * Devuelve true si el aviso salió. Nunca lanza: que falle el correo no puede
 * romperle el formulario a quien nos está escribiendo.
 */
export async function avisarConsulta(c: ConsultaEmail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        // Así "Responder" en el cliente de correo le contesta a la persona.
        reply_to: c.email,
        subject: `Consulta web — ${c.name}${c.company ? ` (${c.company})` : ""}`,
        html: cuerpoHtml(c),
      }),
    });

    if (!res.ok) {
      console.error("[email] resend respondió", res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[email]", error);
    return false;
  }
}

import { site } from "@/lib/site";

/**
 * Arma la firma de correo de una persona del estudio.
 *
 * Sale HTML de tabla con estilos en linea, que suena viejo y lo es: Outlook
 * sigue sin entender flexbox ni hojas de estilo externas, y descarta casi todo
 * lo que no este escrito asi. Una firma "moderna" se desarma en la mitad de
 * las bandejas del mundo.
 */

export type DatosFirma = {
  nombre: string;
  apellido: string;
  cargo: string;
  email: string;
  foto?: string;
};

const NARANJA = "#f26a1b";
const TINTA = "#0e0e0d";
const GRIS = "#6b6862";

/**
 * La firma se copia una vez y queda pegada en el correo durante anos. Si
 * alguien la genera con el sitio corriendo en su maquina, site.url vale
 * localhost y el enlace nace roto para siempre. Acá gana el dominio real.
 */
const WEB = /localhost|127\.0\.0\.1/.test(site.url) ? "https://onnismeeks.com" : site.url;

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** El bloque de texto, igual con foto y sin ella. */
function columnaTexto(d: DatosFirma, conBorde: boolean): string {
  const nombre = escapar(`${d.nombre} ${d.apellido}`.trim().toUpperCase());
  const borde = conBorde ? `border-left:2px solid ${NARANJA};padding-left:18px;` : "";

  const contacto = [
    d.email
      ? `<a href="mailto:${escapar(d.email)}" style="color:${TINTA};text-decoration:none;">${escapar(d.email)}</a>`
      : "",
    `<a href="https://wa.me/${site.contact.whatsapp}" style="color:${TINTA};text-decoration:none;">${escapar(site.contact.phone)}</a>`,
  ]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");

  return `<td style="vertical-align:top;${borde}">
<div style="font-size:17px;font-weight:bold;color:${TINTA};letter-spacing:-0.3px;line-height:1.2;">${nombre}</div>
<div style="font-size:10px;font-weight:bold;color:${NARANJA};letter-spacing:1.6px;text-transform:uppercase;padding-top:5px;">${escapar(d.cargo)}</div>
<div style="font-size:12px;color:${GRIS};padding-top:7px;">${escapar(site.name)} &nbsp;·&nbsp; ${escapar(site.tagline)}</div>
<div style="font-size:12px;color:${GRIS};padding-top:11px;line-height:1.7;">${contacto}<br>
<a href="${WEB}" style="color:${NARANJA};text-decoration:none;font-weight:bold;">${WEB.replace(/^https?:\/\//, "")}</a> &nbsp;·&nbsp; <a href="${site.social.youtube}" style="color:${GRIS};text-decoration:none;">YouTube</a></div>
</td>`;
}

export function construirFirma(d: DatosFirma, conFoto: boolean): string {
  const foto =
    conFoto && d.foto
      ? `<td style="padding-right:18px;vertical-align:top;"><img src="${escapar(d.foto)}" width="76" height="76" alt="${escapar(`${d.nombre} ${d.apellido}`.trim())}" style="display:block;width:76px;height:76px;border-radius:38px;object-fit:cover;border:0;"></td>`
      : "";

  return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;"><tr>${foto}${columnaTexto(d, true)}</tr></table>`;
}

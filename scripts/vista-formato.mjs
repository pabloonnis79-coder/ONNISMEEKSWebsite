/**
 * Vista previa de la pantalla "Cómo cargar un proyecto" del panel, para poder
 * mirarla sin iniciar sesión. Lee de lib/formato-youtube, el mismo archivo del
 * que lee el panel, así no puede mostrar algo distinto de lo que va a ver el
 * estudio.
 *
 *   node --import ./scripts/alias-hook.mjs scripts/vista-formato.mjs
 */
import { writeFileSync } from "node:fs";
import { EJEMPLO, OPCIONALES, PLANTILLA, REGLAS } from "@/lib/formato-youtube.ts";

const esc = (t) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const bloque = (titulo, texto, nota) => `
<div class="bloque">
  <div class="cabecera"><span class="clave">${esc(titulo)}</span><span class="boton">Copiar</span></div>
  <pre>${esc(texto)}</pre>
  ${nota ? `<p class="nota">${esc(nota)}</p>` : ""}
</div>`;

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Vista previa — Cómo cargar un proyecto</title>
<style>
  :root { --ink:#0e0e0d; --ink800:#141413; --line:#2a2926; --paper:#f4f3f0;
          --dim:#a8a5a0; --faint:#8d8a84; --flame:#f26a1b; --warm:#f5a623; }
  * { box-sizing: border-box; }
  body { margin:0; padding:56px 20px 80px; background:var(--ink); color:var(--paper);
         font:15px/1.65 -apple-system,"Segoe UI",Roboto,sans-serif; }
  main { max-width: 900px; margin: 0 auto; }
  .aviso { border:1px solid var(--line); border-left:3px solid var(--warm);
           padding:14px 18px; margin-bottom:40px; font-size:13px; color:var(--dim); }
  h1 { font-size:34px; font-weight:800; text-transform:uppercase;
       letter-spacing:-0.035em; margin:0 0 14px; }
  .intro { max-width:64ch; font-size:14px; color:var(--dim); margin:0 0 10px; }
  .intro.tenue { color:var(--faint); }
  h2 { font:600 11px/1 ui-monospace,Consolas,monospace; text-transform:uppercase;
       letter-spacing:.22em; color:var(--flame); margin:56px 0 22px; }
  .bloque { border:1px solid var(--line); margin-bottom:20px; }
  .cabecera { display:flex; justify-content:space-between; align-items:center;
              gap:12px; padding:12px 20px; border-bottom:1px solid var(--line); }
  .clave { font:600 11px ui-monospace,Consolas,monospace; text-transform:uppercase;
           letter-spacing:.18em; color:var(--flame); }
  .boton { border:1px solid var(--line); border-radius:999px; padding:8px 20px;
           font:600 11px ui-monospace,Consolas,monospace; text-transform:uppercase;
           letter-spacing:.12em; color:var(--paper); }
  pre { margin:0; padding:16px 20px; background:var(--ink800); overflow-x:auto;
        font:12px/1.7 ui-monospace,Consolas,monospace; color:var(--dim); }
  .nota { margin:0; padding:12px 20px; border-top:1px solid var(--line);
          font-size:12px; color:var(--faint); }
  dl { margin:0; }
  .fila { border-top:1px solid var(--line); padding:18px 0; }
  dt { font-size:14px; font-weight:500; }
  dd { margin:6px 0 0; max-width:70ch; font-size:14px; color:var(--dim); }
  .opc { display:flex; gap:24px; border-top:1px solid var(--line); padding:15px 0; }
  .opc code { width:11rem; flex:none; font:12px ui-monospace,Consolas,monospace;
              color:var(--warm); }
  .opc span { font-size:14px; color:var(--dim); }
  .caja { border:1px solid var(--line); padding:24px; margin-top:22px; }
  ol { margin:18px 0 0; padding-left:20px; color:var(--dim); font-size:14px; }
  li { margin-bottom:8px; }
  @media (max-width:640px){ .opc{flex-direction:column;gap:4px} .opc code{width:auto} }
</style></head><body><main>

<p class="aviso">Vista previa. La pantalla real está en el panel, en
<strong>onnismeeks.com/admin/formato</strong>, donde los botones «Copiar» funcionan.
El contenido sale del mismo archivo, así que es idéntico.</p>

<h1>Cómo cargar un proyecto</h1>
<p class="intro">La descripción del video en YouTube <strong>es</strong> la página del
proyecto. Lo que se escribe ahí se convierte solo en la ficha técnica, el relato, los
créditos y los textos para redes. No hay que cargar nada dos veces.</p>
<p class="intro tenue">Si la descripción no tiene esta estructura el proyecto igual
aparece, pero con el título y el video nada más.</p>

<div style="margin-top:44px">
${bloque("Plantilla para pegar en YouTube", PLANTILLA, "Pegala en la descripción del video y completá los campos. Los que queden vacíos simplemente no se muestran.")}
${bloque("Un ejemplo completo, para ver cómo queda", EJEMPLO, "Este mismo texto se prueba contra el sistema cada vez que se toca el código, así que es exactamente lo que el sitio sabe leer.")}
</div>

<h2>Reglas</h2>
<dl>${REGLAS.map((r) => `<div class="fila"><dt>${esc(r.titulo)}</dt><dd>${esc(r.texto)}</dd></div>`).join("")}</dl>

<h2>Campos opcionales</h2>
<dl>${OPCIONALES.map((o) => `<div class="opc"><code>${esc(o.campo)}</code><span>${esc(o.para)}</span></div>`).join("")}</dl>

<h2>Lo que escribe la inteligencia artificial</h2>
<p class="intro">Con el cliente y los servicios cargados, o con una descripción de más de
40 caracteres, el sistema redacta solo el resumen de la portada, el título y la
descripción para Google, las palabras clave y los textos para publicar en LinkedIn,
Instagram y Facebook.</p>
<p class="intro tenue">Sin esos datos no escribe nada, y es a propósito: si se le pide
texto sin información, inventa o contesta «sin información disponible», y esa frase
termina publicada en Google como descripción del proyecto.</p>

<div class="caja">
  <h2 style="margin-top:0">Cómo se prueba</h2>
  <ol>
    <li>Editar la descripción de un solo video en YouTube con este formato.</li>
    <li>Volver al panel y apretar <strong>Sincronizar</strong>.</li>
    <li>Abrir el proyecto y ver cómo quedó.</li>
  </ol>
  <p class="intro tenue" style="margin-top:18px">Si algo salió mal se corrige la
  descripción y se sincroniza de nuevo. No se rompe nada: lo que se haya editado a mano
  desde el panel no se pisa.</p>
</div>

</main></body></html>`;

writeFileSync("docs/vista-formato.html", html);
console.log("escrito docs/vista-formato.html");

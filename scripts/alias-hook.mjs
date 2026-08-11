// Enseña a node a resolver los imports "@/..." igual que Next.
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const raiz = path.join(import.meta.dirname, "..");

registerHooks({
  resolve(especificador, contexto, siguiente) {
    if (especificador.startsWith("@/")) {
      let destino = path.join(raiz, especificador.slice(2));
      // Next completa la extension solo; node no. Se la agregamos.
      if (!path.extname(destino)) destino += ".ts";
      return { url: pathToFileURL(destino).href, shortCircuit: true };
    }
    return siguiente(especificador, contexto);
  },
});

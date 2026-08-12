/**
 * Lineas guia editoriales: cinco verticales tenues que corren de arriba abajo
 * de la pantalla y marcan la grilla sobre la que esta armado el sitio.
 *
 * Van con el mismo ancho maximo y el mismo margen lateral que el resto de las
 * secciones, asi que las dos de los extremos caen justo donde empieza y termina
 * el texto. No son un adorno suelto: son la grilla, dibujada.
 *
 * Son fijas y no se mueven con el scroll. Una grilla que acompana el contenido
 * se lee como parte del contenido; una que se queda quieta se lee como el papel
 * sobre el que esta impreso, que es la idea.
 */
export function GuideLines() {
  return (
    <div className="lineas-guia" aria-hidden="true">
      <div className="mx-auto flex h-full max-w-[1600px] justify-between px-5 md:px-10">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="lineas-guia-trazo" />
        ))}
      </div>
    </div>
  );
}

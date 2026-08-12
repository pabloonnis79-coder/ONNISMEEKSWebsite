/**
 * Cortina de apertura de la portada: una capa del color del fondo que arranca
 * tapando todo y se cierra sobre si misma hasta desaparecer, dejando la pagina
 * a la vista.
 *
 * Es CSS puro, sin JavaScript, y eso no es una economia: es lo que hace que
 * funcione. La capa viene en el HTML que manda el servidor, asi que ya esta
 * cubriendo la pantalla en el primer cuadro. Si la montara React al terminar de
 * hidratar, se veria un pedazo de la pagina antes de que apareciera la cortina,
 * que es justo lo que la cortina viene a tapar.
 *
 * Corre una sola vez porque la animacion no se repite, y vuelve a correr si
 * alguien vuelve a la portada, que es cuando este elemento se monta de nuevo.
 */
export function OpeningCurtain() {
  return <div className="cortina" aria-hidden="true" />;
}

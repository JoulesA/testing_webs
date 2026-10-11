/* Voxel Forge — carrusel infinito de "más vendidos"
   Se arma un grupo de tarjetas (repetido las veces necesarias para cubrir el
   ancho visible) y se duplica; el CSS desplaza la pista justo un grupo, así el
   bucle no tiene saltos. Se pausa al pasar el cursor o enfocar una tarjeta. */

const VELOCIDAD_CARRUSEL = 55; // píxeles por segundo

function crearCarruselInfinito(marquee, productos) {
  if (!productos.length) {
    marquee.innerHTML = `<p class="wrap">Pronto habrá piezas destacadas aquí.</p>`;
    return;
  }

  const html = productos.map((p) => tarjetaProducto(p)).join("");
  let anchoPrevio = 0;

  function construir() {
    const pista = document.createElement("div");
    pista.className = "marquee-track";

    // 1) un grupo de prueba para medir cuánto ocupa un juego completo de tarjetas
    const prueba = document.createElement("div");
    prueba.className = "marquee-group";
    prueba.innerHTML = html;
    pista.appendChild(prueba);
    marquee.replaceChildren(pista);

    const anchoJuego = prueba.getBoundingClientRect().width;
    const repeticiones = Math.max(1, Math.ceil(marquee.clientWidth / anchoJuego));

    // 2) grupo real (cubre al menos el ancho visible) + copia idéntica para el bucle
    const grupo = document.createElement("div");
    grupo.className = "marquee-group";
    grupo.innerHTML = html.repeat(repeticiones);
    const copia = grupo.cloneNode(true);
    copia.setAttribute("aria-hidden", "true");
    copia.querySelectorAll("button, a").forEach((el) => el.setAttribute("tabindex", "-1"));
    pista.replaceChildren(grupo, copia);

    const duracion = grupo.getBoundingClientRect().width / VELOCIDAD_CARRUSEL;
    pista.style.setProperty("--duracion", `${duracion.toFixed(1)}s`);
    anchoPrevio = marquee.clientWidth;
  }

  construir();
  activarTarjetas(marquee); // un solo listener para colores y tamaños (también en la copia)

  let temporizador;
  window.addEventListener("resize", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      if (Math.abs(marquee.clientWidth - anchoPrevio) > 40) construir();
    }, 250);
  });
}

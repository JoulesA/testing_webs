/* Voxel Forge — lógica de la página de catálogo
   Vista general por defecto; se puede entrar directo a un pilar/nicho
   vía ?pilar=Mesa%20de%20juego (o el valor que use la página que enlaza aquí),
   y dentro de la página también se puede cambiar de pilar con los chips. */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("grid-catalogo");
  const buscador = document.getElementById("buscador");
  const chipsContenedor = document.getElementById("chips-pilares");
  const contador = document.getElementById("contador-resultados");
  const tituloVista = document.getElementById("titulo-vista");

  let productos = [];
  let pilarActivo = "todas";

  const params = new URLSearchParams(window.location.search);
  const pilarURL = params.get("pilar");

  try {
    productos = await cargarProductos();
  } catch (err) {
    grid.innerHTML = `<p>No se pudo cargar el catálogo. Intenta recargar la página.</p>`;
    return;
  }

  const pilaresPresentes = PILARES.filter((p) => productos.some((prod) => prod.categoria === p));

  function construirChips() {
    const opciones = ["todas", ...pilaresPresentes];
    chipsContenedor.innerHTML = opciones
      .map((p) => {
        const etiqueta = p === "todas" ? "Todo el catálogo" : p;
        return `<button type="button" class="chip" data-pilar="${p}">${etiqueta}</button>`;
      })
      .join("");
  }

  function marcarChipActivo() {
    chipsContenedor.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.pilar === pilarActivo);
    });
  }

  function actualizarTitulo() {
    tituloVista.textContent = pilarActivo === "todas" ? "Todo el catálogo" : pilarActivo;
  }

  function aplicarFiltros() {
    const texto = buscador.value.trim().toLowerCase();

    const filtrados = productos.filter((p) => {
      const coincideTexto = !texto || p.nombre.toLowerCase().includes(texto);
      const coincidePilar = pilarActivo === "todas" || p.categoria === pilarActivo;
      return coincideTexto && coincidePilar;
    });

    renderTarjetas(grid, filtrados);
    contador.textContent = `${filtrados.length} artículo${filtrados.length === 1 ? "" : "s"}`;
    actualizarTitulo();
  }

  construirChips();

  if (pilarURL && pilaresPresentes.includes(pilarURL)) {
    pilarActivo = pilarURL;
  }
  marcarChipActivo();

  chipsContenedor.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    pilarActivo = chip.dataset.pilar;
    marcarChipActivo();
    aplicarFiltros();

    // Refleja el pilar activo en la URL para que se pueda compartir el enlace directo
    const url = new URL(window.location);
    if (pilarActivo === "todas") url.searchParams.delete("pilar");
    else url.searchParams.set("pilar", pilarActivo);
    window.history.replaceState({}, "", url);
  });

  buscador.addEventListener("input", aplicarFiltros);

  aplicarFiltros();
});

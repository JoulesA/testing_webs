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
  let soloVendidos = false;

  const params = new URLSearchParams(window.location.search);
  const pilarURL = params.get("pilar");
  const vendidosURL = params.get("vendidos") === "1";

  try {
    productos = await cargarProductos();
  } catch (err) {
    grid.innerHTML = `<p>No se pudo cargar el catálogo. Intenta recargar la página.</p>`;
    return;
  }

  const pilaresPresentes = PILARES.filter((p) => productos.some((prod) => prod.categorias.includes(p)));

  function construirChips() {
    const opciones = ["todas", ...pilaresPresentes];
    const chipVendidos =
      `<button type="button" class="chip chip-vendidos" data-vendidos aria-pressed="false">${yunqueSVG()}Más vendidos</button>` +
      `<span class="chip-sep" aria-hidden="true"></span>`;
    chipsContenedor.innerHTML = chipVendidos + opciones
      .map((p) => {
        const etiqueta = p === "todas" ? "Todo el catálogo" : p;
        return `<button type="button" class="chip" data-pilar="${p}">${etiqueta}</button>`;
      })
      .join("");
  }

  function marcarChipActivo() {
    chipsContenedor.querySelectorAll(".chip[data-pilar]").forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.pilar === pilarActivo);
    });
    const chipVendidos = chipsContenedor.querySelector("[data-vendidos]");
    chipVendidos.classList.toggle("is-active", soloVendidos);
    chipVendidos.setAttribute("aria-pressed", String(soloVendidos));
  }

  function actualizarTitulo() {
    const base = pilarActivo === "todas" ? "Todo el catálogo" : pilarActivo;
    tituloVista.textContent = soloVendidos
      ? (pilarActivo === "todas" ? "Más vendidos" : `Más vendidos · ${pilarActivo}`)
      : base;
  }

  function aplicarFiltros() {
    const texto = buscador.value.trim().toLowerCase();

    const filtrados = productos.filter((p) => {
      const coincideTexto = !texto || [p.nombre, ...p.categorias].join(" ").toLowerCase().includes(texto);
      const coincidePilar = pilarActivo === "todas" || p.categorias.includes(pilarActivo);
      const coincideVendidos = !soloVendidos || p.destacado;
      return coincideTexto && coincidePilar && coincideVendidos;
    });

    renderTarjetas(grid, filtrados, { resaltarVendidos: true });
    contador.textContent = `${filtrados.length} artículo${filtrados.length === 1 ? "" : "s"}`;
    actualizarTitulo();
  }

  construirChips();

  if (pilarURL && pilaresPresentes.includes(pilarURL)) {
    pilarActivo = pilarURL;
  }
  soloVendidos = vendidosURL;
  marcarChipActivo();

  chipsContenedor.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    if (chip.hasAttribute("data-vendidos")) soloVendidos = !soloVendidos;
    else pilarActivo = chip.dataset.pilar;
    marcarChipActivo();
    aplicarFiltros();

    // Refleja los filtros en la URL para que se pueda compartir el enlace directo
    const url = new URL(window.location);
    if (pilarActivo === "todas") url.searchParams.delete("pilar");
    else url.searchParams.set("pilar", pilarActivo);
    if (soloVendidos) url.searchParams.set("vendidos", "1");
    else url.searchParams.delete("vendidos");
    window.history.replaceState({}, "", url);
  });

  buscador.addEventListener("input", aplicarFiltros);

  aplicarFiltros();
});

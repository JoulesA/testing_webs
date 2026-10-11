/* Voxel Forge — utilidades compartidas de catálogo
   Estructura de cada producto en data/productos.json:
   {
     id, nombre, descripcion,
     categorias: ["Pilar 1", "Pilar 2"],      // una o más; la primera define el ícono
     destacado: true|false,                   // aparece en "más vendidos"
     personalizable: true|false,              // muestra la etiqueta que lleva al Taller
     precio: 249,                             // precio base (o del único tamaño)
     tamanos: [{ etiqueta, precio }],         // opcional
     colores: [{ nombre, hex, imagen }]       // opcional, máximo 3
   }
   Las imágenes viven en img/productos/ y el JSON solo guarda la ruta. */

const PILARES = ["Mesa de juego", "Geek y literario", "Útil", "Regalo"];

const ICONOS_POR_PILAR = {
  "Mesa de juego": `<path d="M12 2 3 7l9 5 9-5-9-5Z"/><path d="M3 7v10l9 5 9-5V7"/><circle cx="12" cy="12" r="1.4" fill="var(--text-dim)" stroke="none"/>`,
  "Geek y literario": `<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 4.5v16A2.5 2.5 0 0 1 6.5 18H20"/>`,
  "Útil": `<rect x="3" y="7" width="18" height="12" rx="1"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`,
  "Regalo": `<rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-1.6-3-6-3.2-6-.4C6 9.6 8 9 12 9Zm0 0c1.6-3 6-3.2 6-.4 0 1-2 .4-6 .4Z"/>`
};

const MAX_COLORES = 3;

function esc(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* Yunque en píxel-art (misma estética del logo). Hereda el color con currentColor. */
const FILAS_YUNQUE = [[0, 4, 16], [1, 2, 16], [2, 0, 15], [3, 3, 12], [4, 5, 11], [5, 6, 10], [6, 6, 10], [7, 5, 11], [8, 3, 13], [9, 2, 14]];
function yunqueSVG() {
  const rects = FILAS_YUNQUE.map(([y, a, b]) => `<rect x="${a}" y="${y}" width="${b - a}" height="1"/>`).join("");
  return `<svg viewBox="0 0 16 10" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

function iconoProducto(categoria) {
  const path = ICONOS_POR_PILAR[categoria] || ICONOS_POR_PILAR["Útil"];
  return `<svg viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

async function cargarProductos() {
  const res = await fetch("data/productos.json");
  if (!res.ok) throw new Error("No se pudo cargar el catálogo");
  return res.json();
}

function formatoPrecio(n) {
  return Number(n).toLocaleString("es-MX");
}

/* Enlace al Taller con el producto (y la variante elegida) como contexto */
function urlPersonalizar(nombre, tamano, color) {
  const q = new URLSearchParams({ producto: nombre });
  if (tamano) q.set("tamano", tamano);
  if (color) q.set("color", color);
  return `cotizacion.html?${q.toString()}#personalizacion`;
}

function tarjetaProducto(p, opciones = {}) {
  const resaltar = Boolean(opciones.resaltarVendidos && p.destacado);
  const categorias = p.categorias || [];
  const tamanos = p.tamanos || [];
  const colores = (p.colores || []).slice(0, MAX_COLORES);
  const icono = iconoProducto(categorias[0]);

  const precioInicial = tamanos.length ? tamanos[0].precio : p.precio;
  const tamanoInicial = tamanos.length ? tamanos[0].etiqueta : "";
  const colorInicial = colores.length ? colores[0].nombre : "";

  // Una capa por color; el cambio es un fundido CSS entre capas
  const capas = (colores.length ? colores : [{ nombre: "", hex: "", imagen: p.imagen }])
    .map((c, i) => `
      <div class="layer${i === 0 ? " is-active" : ""}" data-color="${i}"${c.hex ? ` style="--tint:${esc(c.hex)}"` : ""}>
        ${icono}
        ${c.imagen ? `<img src="${esc(c.imagen)}" alt="${esc(p.nombre)}${c.nombre ? " — " + esc(c.nombre) : ""}" loading="lazy" onerror="this.remove()">` : ""}
      </div>`).join("");

  const botonesColor = colores.length > 1
    ? `<div class="swatches" role="group" aria-label="Color">
        ${colores.map((c, i) => `
          <button type="button" class="swatch${i === 0 ? " is-active" : ""}" data-color="${i}" data-nombre="${esc(c.nombre)}"
            style="--c:${esc(c.hex)}" aria-label="${esc(c.nombre)}" aria-pressed="${i === 0}"></button>`).join("")}
      </div>`
    : "";

  const botonesTamano = tamanos.length > 1
    ? `<div class="sizes" role="group" aria-label="Tamaño">
        ${tamanos.map((t, i) => `
          <button type="button" class="size-btn${i === 0 ? " is-active" : ""}" data-etiqueta="${esc(t.etiqueta)}" data-precio="${esc(t.precio)}"
            aria-pressed="${i === 0}">${esc(t.etiqueta)}</button>`).join("")}
      </div>`
    : "";

  const etiquetas = categorias.map((c) => `<span class="tag">${esc(c)}</span>`).join("") +
    (p.personalizable
      ? `<a class="tag tag-custom" href="${esc(urlPersonalizar(p.nombre, tamanoInicial, colorInicial))}" data-personalizar>Personalizable →</a>`
      : "");

  return `
    <article class="card-product${resaltar ? " is-vendido" : ""}" data-nombre="${esc(p.nombre)}" data-tamano="${esc(tamanoInicial)}" data-color-nombre="${esc(colorInicial)}">
      ${resaltar ? `<span class="badge-vendido" role="img" aria-label="Más vendido" title="Más vendido">${yunqueSVG()}</span>` : ""}
      <div class="thumb">
        ${capas}
        ${botonesColor}
      </div>
      <div class="body">
        <div class="tags">${etiquetas}</div>
        <h3>${esc(p.nombre)}</h3>
        <p class="desc">${esc(p.descripcion)}</p>
        ${botonesTamano}
        <div class="price-row">
          <span class="price" data-precio>${formatoPrecio(precioInicial)}</span>
        </div>
      </div>
    </article>`;
}

function actualizarEnlacePersonalizar(card) {
  const enlace = card.querySelector("[data-personalizar]");
  if (!enlace) return;
  enlace.href = urlPersonalizar(card.dataset.nombre, card.dataset.tamano, card.dataset.colorNombre);
}

/* Un solo listener por contenedor (delegación): colores y tamaños */
function activarTarjetas(contenedor) {
  if (contenedor.dataset.interactivo) return;
  contenedor.dataset.interactivo = "1";

  contenedor.addEventListener("click", (e) => {
    const card = e.target.closest(".card-product");
    if (!card) return;

    const swatch = e.target.closest(".swatch");
    if (swatch) {
      card.querySelectorAll(".layer").forEach((l) => l.classList.toggle("is-active", l.dataset.color === swatch.dataset.color));
      card.querySelectorAll(".swatch").forEach((s) => {
        s.classList.toggle("is-active", s === swatch);
        s.setAttribute("aria-pressed", String(s === swatch));
      });
      card.dataset.colorNombre = swatch.dataset.nombre;
      actualizarEnlacePersonalizar(card);
      return;
    }

    const tamano = e.target.closest(".size-btn");
    if (tamano) {
      card.querySelectorAll(".size-btn").forEach((b) => {
        b.classList.toggle("is-active", b === tamano);
        b.setAttribute("aria-pressed", String(b === tamano));
      });
      card.querySelector("[data-precio]").textContent = formatoPrecio(tamano.dataset.precio);
      card.dataset.tamano = tamano.dataset.etiqueta;
      actualizarEnlacePersonalizar(card);
    }
  });
}

function renderTarjetas(contenedor, productos, opciones = {}) {
  contenedor.innerHTML = productos.map((p) => tarjetaProducto(p, opciones)).join("") ||
    `<p>No hay artículos que coincidan con tu búsqueda.</p>`;
  activarTarjetas(contenedor);
}

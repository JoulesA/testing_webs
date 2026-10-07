/* Voxel Forge — utilidades compartidas de catálogo
   Carga data/productos.json y genera tarjetas de producto.
   Como no hay fotos reales todavía, cada tarjeta usa un ícono SVG
   generado según el pilar del producto (ver manual de marca, sección 3). */

const PILARES = ["Mesa de juego", "Geek y literario", "Útil", "Regalo"];

const ICONOS_POR_PILAR = {
  "Mesa de juego": `<path d="M12 2 3 7l9 5 9-5-9-5Z"/><path d="M3 7v10l9 5 9-5V7"/><circle cx="12" cy="12" r="1.4" fill="var(--text-dim)" stroke="none"/>`,
  "Geek y literario": `<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 4.5v16A2.5 2.5 0 0 1 6.5 18H20"/>`,
  "Útil": `<rect x="3" y="7" width="18" height="12" rx="1"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`,
  "Regalo": `<rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-1.6-3-6-3.2-6-.4C6 9.6 8 9 12 9Zm0 0c1.6-3 6-3.2 6-.4 0 1-2 .4-6 .4Z"/>`
};

function iconoProducto(categoria) {
  const path = ICONOS_POR_PILAR[categoria] || ICONOS_POR_PILAR["Útil"];
  return `<svg viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

async function cargarProductos() {
  const res = await fetch("data/productos.json");
  if (!res.ok) throw new Error("No se pudo cargar el catálogo");
  return res.json();
}

function tarjetaProducto(p) {
  return `
    <article class="card-product">
      <div class="thumb">${iconoProducto(p.categoria)}</div>
      <div class="body">
        <span class="tag">${p.categoria}</span>
        <h3>${p.nombre}</h3>
        <p class="desc">${p.descripcion}</p>
        <div class="price-row">
          <span class="price">${p.precio.toLocaleString("es-MX")}</span>
        </div>
      </div>
    </article>`;
}

function renderTarjetas(contenedor, productos) {
  contenedor.innerHTML = productos.map(tarjetaProducto).join("") ||
    `<p>No hay artículos que coincidan con tu búsqueda.</p>`;
}

/* Voxel Forge — calculadora de cotización de impresión
   -----------------------------------------------------
   Ajusta las constantes de este bloque conforme a tus costos reales.
   Todos los montos están en MXN. */

const CONFIG_COTIZACION = {
  precioFilamentoKg: 420,      // MXN por kg de filamento
  tarifaAmortizacionHora: 18,  // MXN por hora de uso de la impresora (mantenimiento + depreciación)
  margenGanancia: 0.45,        // 45% sobre el costo antes de margen
  costoFijoPorPieza: 8,        // MXN — energía, post-procesado ligero, empaque básico
  aditamentos: {
    anilla: { etiqueta: "Anilla para llavero", precio: 12 },
    iman: { etiqueta: "Imán", precio: 15 },
    led: { etiqueta: "Módulo de luz LED", precio: 85 }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const inputGramos = document.getElementById("input-gramos");
  const inputTiempo = document.getElementById("input-tiempo");
  const checksAditamentos = document.querySelectorAll("[data-aditamento]");

  // Solo el total se muestra al cliente — el desglose (material, máquina,
  // aditamentos, costo fijo) se calcula pero se queda internamente en este
  // script, sin elementos de salida en el HTML.
  const salidaTotal = document.getElementById("salida-total");

  // Pintar precios de aditamentos junto a cada casilla
  checksAditamentos.forEach((chk) => {
    const clave = chk.dataset.aditamento;
    const cfg = CONFIG_COTIZACION.aditamentos[clave];
    const precioEl = chk.closest("label").querySelector(".addon-price");
    if (precioEl && cfg) precioEl.textContent = `+$${cfg.precio}`;
  });

  function calcular() {
    const gramos = Math.max(0, parseFloat(inputGramos.value) || 0);
    const horas = Math.max(0, parseFloat(inputTiempo.value) || 0);

    const costoMaterial = (gramos / 1000) * CONFIG_COTIZACION.precioFilamentoKg;
    const costoMaquina = horas * CONFIG_COTIZACION.tarifaAmortizacionHora;

    let costoAditamentos = 0;
    checksAditamentos.forEach((chk) => {
      if (chk.checked) costoAditamentos += CONFIG_COTIZACION.aditamentos[chk.dataset.aditamento].precio;
    });

    const costoFijo = CONFIG_COTIZACION.costoFijoPorPieza;
    const subtotal = costoMaterial + costoMaquina + costoAditamentos + costoFijo;
    const total = subtotal * (1 + CONFIG_COTIZACION.margenGanancia);

    // Desglose interno — útil si en el futuro agregas un panel de administración.
    // console.table({ costoMaterial, costoMaquina, costoAditamentos, costoFijo, total });

    salidaTotal.textContent = `$${total.toFixed(2)}`;
  }

  [inputGramos, inputTiempo, ...checksAditamentos].forEach((el) =>
    el.addEventListener("input", calcular)
  );

  calcular();
});

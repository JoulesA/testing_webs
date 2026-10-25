/* Voxel Forge — calculadora de cotización de impresión
   -----------------------------------------------------
   Ajusta las constantes de este bloque conforme a tus costos reales.
   Todos los montos están en MXN. Nada de esto se muestra al cliente:
   solo ve el precio final. */

const CONFIG_COTIZACION = {
  markup: 0.5,                // 50% sobre el subtotal de costos
  tarifaAmortizacionHora: 2,   // MXN por hora de uso de la impresora (igual para todos los materiales)
  costoElectricoHora: 1.2,       // MXN por hora de consumo eléctrico — VALOR DE EJEMPLO, ajústalo
  impuesto: 0.16,                // IVA (16% en México)

  // Material que aparece seleccionado al cargar (clave de la lista de abajo)
  materialPorDefecto: "pla",

  // Para agregar un material nuevo basta con añadir una línea aquí: aparece solo en el menú.
  //   precioKg:  MXN por kg de material
  //   costoFijo: MXN base por pieza (energía, post-procesado, empaque)
  materiales: {
    pla:       { etiqueta: "PLA",             precioKg: 500, costoFijo: 10 },
    plaAlimenticio: { etiqueta: "PLA Grado Alimenticio", precioKg: 625, costoFijo: 10 },
    resina:    { etiqueta: "Resina Estándar", precioKg: 500, costoFijo: 45 },
    resinaAbs: { etiqueta: "Resina ABS",      precioKg: 600, costoFijo: 45 },
  },

  // Precios internos de los extras (no se muestran al cliente)
  aditamentos: {
    anilla: { etiqueta: "Anilla para llavero", precio: 5 },
    iman: { etiqueta: "Imán", precio: 5 },
    led: { etiqueta: "Módulo de luz led", precio: 85 },
    clicker: { etiqueta: "Mecanismo de clicker", precio: 5 },
    tealight: { etiqueta: "Vela led", precio: 10 },
  },

  mayoreo: { minimoPiezas: 30, correo: "cjimenezm1298@gmail.com" }
};

document.addEventListener("DOMContentLoaded", () => {
  const inputGramos = document.getElementById("input-gramos");
  const inputTiempo = document.getElementById("input-tiempo");
  const selectMaterial = document.getElementById("select-material");
  const checksAditamentos = document.querySelectorAll("[data-aditamento]");
  const enlaceMayoreo = document.getElementById("mayoreo-enlace");

  // Solo el total se muestra al cliente — el desglose (material, máquina,
  // aditamentos, costo fijo, electricidad) se calcula pero se queda aquí.
  const salidaTotal = document.getElementById("salida-total");

  // El menú de materiales se arma a partir de la configuración
  const { materiales, materialPorDefecto, mayoreo } = CONFIG_COTIZACION;
  Object.entries(materiales).forEach(([clave, m]) => selectMaterial.add(new Option(m.etiqueta, clave)));
  selectMaterial.value = materiales[materialPorDefecto] ? materialPorDefecto : Object.keys(materiales)[0];

  document.querySelectorAll("[data-mayoreo-minimo]").forEach((el) => (el.textContent = mayoreo.minimoPiezas));

  function calcular() {
    const gramos = Math.max(0, parseFloat(inputGramos.value) || 0);
    const horas = Math.max(0, parseFloat(inputTiempo.value) || 0);
    const material = materiales[selectMaterial.value];

    const costoMaterial = (gramos / 1000) * material.precioKg;
    const costoMaquina = horas * CONFIG_COTIZACION.tarifaAmortizacionHora;

    let costoAditamentos = 0;
    const extras = [];
    checksAditamentos.forEach((chk) => {
      if (!chk.checked) return;
      const extra = CONFIG_COTIZACION.aditamentos[chk.dataset.aditamento];
      costoAditamentos += extra.precio;
      extras.push(extra.etiqueta);
    });

    const costoFijo = material.costoFijo;
    const consumo_electrico = horas * CONFIG_COTIZACION.costoElectricoHora;
    const subtotal = costoMaterial + costoMaquina + costoAditamentos + costoFijo + consumo_electrico;
    const total_preimpuestos = subtotal * (1 + CONFIG_COTIZACION.markup);
    const total = total_preimpuestos * (1 + CONFIG_COTIZACION.impuesto);
    // Desglose interno — útil si en el futuro agregas un panel de administración.
    // console.table({ costoMaterial, costoMaquina, costoAditamentos, costoFijo, consumo_electrico, total });

    salidaTotal.textContent = `$${total.toFixed(2)}`;

    // El correo de mayoreo lleva las especificaciones que el cliente ya capturó
    const cuerpo =
      `Hola, quiero cotizar un lote de ${mayoreo.minimoPiezas} piezas o más.\n` +
      `Material: ${material.etiqueta}\nPeso por pieza: ${gramos} g\nTiempo por pieza: ${horas} h\n` +
      `Aditamentos: ${extras.length ? extras.join(", ") : "ninguno"}\nCantidad de piezas: `;
    enlaceMayoreo.href =
      `mailto:${mayoreo.correo}?subject=${encodeURIComponent(`Cotización por mayoreo (${mayoreo.minimoPiezas}+ piezas)`)}` +
      `&body=${encodeURIComponent(cuerpo)}`;
  }

  [inputGramos, inputTiempo, selectMaterial, ...checksAditamentos].forEach((el) =>
    el.addEventListener("input", calcular)
  );

  calcular();
});
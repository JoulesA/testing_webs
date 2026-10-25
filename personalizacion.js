/* Voxel Forge — solicitud de personalización (Taller)
   Lee ?producto=...&tamano=...&color=... (los manda la etiqueta "Personalizable"
   del catálogo), prellena la pieza y arma los enlaces de correo y WhatsApp. */

const CONTACTO_PERSONALIZACION = {
  whatsapp: "527223743742",        // número con lada de país, sin + ni espacios (placeholder: cámbialo)
  correo: "cjimenezm1298@gmail.com"
};

document.addEventListener("DOMContentLoaded", () => {
  const inputPieza = document.getElementById("pers-pieza");
  const inputCantidad = document.getElementById("pers-cantidad");
  const inputDetalle = document.getElementById("pers-detalle");
  const enlaceWhatsapp = document.getElementById("pers-whatsapp");
  const enlaceCorreo = document.getElementById("pers-correo");
  if (!inputPieza) return;

  const params = new URLSearchParams(window.location.search);
  const producto = params.get("producto");
  if (producto) {
    const variante = [
      params.get("tamano") && `tamaño ${params.get("tamano")}`,
      params.get("color") && `color ${params.get("color")}`
    ].filter(Boolean);
    inputPieza.value = variante.length ? `${producto} (${variante.join(", ")})` : producto;
  }

  function actualizar() {
    const pieza = inputPieza.value.trim() || "una pieza personalizada";
    const cantidad = Math.max(1, parseInt(inputCantidad.value, 10) || 1);
    const detalle = inputDetalle.value.trim() || "(lo platicamos)";

    const mensaje =
      `Hola, quiero solicitar una personalización en Voxel Forge.\n` +
      `Pieza: ${pieza}\nCantidad: ${cantidad}\nDetalle: ${detalle}`;

    enlaceWhatsapp.href = `https://wa.me/${CONTACTO_PERSONALIZACION.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    enlaceCorreo.href =
      `mailto:${CONTACTO_PERSONALIZACION.correo}?subject=${encodeURIComponent("Personalización: " + pieza)}` +
      `&body=${encodeURIComponent(mensaje)}`;
  }

  [inputPieza, inputCantidad, inputDetalle].forEach((el) => el.addEventListener("input", actualizar));
  actualizar();
});

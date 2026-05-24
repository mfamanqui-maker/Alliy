/**
 * Configuración central del panel de detalle de entidad.
 * Todas las medidas son fracciones de la cámara cuando es posible,
 * o píxeles fijos para tamaños pequeños (íconos, padding, etc.).
 *
 * El módulo es Phaser puro; el modal se dibuja sobre la escena `entidad`
 * para no ser afectado por zoom/pan del tablero.
 */

export const DEPTHS = {
  velo: 950,
  fondo: 1000,
  contenido: 1010,
  scroll: 1015,
  mask: 1020,
  tooltip: 1030,
  header: 1040,
  botones: 1050,
};

export const COLORES = {
  velo: 0x000000,
  veloAlpha: 0.55,
  fondo: 0x2b1d0e,
  fondoAlpha: 0.96,
  borde: 0xf5d68a,
  bordeGrosor: 4,
  separador: 0xf5d68a,
  separadorAlpha: 0.55,
  bandaTitulo: 0x3d2817,
  bandaSeccion: 0x1f1408,
  tooltipFondo: 0x6E605E,
  tooltipBorde: 0xf5d68a,
  botonFondo: 0x3d2817,
  botonHover: 0x5a3a1f,
  botonBorde: 0xf5d68a,
  iconoMarcoVacio: 0x140d05,
  flechaFondo: 0x3d2817,
  flechaHover: 0x5a3a1f,
  cerrarFondo: 0x4a1414,
  cerrarHover: 0x7a1f1f,
};

export const PANEL = {
  fraccionAncho: 0.92,
  fraccionAlto: 0.88,
  padding: 18,
};

export const HEADER = {
  altoFraccion: 0.12,
  flechaAncho: 90,
  flechaAlto: 64,
  cerrarTam: 56,
  nombreEscala: 4,
  nombreEstilo: 'naranja',
};

export const LADO_IZQUIERDO = {
  anchoFraccion: 0.32,
  paddingInterno: 16,
  fotoFraccionAlto: 0.5,
  barraVidaAlto: 28,
  gapVerticalEntreBloques: 14,
  textoVidaEscala: 2.5,
  textoVidaEstilo: 'naranja',
  tooltipAlto: 132,
  tooltipPadding: 10,
  tooltipTextoEscala: 2,
  tooltipTextoEstilo: 'teal',
  tooltipTitulo: 'PASA EL MOUSE SOBRE UNA CUALIDAD',
  botonAlto: 44,
  botonGap: 10,
  botonTextoEscala: 2,
  botonTextoEstilo: 'teal',
};

export const LISTAS = {
  filaAlto: 56,
  filaPaddingX: 10,
  iconoTam: 40,
  iconoMarcoTam: 48,
  gapIconoTexto: 10,
  gapNombreCantidad: 14,
  textoEscala: 2,
  textoEstilo: 'teal',
  tituloEscala: 2.5,
  tituloEstilo: 'naranja',
  tituloAlto: 36,
  separadorFilasAlpha: 0.18,
  scrollVelocidad: 0.6,
};

export const LADO_DERECHO = {
  paddingInterno: 12,
  splitFraccion: 0.5,
  gapColumnaInterna: 8,
};

export const DESCRIPCIONES = {
  estadisticas: {
    clave: 'panelEntidad_desc_estadisticas',
    ruta: 'src/scenes/battles/ui/PanelEntidad/descripciones/estadisticas.json',
  },
  efectos: {
    clave: 'panelEntidad_desc_efectos',
    ruta: 'src/scenes/battles/ui/PanelEntidad/descripciones/efectos.json',
  },
  acciones: {
    clave: 'panelEntidad_desc_acciones',
    ruta: 'src/scenes/battles/ui/PanelEntidad/descripciones/acciones.json',
  },
  objetos: {
    clave: 'panelEntidad_desc_objetos',
    ruta: 'src/scenes/battles/ui/PanelEntidad/descripciones/objetos.json',
  },
  movimiento: {
    clave: 'panelEntidad_desc_movimiento',
    ruta: 'src/scenes/battles/ui/PanelEntidad/descripciones/movimiento.json',
  },
};

export const ICONO_FALLBACK = 'assets/images/candle.png';

export function claveTexturaImagen(ruta) {
  return `panelEntidad_img_${String(ruta).replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

export function obtenerDescripcion(scene, clave, nombreItem) {
  const meta = DESCRIPCIONES[clave];
  if (!meta) return null;
  const cache = scene.cache?.json;
  if (!cache?.exists(meta.clave)) return null;
  const tabla = cache.get(meta.clave);
  if (!tabla || typeof tabla !== 'object') return null;
  const key = String(nombreItem ?? '').toUpperCase();
  return tabla[key] ?? tabla[nombreItem] ?? null;
}

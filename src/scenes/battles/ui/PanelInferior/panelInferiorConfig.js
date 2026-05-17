/**
 * Main_menu.png (496×176) — spritesheet 2×1:
 *   frame 0: pergamino con menú de botones
 *   frame 1: pergamino vacío (panel de entidad en batalla)
 */
export const MAIN_MENU = {
  textura: 'uiMainMenu',
  archivo: 'assets/images/Main_menu.png',
  anchoCelda: 60,
  altoCelda: 176,
  framePanel: 2,
  rotacion: 90,
};

export const MAIN_MENU_FRAMES = {
  panelConMenu: 0,
  panelVacio: 1,
};

export function frameMainTiles(fila, columna, tiles = MAIN_TILES) {
  return fila * tiles.columnas + columna;
}

export const MAIN_TILES = {
  textura: 'uiMainTiles',
  archivo: 'assets/images/Main_tiles.png',
  anchoCelda: 16,
  altoCelda: 16,
  columnas: 24,
  botonCerrarCelda: { fila: 18, columna: 2 },
};

export const MAIN_TILES_FRAMES = {
  botonCerrarTeal: frameMainTiles(18, 0),
  botonCerrarTan: frameMainTiles(18, 2),
  botonCerrarMarron: frameMainTiles(18, 3),
};

/** Valores base; el panel calcula posiciones según ancho/alto reales. */
export const LAYOUT = {
  retrato: {
    fraccionAlto: 0.88,
    maxTamano: 175,
    margenIzquierdo: 52,
    offsetX: 50,
    offsetY: 10,
  },
  zonaCentral: {
    fraccionY: 0.4,
    gapRetratoContenido: 12,
    gapNombreBarra: 18,
    barraAnchoFraccion: 0.22,
    barraAnchoMax: 300,
    barraAlto: 30,
    nombreEscala: 3.25,
  },
  estadisticas: {
    fraccionY: 0.84,
    inicioXFraccion: 0.2,
    margenDerechoReserva: 56,
    iconoFraccionAnchoCol: 0.4,
    iconoFraccionAltoPanel: 0.5,
    iconoTamanoMax: 58,
    espacioIconoTexto: 8,
    espacioLabelNumero: 20,
    textoEscala: 3,
    gapColumnas: 4,
  },
  botonCerrar: {
    margenDerecho: 10,
    margenSuperior: 4,
    offsetX: 0,
    offsetY: 0,
    tamanoDisplay: 52,
    depth: 500,
    alpha: 0.0000001,
  },
  textoNombre: { estilo: 'teal' },
  textoStat: { estilo: 'teal' },
};

export const PANEL_DEFECTO = {
  fraccionAltura: 0.34,
  depth: 100,
};

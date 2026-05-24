/**
 * Circle_menu.png → 256×320, rejilla 8×10 de 32×32 px.
 * Fila 2–3 (índice 0): círculos sueltos para marcos (tan, crema, gris…).
 */
export const CIRCLE_MENU = {
  textura: 'uiCircleMenu',
  archivo: 'assets/images/Circle_menu.png',
  anchoCelda: 32,
  altoCelda: 32,
  columnas: 8,
  /** Frame por defecto: primer círculo tan (fila 2, col 0) */
  marcoFrame: 16,
  marcos: {
    tan: 16,
    crema: 17,
    grisOscuro: 18,
    grisClaro: 19,
  },
};

/**
 * Icons.png → 96×304, rejilla 6×19 de 16×16 px (iconos pequeños arriba).
 */
export const ICONS_SHEET = {
  textura: 'uiIcons',
  archivo: 'assets/images/Icons.png',
  anchoCelda: 16,
  altoCelda: 16,
  columnas: 6,
};

export const CONFIG_POR_DEFECTO = {
  marco: CIRCLE_MENU,
  icono: ICONS_SHEET,
};

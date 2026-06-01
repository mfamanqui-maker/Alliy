/**
 * Posición de cada carácter dentro de un bloque (10 columnas × 5 filas).
 * Fila 0: A–J | 1: K–T | 2: U–Z | 3: 0–9 | 4: símbolos
 */
export const CELDA = { columnas: 10, filas: 5 };

export const MAPA_CARACTERES = {
  A: [0, 0], B: [1, 0], C: [2, 0], D: [3, 0], E: [4, 0],
  F: [5, 0], G: [6, 0], H: [7, 0], I: [8, 0], J: [9, 0],
  K: [0, 1], L: [1, 1], M: [2, 1], N: [3, 1], O: [4, 1],
  P: [5, 1], Q: [6, 1], R: [7, 1], S: [8, 1], T: [9, 1],
  U: [1, 2], V: [0, 2], W: [2, 2], X: [3, 2], Y: [4, 2], Z: [5, 2],
  '0': [0, 3], '1': [1, 3], '2': [2, 3], '3': [3, 3], '4': [4, 3],
  '5': [5, 3], '6': [6, 3], '7': [7, 3], '8': [8, 3], '9': [9, 3],
  '.': [0, 4], ',': [1, 4], ':': [2, 4], ';': [2, 4],
  '?': [3, 4], '!': [4, 4], '(': [5, 4], ')': [6, 4],
  '+': [7, 4], '-': [8, 4], '=': [9, 4],
};

/**
 * Estilos del sheet Text1.png (varias franjas de color, misma forma fina).
 * bloque: índice de franja (0 = arriba, 1 = teal, 2 = naranja, …).
 */
export const ESTILOS_TEXTO = {
  gris: {
    textura: 'textPixel',
    archivo: 'assets/images/battle/panel/Text1.png',
    anchoCelda: 7,
    altoCelda: 9,
    altoBloque: 46,
    bloque: 0,
  },
  teal: {
    textura: 'textPixel',
    archivo: 'assets/images/battle/panel/Text1.png',
    anchoCelda: 7,
    altoCelda: 9,
    altoBloque: 46,
    bloque: 1,
  },
  naranja: {
    textura: 'textPixel',
    archivo: 'assets/images/battle/panel/Text1.png',
    anchoCelda: 7,
    altoCelda: 9,
    altoBloque: 46,
    bloque: 2,
  },
};

/** Forma gruesa con borde (Text2.png) — para cuando la necesites */
export const ESTILOS_TEXTO_GRUESO = {
  crema: {
    textura: 'textPixelGrueso',
    archivo: 'assets/images/battle/panel/Text2.png',
    anchoCelda: 5,
    altoCelda: 6,
    altoBloque: 37,
    bloque: 0,
  },
};

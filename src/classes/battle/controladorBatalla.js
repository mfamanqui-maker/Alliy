import tablero from './tablero.js';
/**
 * Orquestador de batalla (sin Phaser): tablero lógico, entidades y cola de acciones.
 * La escena solo instancia esto, pasa datos y reacciona a eventos visuales.
 */
export default class controladorBatalla {
  #configTablero;
  #casillasEspeciales;
  #equipos;
  #reglas;

  constructor(configTablero, casillasEspeciales, equipos, reglas) {
    this.#configTablero = configTablero;
    this.#equipos = equipos;
    this.#reglas  = reglas;
    this.#casillasEspeciales = casillasEspeciales;
  }

  get reglas() {
    return this.#reglas;
  }

  get equipos() {
    return this.#equipos;
  }

  /**
   * Genera el modelo de tablero y devuelve { arrayTablero, tamaño } para Phaser. 
   * ArrayTablero es un array bidimencional con las casillas del tablero.
   * Tamaño es el tamaño de la casilla en pixeles.
   */
  CrearTablero() {
    const modelo = new tablero(
      this.#configTablero,
      this.#casillasEspeciales,
      this.#equipos,
    );
    return { arrayTablero: modelo.arrayBidimencional, tamaño: this.#configTablero.tamaño };
  }
}

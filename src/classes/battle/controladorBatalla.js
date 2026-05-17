import tablero from './tablero.js';
import controladorTurnos from './controladorTurnos.js';
/**
 * Orquestador de batalla (sin Phaser): tablero lógico, entidades y cola de acciones.
 * La escena solo instancia esto, pasa datos y reacciona a eventos visuales.
 */
export default class controladorBatalla {
  #tablero;
  #casillasEspeciales;
  #equipos;
  #otros;
  #scene;

  constructor(scene, tablero, casillasEspeciales, equipos, otros) {
    this.#tablero = tablero;
    this.#equipos = equipos;
    this.#otros   = otros;
    this.#scene   = scene;
    this.#casillasEspeciales = casillasEspeciales;
  }

  get otros() {
    return this.#otros;
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
      this.#tablero,
      this.#casillasEspeciales,
      this.#equipos,
    );
    return { arrayTablero: modelo.arrayBidimencional, tamaño: this.#tablero.tamaño };
  }

  iniciarBatalla() {
    const tableroData = this.CrearTablero();
    this.#scene.scene.launch('tablero', {
      ArrayExportado: tableroData.arrayTablero,
      tamaño: tableroData.tamaño,
      controlador: this,
      pilaDetareas: this.pilaDetareas,
    });
    this.#scene.scene.launch('entidad', { equipos: this.equipos, arrayBidimencional: tableroData.arrayTablero });
    this.controladorTurnos = new controladorTurnos(tableroData.arrayTablero, this.#equipos, this.#otros);
    this.pilaDetareas = this.controladorTurnos.acciones; 
  }
}

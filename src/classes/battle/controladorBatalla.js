import tablero from './tablero.js';

export default class controladorBatalla extends Phaser.Scene {

  #tablero
  #casillasEspeciales
  #equipos
  #reglas


  constructor(tablero, casillasEspeciales, equipos, reglas) {
    super({ key : 'controladorBatalla' }); //pequeña trampita dx
    this.#tablero = tablero;
    this.#equipos = equipos;
    this.#reglas = reglas;
    this.#casillasEspeciales = casillasEspeciales;
  }

  CrearTablero() {
    const Tablero = new tablero(this.#tablero, this.#casillasEspeciales, this.#equipos); //PRIMER ERROR TONTO XD
    this.scene.launch('tablero', { Tablero });
    console.log(Tablero.arrayBidimencional);
    console.log(this.#casillasEspeciales);
  }
}


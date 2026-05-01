import tablero from './tablero.js';

export default class controladorBatalla {

  #tablero
  #casillasEspeciales
  #equipos
  #reglas


  constructor(tablero, casillasEspeciales, equipos, reglas) {
    this.#tablero = tablero;
    this.#equipos = equipos;
    this.#reglas = reglas;
    this.#casillasEspeciales = casillasEspeciales;
  }

  CrearTablero() {
    const Tablero = new tablero(this.#tablero, this.#casillasEspeciales, this.#equipos); //PRIMER ERROR TONTO XD
    return Tablero.arrayBidimencional;  
  }
}


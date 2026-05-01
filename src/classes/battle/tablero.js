export default class tablero{

  #filas
  #columnas
  #casillaId
  #casillasEspeciales
  #equipos

  constructor(tablero, casillasEspeciales, equipos, key) {
    this.#filas     =   tablero.filas;
    this.#columnas  =   tablero.columnas;
    this.#casillaId =   tablero.casillaId;
    this.#equipos   =   equipos;
    this.#casillasEspeciales = casillasEspeciales;
  }
  get arrayBidimencional() {
    const arrayTablero = Array.from({ length: this.#columnas }, () =>
      Array.from({ length: this.#filas }, () => ({ id: this.#casillaId, entidad: false })) 
    ); //crea un array bidimencional con parametros vaciós pero cada casilla tiene un espacio propiedo en la memoria

    this.#casillasEspeciales.forEach(casilla => {
      arrayTablero[casilla.posicion.y - 1][casilla.posicion.x - 1].id = casilla.id;
    });

    this.#equipos.Aliados.forEach(entidad => {
      arrayTablero[entidad.posicion.y - 1][entidad.posicion.x - 1].entidad = entidad.id;
    });

    this.#equipos.Enemigos.forEach(entidad => {
      arrayTablero[entidad.posicion.y - 1][entidad.posicion.x - 1].entidad = entidad.id;
    });

    return arrayTablero;
  }

  static buscarEntidadPorId(id, arrayBidimencional) { //devuelve un objeto con la posición de la entidad o un error si no se encuentra
    let busqueda = { x: null, y: null };
    for (let y = 0; y < arrayBidimencional.length; y++) {
      for (let x = 0; x < arrayBidimencional[y].length; x++) {
        if (arrayBidimencional[y][x].entidad === id) {
          busqueda.x = x + 1;
          busqueda.y = y + 1;
          return busqueda;
        }
      }
    }
    return console.error(`No se encontró la entidad con id ${id} en el tablero.`);
  }

  static calcularDistancia(idInicio, idDestino, arrayBidimencional) { //las entidades deben recibir ids que deben estar en el tablero

    const entidadInicio   = tablero.buscarEntidadPorId(idInicio, arrayBidimencional);
    const entidadDestino  = tablero.buscarEntidadPorId(idDestino, arrayBidimencional);
    const distanciaX = Math.abs(entidadInicio.x - entidadDestino.x);
    const distanciaY = Math.abs(entidadInicio.y - entidadDestino.y);
    return Math.sqrt((distanciaX ** 2) + (distanciaY ** 2));
  }

  static calcularArea(cordenadasCentro, radio , arrayBidimencional) { //devuelve un array con las posiciones de las casillas dentro del area cuadrada
    cordenadasCentro.x -= 1;
    cordenadasCentro.y -= 1;
    const area = [];
    for (let y = cordenadasCentro.y - radio; y <= cordenadasCentro.y + radio; y++) {
      if (y < 1 || y > arrayBidimencional.length) continue;
      const fila = [];
      for (let x = cordenadasCentro.x - radio; x <= cordenadasCentro.x + radio; x++) {
        if (x < 1 || x > arrayBidimencional[y].length) continue;
        fila.push({ x, y });
      }
      area.push(fila);
    }
    return area;
  }

  static calcularRayo(cordenadasOrigen, cordenasDestino, arrayBidimencional) { //devuelve un array con las posiciones de las casillas dentro de un rayo recto
    cordenadasOrigen.x -= 1;
    cordenadasOrigen.y -= 1;
    cordenasDestino.x -= 1;
    cordenasDestino.y -= 1;
    const rayo = [];
    if (cordenadasOrigen.x === cordenasDestino.x) {
      for (let y = cordenadasOrigen.y; y <= cordenasDestino.y; y++) {
        if (y < 1 || y > arrayBidimencional.length) continue;
        rayo.push({ x: cordenadasOrigen.x, y });
      }
    } else if (cordenadasOrigen.y === cordenasDestino.y) {
      for (let x = cordenadasOrigen.x; x <= cordenasDestino.x; x++) {
        if (x < 1 || x > arrayBidimencional[cordenadasOrigen.y].length) continue;
        rayo.push({ x, y: cordenadasOrigen.y });
      }
    } else if (tablero.calcularDistancia(cordenadasOrigen, cordenasDestino, arrayBidimencional) === cordenadasOrigen*Math.sqrt(2)) {
      for (let y = cordenadasOrigen.y; y <= cordenasDestino.y; y++) {
        if (y < 1 || y > arrayBidimencional.length) continue;
        rayo.push({ x: cordenadasOrigen.x, y });
      }
      for (let x = cordenadasOrigen.x; x <= cordenasDestino.x; x++) {
        if (x < 1 || x > arrayBidimencional[cordenadasOrigen.y].length) continue;
        rayo.push({ x, y: cordenadasOrigen.y });
      }
    } else {
      console.error('La destino ingresado es inválido.');
    }
    return rayo;
  }
}
export default class tablero {
  #filas;
  #columnas;
  #casillaId;
  #casillasEspeciales;
  #equipos;

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
        if (tablero._obtenerIdEntidad(arrayBidimencional[y][x].entidad) === tablero._normalizarId(id)) {
          busqueda.x = x + 1;
          busqueda.y = y + 1;
          return busqueda;
        }
      }
    }
    return console.error(`No se encontró la entidad con id ${id} en el tablero.`);
  }

  static _normalizarId(id) {
    if (id == null || id === '') return null;
    const numero = Number(id);
    return Number.isNaN(numero) ? String(id) : numero;
  }

  static _obtenerIdEntidad(entidad) {
    if (!entidad || entidad === false) return null;
    return tablero._normalizarId(
      entidad?.data?.id ??
      entidad?.datos?.id ??
      entidad?.aliadoEspecifico?.datos?.id ??
      entidad?.enemigoEspecifico?.datos?.id ??
      entidad?.id ??
      entidad
    );
  }

  static _obtenerEspecificoEntidad(entidad) {
    return entidad?.aliadoEspecifico ??
      entidad?.enemigoEspecifico ??
      (typeof entidad?.ubicarEnCasillaAsync === 'function' ? entidad : null);
  }

  static _actualizarPosicionEntidad(entidad, coordenadas) {
    if (entidad?.data) entidad.data.posicion = { x: coordenadas.x, y: coordenadas.y };
    if (entidad?.datos) entidad.datos.posicion = { x: coordenadas.x, y: coordenadas.y };
    if (entidad?.aliadoEspecifico?.datos) entidad.aliadoEspecifico.datos.posicion = { x: coordenadas.x, y: coordenadas.y };
    if (entidad?.enemigoEspecifico?.datos) entidad.enemigoEspecifico.datos.posicion = { x: coordenadas.x, y: coordenadas.y };
  }

  static moverEntidad(entidad, coordenadas, arrayBidimencional, escenaTablero = null) { //mueve una entidad a una nueva posición en el tablero
    if (!entidad || !coordenadas || !arrayBidimencional) return false;

    const idEntidad = tablero._obtenerIdEntidad(entidad);
    const viejaPosicion = tablero.buscarEntidadPorId(idEntidad, arrayBidimencional);
    if (!viejaPosicion?.x || !viejaPosicion?.y) return false;

    const origen = arrayBidimencional[viejaPosicion.y - 1]?.[viejaPosicion.x - 1];
    const destino = arrayBidimencional[coordenadas.y - 1]?.[coordenadas.x - 1];

    if (!origen || !destino) return false;
    if (destino.entidad && destino.entidad !== false) return false;

    const entidadMovida = origen.entidad && origen.entidad !== false ? origen.entidad : entidad;
    origen.entidad = false;
    destino.entidad = entidadMovida;

    tablero._actualizarPosicionEntidad(entidadMovida, coordenadas);
    if (entidadMovida !== entidad) tablero._actualizarPosicionEntidad(entidad, coordenadas);

    const especifico = tablero._obtenerEspecificoEntidad(entidadMovida) ?? tablero._obtenerEspecificoEntidad(entidad);
    const escena = escenaTablero ?? entidadMovida?.moldePhaser?.obtenerEscenaTablero?.();
    if (especifico?.ubicarEnCasillaAsync && escena) {
      return especifico.ubicarEnCasillaAsync(escena, {
        col: coordenadas.x,
        fila: coordenadas.y,
        tamanoCasilla: escena.tileSize,
        orientacion: entidadMovida?.enemigoEspecifico ? 'izquierda' : 'derecha',
      }).then(() => true);
    }

    return true;
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
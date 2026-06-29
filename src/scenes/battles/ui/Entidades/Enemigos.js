import { construirDatosDetalle } from './Aliados.js';

export default class Enemigos {
  constructor(data, sceneEntidad) {
    this.data = data;
    this.sceneEntidad = sceneEntidad;
    this.pilaDetareas = null;
    this.enemigoEspecifico = null;
  }

  obtenerEscenaTablero() {
    return this.sceneEntidad?.scene?.get?.('tablero');
  }

  iniciarEnemigo(enemigoEspecifico) {
    this.enemigoEspecifico = enemigoEspecifico ?? null;
    const tablero = this.obtenerEscenaTablero();
    const tileSize = tablero?.tileSize ?? 400;

    if (typeof enemigoEspecifico.construirAnimacionEstatica === 'function') {
      enemigoEspecifico.construirAnimacionEstatica(this.sceneEntidad);
    }

    if (!tablero) {
      return Promise.resolve();
    }

    return enemigoEspecifico.ubicarEnCasillaAsync(tablero, {
      col: this.data.posicion.x,
      fila: this.data.posicion.y,
      tamanoCasilla: tileSize,
      orientacion: 'izquierda',
    });
  }

  onSeleccionar(enemigoEspecifico, pilaDetareas) {
    this.pilaDetareas = pilaDetareas;
    this.enemigoEspecifico = enemigoEspecifico;
    if (!this.enemigoEspecifico) return;
    if (typeof this.enemigoEspecifico.propiedadesEspeciales === 'function') {
      this.enemigoEspecifico.propiedadesEspeciales(this.enemigoEspecifico);
    }
  }

  onDeseleccionar() {}

  obtenerDatosDetalle() {
    if (!this.enemigoEspecifico) return null;
    if (typeof this.enemigoEspecifico.propiedadesEspeciales === 'function') {
      this.enemigoEspecifico.propiedadesEspeciales(this.enemigoEspecifico);
    }
    return construirDatosDetalle(this.enemigoEspecifico, 'Enemigos');
  }
}

export function obtenerConfiguracionManual() {
  const JSONmanual = {
    "configuracion": [
      {
        "nombreDeAccion": "atacar",
        "id": "4",
        "objetivo": "1"
      },
      {
        "nombreDeAccion": "atacar",
        "id": "5",
        "objetivo": "2"
      },
      {
        "nombreDeAccion": "atacar",
        "id": "6",
        "objetivo": "3"
      }
    ]
  }
  return JSONmanual;
}

export function obtenerConfiguracionIA() {
  /**
   * Esta funcion sera la puerta entre python mas backend para obtener la configucion que fue razonada por la IA y ejecutada por el backend
   */
}

function normalizarId(id) {
  if (id == null || id === '') return null;
  const numero = Number(id);
  return Number.isNaN(numero) ? String(id) : numero;
}

function idsIguales(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

function obtenerIdEntidad(entidad) {
  return entidad?.data?.id ??
    entidad?.aliadoEspecifico?.datos?.id ??
    entidad?.enemigoEspecifico?.datos?.id ??
    entidad?.id ??
    null;
}

function obtenerEspecifico(entidad, bando) {
  if (bando === 'Aliados') return entidad?.aliadoEspecifico ?? null;
  if (bando === 'Enemigos') return entidad?.enemigoEspecifico ?? null;
  return entidad?.aliadoEspecifico ?? entidad?.enemigoEspecifico ?? null;
}

function normalizarListaEntidades(fuenteEntidades) {
  if (!fuenteEntidades) return { aliados: [], enemigos: [] };

  if (Array.isArray(fuenteEntidades) && Array.isArray(fuenteEntidades[0]) && Array.isArray(fuenteEntidades[1])) {
    const pareceTablero = fuenteEntidades.some((fila) =>
      fila?.some?.((casilla) => casilla?.entidad)
    );

    if (!pareceTablero) {
      return {
        aliados: fuenteEntidades[0] ?? [],
        enemigos: fuenteEntidades[1] ?? [],
      };
    }
  }

  if (Array.isArray(fuenteEntidades)) {
    const entidades = [];
    fuenteEntidades.forEach((fila) => {
      if (Array.isArray(fila)) {
        fila.forEach((casilla) => {
          if (casilla?.entidad) entidades.push(casilla.entidad);
        });
        return;
      }
      if (fila?.entidad) entidades.push(fila.entidad);
    });

    return {
      aliados: entidades.filter((entidad) => entidad?.aliadoEspecifico),
      enemigos: entidades.filter((entidad) => entidad?.enemigoEspecifico),
    };
  }

  return {
    aliados: fuenteEntidades.aliados ?? fuenteEntidades.Aliados ?? [],
    enemigos: fuenteEntidades.enemigos ?? fuenteEntidades.Enemigos ?? [],
  };
}

function buscarEntidadPorId(entidades, id) {
  return entidades.find((entidad) => idsIguales(obtenerIdEntidad(entidad), id)) ?? null;
}

function obtenerAccionesPlanas(entidad) {
  const acciones = entidad?.acciones;
  if (Array.isArray(acciones)) return acciones.flat().filter(Boolean);

  const lista = entidad?.enemigoEspecifico?.listaDeAcciones ?? entidad?.aliadoEspecifico?.listaDeAcciones;
  if (!lista) return [];

  return [
    ...(lista.habilidades ?? []),
    ...(lista.objetos ?? []),
    ...(lista.movimiento ?? []),
  ];
}

function buscarAccion(entidad, nombreDeAccion, accionId = null) {
  const nombreNormalizado = String(nombreDeAccion ?? '').toLowerCase();
  return obtenerAccionesPlanas(entidad).find((accion) => {
    const mismoNombre = String(accion?.nombre ?? '').toLowerCase() === nombreNormalizado;
    const mismaId = accionId == null || idsIguales(accion?.id, accionId);
    return mismoNombre && mismaId;
  }) ?? null;
}

function buscarObjetivo(aliados, enemigos, objetivoId) {
  const id = normalizarId(objetivoId);
  if (id == null) {
    return {
      bandoObjetivo: null,
      objetivo: null,
      objetivoEntidad: null,
    };
  }

  const aliado = buscarEntidadPorId(aliados, id);
  if (aliado) {
    return {
      bandoObjetivo: 'Aliados',
      objetivo: obtenerEspecifico(aliado, 'Aliados'),
      objetivoEntidad: aliado,
    };
  }

  const enemigo = buscarEntidadPorId(enemigos, id);
  if (enemigo) {
    return {
      bandoObjetivo: 'Enemigos',
      objetivo: obtenerEspecifico(enemigo, 'Enemigos'),
      objetivoEntidad: enemigo,
    };
  }

  console.warn('No se encontro el objetivo indicado por la IA', objetivoId);
  return {
    bandoObjetivo: null,
    objetivo: null,
    objetivoEntidad: null,
  };
}

export function normalizarConfiguracionIA(configuracionIA, fuenteEntidades) {
  const { aliados, enemigos } = normalizarListaEntidades(fuenteEntidades);
  const configuracion = configuracionIA?.configuracion ?? configuracionIA ?? [];

  if (!Array.isArray(configuracion)) {
    console.warn('La configuracion IA debe ser un array o tener una propiedad configuracion');
    return [];
  }

  return configuracion
    .map((fila) => {
      const enemigoId = normalizarId(fila?.id ?? fila?.enemigoId);
      const accionNombre = fila?.nombreDeAccion ?? fila?.accionNombre;
      const accionId = fila?.accionId ?? null;
      const enemigoEntidad = buscarEntidadPorId(enemigos, enemigoId);

      if (!enemigoEntidad) {
        console.warn('No se encontro el enemigo indicado por la IA', enemigoId);
        return null;
      }

      const accion = buscarAccion(enemigoEntidad, accionNombre, accionId);
      if (!accion) {
        console.warn('No se encontro la accion indicada por la IA', accionNombre, enemigoId);
        return null;
      }

      let objetivo = buscarObjetivo(aliados, enemigos, fila?.objetivo ?? fila?.objetivoId);
      const objetivoSolicitado = fila?.objetivo ?? fila?.objetivoId;
      // Si el objetivo configurado ya no existe (p.ej. el aliado murio o se retiro),
      // se reasigna a un aliado vivo para que el enemigo no dispare al vacio.
      if (objetivoSolicitado != null && objetivoSolicitado !== '' && !objetivo.objetivoEntidad && aliados.length > 0) {
        const reemplazo = aliados[0];
        objetivo = {
          bandoObjetivo: 'Aliados',
          objetivo: obtenerEspecifico(reemplazo, 'Aliados'),
          objetivoEntidad: reemplazo,
        };
      }
      const enemigo = obtenerEspecifico(enemigoEntidad, 'Enemigos');
      const velocidad = Number(accion.velocidad ?? enemigo?.estadisticas?.velocidad ?? 0);

      return {
        accion: {
          ...accion,
          velocidad: Number.isFinite(velocidad) ? velocidad : 0,
        },
        enemigo,
        aliado: enemigo,
        bandoObjetivo: objetivo.bandoObjetivo,
        entidad: enemigoEntidad,
        objetivo: objetivo.objetivo,
        objetivoEntidad: objetivo.objetivoEntidad,
      };
    })
    .filter(Boolean);
}
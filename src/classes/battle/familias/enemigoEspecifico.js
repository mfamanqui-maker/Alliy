import Soldado1 from './realistas/soldado1.js';

/**
 * Mapa arquetipo (minúsculas) → clase concreta enemiga.
 */
export const REGISTRO_ENEMIGO_POR_ARQUETIPO = {
  soldado1: Soldado1,
};

function normalizarArquetipo(valor) {
  return String(valor ?? '').trim().toLowerCase();
}

/**
 * @param {import('./bases/baseGeneral.js').DatosEntidad} datos
 */
export function resolverClaseEnemigo(datos) {
  const key = normalizarArquetipo(datos.arquetipo ?? datos.tipo);
  const Clase = REGISTRO_ENEMIGO_POR_ARQUETIPO[key];
  if (!Clase) {
    throw new Error(
      `[enemigoEspecifico] Arquetipo enemigo desconocido: "${datos.arquetipo}". ` +
        `Registra la clase en REGISTRO_ENEMIGO_POR_ARQUETIPO (clave: ${key || '(vacío)'}).`,
    );
  }
  return Clase;
}

/**
 * @param {{ Enemigos?: import('./bases/baseGeneral.js').DatosEntidad[] }} lista
 * @returns {Map<number, import('./bases/baseGeneral.js').default>}
 */
export function construirMapaEnemigosPorId(lista) {
  const mapa = new Map();
  for (const row of lista) {
    const Clase = resolverClaseEnemigo(row);
    mapa.set(row.id, new Clase(row));
  }
  return mapa;
}

/**
  * @param {{ Enemigos?: import('./bases/baseGeneral.js').DatosEntidad[] }} lista
 */
export function crearRegistroEnemigos(lista) {
  const porId = construirMapaEnemigosPorId(lista);
  return {
    porId,
    obtenerPorId(id) {
      return porId.get(id);
    },
    todos() {
      return [...porId.values()];
    },
    ids() {
      return [...porId.keys()];
    },
  };
}

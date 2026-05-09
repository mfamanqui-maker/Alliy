import Lumel from './campesinos/lumel.js';
import Brunn from './campesinos/brunn.js';

/**
 * Mapa arquetipo (minúsculas) → clase concreta aliada.
 * Al añadir un personaje nuevo: importa la clase y regístrala aquí.
 */
export const REGISTRO_ALIADO_POR_ARQUETIPO = {
  lumel: Lumel,
  brunn: Brunn,
};

function normalizarArquetipo(valor) {
  return String(valor ?? '').trim().toLowerCase();
}

/**
 * Devuelve la clase JS correcta para una fila de aliado (sin instanciar).
 * Usa `datos.arquetipo` o `datos.tipo` como clave del registro.
 *
 * @param {import('./bases/baseGeneral.js').DatosEntidad} datos
 * @returns {typeof import('./campesinos/lumel.js').default}
 */
export function resolverClaseAliado(datos) {
  const key = normalizarArquetipo(datos.arquetipo ?? datos.tipo);
  const Clase = REGISTRO_ALIADO_POR_ARQUETIPO[key];
  if (!Clase) {
    throw new Error(
      `[aliadoEspecifico] Arquetipo aliado desconocido: "${datos.arquetipo}". ` +
        `Registra la clase en REGISTRO_ALIADO_POR_ARQUETIPO (clave: ${key || '(vacío)'}).`,
    );
  }
  return Clase;
}

/**
 * Construye `Map<id, instancia>` recorriendo `lista`.
 * Cada instancia es de la subclase correcta (herencia: BaseGeneral → familia → personaje).
 *
 * @param {{ Aliados?: import('./bases/baseGeneral.js').DatosEntidad[] }} lista
 * @returns {Map<number, import('./bases/baseGeneral.js').default>}
 */
export function construirMapaAliadosPorId(lista) {
  const mapa = new Map();
  for (const row of lista) {
    const Clase = resolverClaseAliado(row);
    mapa.set(row.id, new Clase(row));
  }
  return mapa;
}

/**
 * API cómoda: objeto con mapa y acceso por id (sin variables globales).
 *
 * @param {{ Aliados?: import('./bases/baseGeneral.js').DatosEntidad[] }} lista
 */

export function crearRegistroAliados(lista) {
  const porId = construirMapaAliadosPorId(lista);
  return {
    porId,
    /** @param {number} id */
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

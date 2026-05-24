import BaseGeneral from './baseGeneral.js';

/**
 * Métodos compartidos por la familia Campesinos (antes de personajes concretos como Lumel).
 */
export default class BaseCampesinos extends BaseGeneral {
  /** @param {import('./baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  familiaCampesinos() {
    return true;
  }
}

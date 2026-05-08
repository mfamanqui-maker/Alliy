import BaseGeneral from './baseGeneral.js';

/**
 * Métodos compartidos por la familia Realistas (soldados, etc.).
 */
export default class BaseRealistas extends BaseGeneral {
  /** @param {import('./baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  familiaRealistas() {
    return true;
  }
}

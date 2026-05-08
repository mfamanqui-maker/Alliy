import BaseRealistas from '../bases/baseRealistas.js';

export default class Soldado1 extends BaseRealistas {
  /** @param {import('../bases/baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  nombreArquetipo() {
    return 'soldado1';
  }
}

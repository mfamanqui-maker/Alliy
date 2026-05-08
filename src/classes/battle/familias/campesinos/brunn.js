import BaseCampesinos from '../bases/baseCampesinos.js';

export default class Brunn extends BaseCampesinos {
  /** @param {import('../bases/baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  nombreArquetipo() {
    return 'brunn';
  }
}

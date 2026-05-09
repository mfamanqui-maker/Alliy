/**
 * Orquestación visual de un aliado sobre el tablero.
 * Los sprites se crean en la escena `tablero` para compartir cámara, zoom y pan.
 */
export default class Aliados {
  /**
   * @param {import('../../../classes/battle/familias/bases/baseGeneral.js').DatosEntidad} data
   * @param {Phaser.Scene} sceneEntidad - instancia de la escena `entidad` (no el ScenePlugin `this.scene`)
   */
  constructor(data, sceneEntidad) {
    this.data = data;
    this.sceneEntidad = sceneEntidad;
  }

  /** @returns {Phaser.Scene | undefined} */
  obtenerEscenaTablero() {
    return this.sceneEntidad?.scene?.get?.('tablero');
  }

  /**
   * Registra animaciones (si el arquetipo las define), coloca el sprite en `tablero` y reproduce en el siguiente tick.
   * Devuelve Promise para encadenar muchos aliados (`Promise.all`, etc.).
   *
   * @param {import('../../../classes/battle/familias/bases/baseGeneral.js').default} aliadoEspecifico
   * @returns {Promise<unknown>}
   */
  iniciarAliado(aliadoEspecifico) {
    const tablero = this.obtenerEscenaTablero();
    const tileSize = tablero?.tileSize ?? 400;

    if (typeof aliadoEspecifico.construirAnimacionEstatica === 'function') {
      aliadoEspecifico.construirAnimacionEstatica(this.sceneEntidad);
    }

    if (!tablero) {
      return Promise.resolve();
    }

    return aliadoEspecifico.ubicarEnCasillaAsync(tablero, {
      col: this.data.posicion.x,
      fila: this.data.posicion.y,
      tamanoCasilla: tileSize,
      orientacion: 'derecha',
    });
  }
}

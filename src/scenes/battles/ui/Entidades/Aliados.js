import { abrirPanelInferior } from '../PanelInferior/index.js';

export default class Aliados {
  /**
   * @param {import('../../../../classes/battle/familias/bases/baseGeneral.js').DatosEntidad} data
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
   * @param {import('../../../../classes/battle/familias/bases/baseGeneral.js').default} aliadoEspecifico
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

  coneccionGeneral(aliadoEspecifico, pilaDetareas) {
    this.pilaDetareas = pilaDetareas;
    this.aliadoEspecifico = aliadoEspecifico;
    const scene = this.sceneEntidad;
    this.aliadoEspecifico.generarEstadisticas(this.aliadoEspecifico);
    const datos = {
      imagen: 'assets/images/candle.png',
      nombre: this.aliadoEspecifico.datos.arquetipo,
      vida: {
        vidaActual: this.aliadoEspecifico.estadisticas.hp,
        vidaMaxima: this.aliadoEspecifico.estadisticas.hp,
      },
      estadisticas: [
        {icono: 'assets/images/candle.png', nombre: 'ATK', cantidad: this.aliadoEspecifico.estadisticas.ataque},
        {icono: 'assets/images/candle.png', nombre: 'DEF', cantidad: this.aliadoEspecifico.estadisticas.defensa}, 
        {icono: 'assets/images/candle.png', nombre: 'VELOCIDAD', cantidad: this.aliadoEspecifico.estadisticas.velocidad}, 
        {icono: 'assets/images/candle.png', nombre: 'NIVEL', cantidad: this.aliadoEspecifico.estadisticas.nivel},
      ]
    };
    this.panel = abrirPanelInferior(scene, datos, {
      onCerrar: () => {
        this.panel = null;
      },
    });
  }
}

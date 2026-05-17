import BaseCampesinos from '../bases/baseCampesinos.js';
import { registrarAnimacionesDesdeSpritesheet } from '../bases/phaserMoldFactory.js';

export default class Brunn extends BaseCampesinos {
  /** @param {import('../bases/baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  construirAnimacionEstatica(scene) {
    registrarAnimacionesDesdeSpritesheet(scene, 'brunnStatic', [{
      key: 'brunn_static',
      startFrame: 0,
      endFrame: 7,
      frameRate: 10,
      repeat: -1,
    }]);
  }

  obtenerConfigAnimacionEstatica() {
    return {
      molde: { textureKey: 'brunnStatic', frame: 0, escala: 9 },
      animKey: 'brunn_static',
    };
  }

  generarEstadisticas(aliadoEspecifico) {
    const n = aliadoEspecifico.datos.nivel;
    aliadoEspecifico.estadisticas = {
      hp : 100 * n,
      ataque : 10 * n,
      velocidad : 10,
      escudos : 10 * n,
      curas : 10 * n,
      balas : 10 * n,
    }
  }
}

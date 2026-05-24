import BaseRealistas from '../bases/baseRealistas.js';
import { registrarAnimacionesDesdeSpritesheet } from '../bases/phaserMoldFactory.js';

export default class Soldado1 extends BaseRealistas {
  /** @param {import('../bases/baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  construirAnimacionEstatica(scene) {
    registrarAnimacionesDesdeSpritesheet(scene, 'soldado1Static', [{
      key: 'soldado1_static',
      startFrame: 0,
      endFrame: 5,
      frameRate: 10,
      repeat: -1,
    }]);
  }
  
  obtenerConfigAnimacionEstatica() {
    return {
      molde: { textureKey: 'soldado1Static', frame: 0, escala: 9 },
      animKey: 'soldado1_static',
    };
  }

  propiedadesEspeciales(aliadoEspecifico) {
    const n = aliadoEspecifico.datos.nivel;
    aliadoEspecifico.estadisticas = {
      hp : 200 * n,
      ataque : 15 * n,
      velocidad : 10,
      escudos : 5 * n,
      curas : 0,
      balas : 0,
    }
  }
}

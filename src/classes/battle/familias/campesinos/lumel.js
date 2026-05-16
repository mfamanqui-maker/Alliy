import BaseCampesinos from '../bases/baseCampesinos.js';
import { registrarAnimacionesDesdeSpritesheet } from '../bases/phaserMoldFactory.js';

export default class Lumel extends BaseCampesinos {
  /** @param {import('../bases/baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  /**
   * La textura `lumelStatic` debe estar encolada en `preload` de la escena (p. ej. `entidadScene`).
   * Aquí solo se registran las animaciones cuando la textura ya existe en `create`.
   */
  construirAnimacionEstatica(scene) {
    registrarAnimacionesDesdeSpritesheet(scene, 'lumelStatic', [{
      key: 'lumel_static',
      startFrame: 0,
      endFrame: 5,
      frameRate: 10,
      repeat: -1,
    }]);
  }

  /** Usado por `BaseGeneral.ubicarEnCasillaAsync` para crear el sprite y reproducir la anim. */
  obtenerConfigAnimacionEstatica() {
    return {
      molde: { textureKey: 'lumelStatic', frame: 0, escala: 9 },
      animKey: 'lumel_static',
    };
  }

  pruebaDeConexion() {
    return ('exito', 'clase lumel');
  }
}

/**
 * Raíz de todas las entidades de batalla (aliadas y enemigas).
 * Aquí van métodos y estado común; las familias y personajes concretos extienden esta clase.
 *
 * @typedef {Object} DatosEntidad
 * @property {number} id
 * @property {string} familia
 * @property {string} [arquetipo] - clave del registro (ej. 'lumel', 'soldado1')
 * @property {string[]} [invetario]
 * @property {number} [nivel]
 * @property {{ x: number, y: number }} [posicion]
 */

import { crearSpriteDesdeMolde, prepararSpriteEnTablero } from './phaserMoldFactory.js';
/**
 * @typedef {import('./phaserMoldFactory.js').MoldeSprite} MoldeSprite
 */

/**
 * @typedef {Object} ConfigAnimacionEstatica
 * @property {MoldeSprite} molde - textura ya cargada en la escena
 * @property {string} animKey - clave registrada con `registrarAnimacionesDesdeSpritesheet`
 */

export default class BaseGeneral {
  /**
   * @param {DatosEntidad} datos - Fila tal cual viene de `equipos.Aliados` / `equipos.Enemigos`.
   */
  constructor(datos) {
    /** @type {DatosEntidad} */
    this.datos = datos;
    this.id = datos.id;
    /** @type {Phaser.GameObjects.Sprite | null} */
    this.sprite = null;
    /** @type {{ cancelado: boolean, timerEvents: Phaser.Time.TimerEvent[] } | null} */
    this._ubicarControl = null;
  }

  obtenerId() {
    return this.id;
  }

  obtenerDatos() {
    return this.datos;
  }

  /** Override en personaje concreto para devolver molde + clave de anim estática. */
  obtenerConfigAnimacionEstatica() {
    return null; //xD
  }

  /**
   * Detiene la animación en curso y marca como cancelado cualquier `ubicarEnCasillaAsync` pendiente.
   */
  cancelarUbicacionAnimacion() {
    if (this._ubicarControl) {
      this._ubicarControl.cancelado = true;
      for (const ev of this._ubicarControl.timerEvents) {
        ev.remove(false);
      }
      this._ubicarControl = null;
    }
    if (this.sprite?.anims?.isPlaying) {
      this.sprite.anims.stop();
    }
  }

  /**
   * Convierte casilla 1-based (igual que `datos.posicion` en batalla) a centro en coordenadas de mundo.
   *
   * @param {number} col - columna 1..N
   * @param {number} fila - fila 1..N
   * @param {number} tamanoCasilla - píxeles (ej. 400 como `tableroScene.tileSize`)
   */
  casillaAMundoCentro(col, fila, tamanoCasilla) {
    const px = (col - 1) * tamanoCasilla + tamanoCasilla / 2;
    const py = (fila - 1) * tamanoCasilla + tamanoCasilla / 2 - 80;
    return { x: px, y: py };
  }

  /**
   * Ubica el sprite en la casilla y arranca la animación estática en el siguiente tick (asíncrono).
   * Llama a `cancelarUbicacionAnimacion()` antes de empezar, de modo que una nueva ubicación corta la anterior.
   *
   * Si `obtenerConfigAnimacionEstatica()` devuelve `null`, solo actualiza `datos.posicion` y resuelve al instante.
   *
   * @param {Phaser.Scene} scene - Escena del **tablero** (misma cámara que zoom y pan de casillas)
   * @param {{ col: number, fila: number, tamanoCasilla?: number, orientacion?: string }} opts
   * @returns {Promise<BaseGeneral>}
   */
  ubicarEnCasillaAsync(scene, opts) {
    const { col, fila, tamanoCasilla = 400, orientacion } = opts;
    this.cancelarUbicacionAnimacion(); 

    this.datos.posicion = { x: col, y: fila };

    const config = this.obtenerConfigAnimacionEstatica();
    if (!config || !scene) {
      return Promise.resolve(this);
    }

    const { x, y } = this.casillaAMundoCentro(col, fila, tamanoCasilla);
    const control = { cancelado: false, timerEvents: [] };
    this._ubicarControl = control;

    if (!this.sprite) {
      this.sprite = crearSpriteDesdeMolde(scene, x, y, config.molde, orientacion);
    } else {
      this.sprite.setPosition(x, y);
    }
    prepararSpriteEnTablero(this.sprite, scene);

    return new Promise((resolve) => {
      const ev = scene.time.delayedCall(0, () => {
        if (control.cancelado) {
          resolve(this);
          return;
        }
        if (config.animKey && this.sprite) {
          this.sprite.play(config.animKey);
        }
        resolve(this);
      });
      control.timerEvents.push(ev);
    });
  }

  /** Override en subclases si cada uno tiene nombre distinto. */
  etiquetaDebug() {
    return `${this.constructor.name} # ${this.id}`;
  }
}

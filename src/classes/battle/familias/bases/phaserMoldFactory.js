/**
 * Moldes reutilizables para Phaser 3: sprites + animaciones desde spritesheets.
 *
 * Flujo típico:
 * 1) En `preload` de la escena: `precargarSpritesheet(this, clave, ruta, anchoFrame, altoFrame)`.
 * 2) En `create`: `registrarAnimacionesDesdeSpritesheet(this, clave, definiciones)`.
 * 3) `crearSpriteDesdeMolde(this, x, y, molde)` y luego `sprite.play('nombreAnim')`.
 */

/**
 * Registra un spritesheet para cargar en esta escena (llamar solo dentro de `preload`).
 * Phaser corta la imagen en una cuadrícula de frames de tamaño fijo.
 *
 * @param {Phaser.Scene} scene - La escena (`this` dentro de preload).
 * @param {string} key - Clave única; misma que usarás en sprites y anims.
 * @param {string} assetPath - Ruta al PNG (ej. desde `/assets/...`).
 * @param {number} frameWidth - Ancho de cada frame en píxeles.
 * @param {number} frameHeight - Alto de cada frame en píxeles.
 */
export function precargarSpritesheet(scene, key, assetPath, frameWidth, frameHeight) {
  scene.load.spritesheet(key, assetPath, { frameWidth, frameHeight });
}

/**
 * Crea animaciones en el AnimationManager a partir de una spritesheet ya cargada.
 * Cada entrada describe un rango de frames consecutivos y cómo se reproduce.
 *
 * @param {Phaser.Scene} scene
 * @param {string} spritesheetKey - La misma `key` de `precargarSpritesheet`.
 * @param {Array<{
 *   key: string,
 *   startFrame?: number,
 *   endFrame?: number,
 *   frameRate?: number,
 *   repeat?: number
 * }>} definiciones - `repeat: -1` = loop; `0` = una vez.
 */

export function registrarAnimacionesDesdeSpritesheet(scene, spritesheetKey, definiciones) {
  if (!scene?.anims || !Array.isArray(definiciones)) {
    return;
  }
  const anims = scene.anims;
  definiciones.forEach((def) => {
    if (!def || def.key == null) {
      return;
    }
    if (typeof anims.get === 'function' && anims.get(def.key)) {
      return;
    }
    const start = def.startFrame ?? 0;
    const end = def.endFrame ?? start;
    scene.anims.create({
      key: def.key,
      frames: scene.anims.generateFrameNumbers(spritesheetKey, { start, end }),
      frameRate: def.frameRate ?? 12,
      repeat: def.repeat ?? -1,
    });
  });
}

/**
 * Molde: plantilla de cómo instanciar un sprite (textura, escala, profundidad).
 *
 * @typedef {object} MoldeSprite
 * @property {string} textureKey - Clave de imagen/spritesheet cargada.
 * @property {string|number} [frame] - Frame inicial si es spritesheet.
 * @property {number} [escala]
 * @property {number} [depth] - Orden de dibujado (mayor = encima).
 */

/**
 * Crea un `Phaser.GameObjects.Sprite` según un molde (sin reproducir animación aún).
 *
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {MoldeSprite} molde
 * @returns {Phaser.GameObjects.Sprite}
 */

/**
 * Ajusta scroll con la cámara del tablero y dibuja por encima de las casillas gráficas.
 *
 * @param {Phaser.GameObjects.Sprite | null} sprite
 * @param {Phaser.Scene} tableroScene
 */
export function prepararSpriteEnTablero(sprite, tableroScene) {
  if (!sprite || !tableroScene) {
    return;
  }
  sprite.setScrollFactor(1, 1);
  sprite.setDepth(8);
}

export function crearSpriteDesdeMolde(scene, x, y, molde) {
  const sprite = scene.add.sprite(x, y, molde.textureKey, molde.frame ?? 0)
    .setOrigin(0.5)
    .setFlipX(true)
  if (molde.escala != null) {
    sprite.setScale(molde.escala);
  }
  if (molde.depth != null) {
    sprite.setDepth(molde.depth);
  }
  return sprite;
}

/**
 * Combina molde + nombre de animación ya registrada; opcionalmente la reproduce.
 *
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {MoldeSprite} molde
 * @param {string} [animKey] - Si se pasa, hace `play` inmediato.
 */

export function crearSpriteAnimadoDesdeMolde(scene, x, y, molde, animKey) {
  const sprite = crearSpriteDesdeMolde(scene, x, y, molde);
  if (animKey) {
    sprite.play(animKey);
  }
  return sprite;
}


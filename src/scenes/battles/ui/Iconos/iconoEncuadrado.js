import { CONFIG_POR_DEFECTO, CIRCLE_MENU, ICONS_SHEET } from './iconoEncuadradoConfig.js';

/**
 * Índice de frame en un spritesheet uniforme.
 */
export function frameDesdeCelda(columnas, col, fila) {
  return fila * columnas + col;
}

function normalizarCapa(capa, defecto) {
  return { ...defecto, ...capa };
}

/**
 * Precarga una capa (marco o icono).
 * @param {Phaser.Scene} scene
 * @param {object} capa
 * @param {'spritesheet'|'image'} [capa.tipo='spritesheet']
 */
export function precargarCapa(scene, capa) {
  if (!capa?.textura || !capa?.archivo) return;
  if (scene.textures.exists(capa.textura)) return;

  if (capa.tipo === 'image') {
    scene.load.image(capa.textura, capa.archivo);
    return;
  }

  scene.load.spritesheet(capa.textura, capa.archivo, {
    frameWidth: capa.anchoCelda,
    frameHeight: capa.altoCelda,
  });
}

/** Precarga Circle_menu + Icons (o el par que pases). */
export function precargarIconosUI(scene, config = CONFIG_POR_DEFECTO) {
  precargarCapa(scene, config.marco);
  precargarCapa(scene, config.icono);
}

function resolverFrame(capa) {
  if (capa.frame != null) return capa.frame;
  if (capa.col != null && capa.fila != null && capa.columnas != null) {
    return frameDesdeCelda(capa.columnas, capa.col, capa.fila);
  }
  return 0;
}

function crearVisualCapa(scene, capa) {
  const frame = resolverFrame(capa);
  const textura = scene.textures.get(capa.textura);

  if (capa.tipo === 'image' || textura.frameTotal <= 1) {
    const img = scene.add.image(0, 0, capa.textura);
    if (capa.col != null && capa.fila != null) {
      const w = capa.anchoCelda ?? 16;
      const h = capa.altoCelda ?? 16;
      img.setCrop(capa.col * w, capa.fila * h, w, h);
    }
    return img;
  }

  return scene.add.sprite(0, 0, capa.textura, frame);
}

/**
 * Crea un icono centrado dentro de un marco circular (u otro sheet de marco).
 *
 * @param {Phaser.Scene} scene
 * @param {object} opciones
 * @param {number} [opciones.x=0]
 * @param {number} [opciones.y=0]
 * @param {object} opciones.icono - capa del icono (textura, frame o col/fila, archivo…)
 * @param {object} [opciones.marco] - capa del marco; por defecto Circle_menu
 * @param {number} [opciones.escala=1] - escala de marco e icono
 * @param {number} [opciones.escalaMarco]
 * @param {number} [opciones.escalaIcono]
 * @param {{x?:number,y?:number}} [opciones.offsetIcono] - ajuste fino del icono
 * @param {number} [opciones.depth]
 * @returns {Phaser.GameObjects.Container}
 *
 * @example
 * precargarIconosUI(this);
 * // Tras load complete:
 * crearIconoEncuadrado(this, {
 *   x: 400, y: 300,
 *   icono: { textura: 'uiIcons', frame: 5 },
 *   marco: { textura: 'uiCircleMenu', frame: 16 },
 *   escala: 2,
 * });
 *
 * @example
 * // Otro sheet de iconos (spritesheet propio)
 * precargarCapa(this, { textura: 'misIconos', archivo: 'assets/...', anchoCelda: 32, altoCelda: 32 });
 * crearIconoEncuadrado(this, {
 *   x: 100, y: 100,
 *   icono: { textura: 'misIconos', frame: 0 },
 * });
 */
export function crearIconoEncuadrado(scene, opciones) {
  const marcoCfg = normalizarCapa(opciones.marco ?? {}, {
    ...CIRCLE_MENU,
    frame: opciones.marco?.frame ?? CIRCLE_MENU.marcoFrame,
    columnas: CIRCLE_MENU.columnas,
  });

  const iconoCfg = normalizarCapa(opciones.icono ?? {}, {
    ...ICONS_SHEET,
    columnas: ICONS_SHEET.columnas,
  });

  if (!iconoCfg.textura) {
    console.warn('iconoEncuadrado: falta configuración de icono.');
    return scene.add.container(opciones.x ?? 0, opciones.y ?? 0);
  }

  const escalaBase = opciones.escala ?? 1;
  const escalaMarco = opciones.escalaMarco ?? escalaBase;
  const escalaIcono = opciones.escalaIcono ?? escalaBase;

  const container = scene.add.container(opciones.x ?? 0, opciones.y ?? 0);
  container.setDepth(opciones.depth ?? 0);

  let marco = null;
  if (scene.textures.exists(marcoCfg.textura)) {
    marco = crearVisualCapa(scene, marcoCfg);
    marco.setOrigin(0.5);
    marco.setScale(escalaMarco);
    marco.setDepth(0);
    container.add(marco);
  }

  if (!scene.textures.exists(iconoCfg.textura)) {
    console.warn(`iconoEncuadrado: textura "${iconoCfg.textura}" no cargada.`);
    return container;
  }

  const icono = crearVisualCapa(scene, iconoCfg);
  icono.setOrigin(0.5);
  icono.setScale(escalaIcono);
  icono.setDepth(1);
  icono.x = opciones.offsetIcono?.x ?? 0;
  icono.y = opciones.offsetIcono?.y ?? 0;
  container.add(icono);

  container.marco = marco;
  container.icono = icono;

  return container;
}

export { CIRCLE_MENU, ICONS_SHEET, CONFIG_POR_DEFECTO };

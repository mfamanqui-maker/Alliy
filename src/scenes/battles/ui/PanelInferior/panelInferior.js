import { crearBarraVidaRect } from '../BarraVida/index.js';
import {
  precargarTodosLosTextos,
  registrarTodosLosFramesTexto,
  crearTexto,
  medirTexto,
} from '../GenerarTexto/textoPixel.js';
import { MAIN_MENU, MAIN_TILES, LAYOUT, PANEL_DEFECTO, frameMainTiles } from './panelInferiorConfig.js';

export function claveTexturaDesdeRuta(ruta) {
  return `ui_img_${String(ruta).replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

export function precargarPanelInferior(scene, datos = null) {
  if (!scene?.load?.image) {
    console.warn('panelInferior: se necesita la instancia de Scene (scene.load).');
    return;
  }

  if (!scene.textures.exists(MAIN_MENU.textura)) {
    scene.load.spritesheet(MAIN_MENU.textura, MAIN_MENU.archivo, {
      frameWidth: MAIN_MENU.anchoCelda,
      frameHeight: MAIN_MENU.altoCelda,
    });
  }
  if (!scene.textures.exists(MAIN_TILES.textura)) {
    scene.load.spritesheet(MAIN_TILES.textura, MAIN_TILES.archivo, {
      frameWidth: MAIN_TILES.anchoCelda,
      frameHeight: MAIN_TILES.altoCelda,
    });
  }

  precargarTodosLosTextos(scene);

  const rutas = new Set();
  if (datos?.imagen) rutas.add(datos.imagen);
  (datos?.estadisticas ?? []).forEach((s) => {
    if (s?.icono) rutas.add(s.icono);
  });

  rutas.forEach((ruta) => {
    const clave = claveTexturaDesdeRuta(ruta);
    if (!scene.textures.exists(clave)) {
      scene.load.image(clave, ruta);
    }
  });
}

export function abrirPanelInferior(scene, datos, opciones = {}) {
  precargarPanelInferior(scene, datos);

  const texturaLista = () => scene.textures.exists('textPixel');

  const abrir = () => {
    if (!texturaLista()) {
      precargarTodosLosTextos(scene);
      if (scene.load.list.size > 0) {
        scene.load.once('complete', abrir);
        if (!scene.load.isLoading()) scene.load.start();
        return null;
      }
      console.warn('panelInferior: textPixel no disponible; panel sin texto.');
    } else {
      registrarTodosLosFramesTexto(scene);
    }

    if (scene.panelInferiorActivo) {
      scene.panelInferiorActivo.destroy();
    }
    scene.panelInferiorActivo = crearPanelInferior(scene, datos, opciones);
    return scene.panelInferiorActivo;
  };

  if (scene.load.list.size > 0) {
    scene.load.once('complete', abrir);
    if (!scene.load.isLoading()) scene.load.start();
    return null;
  }

  return abrir();
}

function calcularLayoutPanel(anchoPanel, altoPanel) {
  const r = LAYOUT.retrato;
  const z = LAYOUT.zonaCentral;
  const e = LAYOUT.estadisticas;

  const retratoTam = Math.min(altoPanel * r.fraccionAlto, r.maxTamano);
  const offsetX = r.offsetX ?? 0;
  const offsetY = r.offsetY ?? 0;
  const retratoX = r.margenIzquierdo + retratoTam / 2 + offsetX;
  const retratoY = altoPanel / 2 + offsetY;

  const contenidoX =
    r.margenIzquierdo + retratoTam + offsetX + (z.gapRetratoContenido ?? 12);
  const lineaY = altoPanel * z.fraccionY;

  const statsY = altoPanel * e.fraccionY;
  const statsInicioX = Math.max(contenidoX, anchoPanel * e.inicioXFraccion);
  const statsAnchoTotal = Math.max(
    anchoPanel - statsInicioX - e.margenDerechoReserva,
    160
  );

  return {
    retratoTam,
    retratoX,
    retratoY,
    contenidoX,
    lineaY,
    barraAlto: z.barraAlto,
    barraAnchoMax: z.barraAnchoMax,
    barraAnchoFraccion: z.barraAnchoFraccion,
    gapNombreBarra: z.gapNombreBarra,
    nombreEscala: z.nombreEscala,
    margenDerechoBarra: e.margenDerechoReserva,
    statsY,
    statsInicioX,
    statsAnchoTotal,
    altoPanel,
  };
}

function crearRetratoCuadrado(scene, ruta, x, y, tamano) {
  const clave = claveTexturaDesdeRuta(ruta);
  if (!scene.textures.exists(clave)) {
    console.warn(`panelInferior: imagen no cargada: ${ruta}`);
    return null;
  }

  const img = scene.add.image(x, y, clave);
  img.setOrigin(0.5);
  img.setDisplaySize(tamano, tamano);
  return img;
}

function crearIconoStat(scene, ruta, x, y, tamano) {
  const clave = claveTexturaDesdeRuta(ruta);
  if (!scene.textures.exists(clave)) {
    console.warn(`panelInferior: imagen no cargada: ${ruta}`);
    return null;
  }

  const img = scene.add.image(x, y, clave);
  img.setOrigin(0, 0.5);
  img.setDisplaySize(tamano, tamano);
  return img;
}

function crearFondoPanel(scene, anchoPanel, altoPanel) {
  const { rotacion = 0, framePanel } = MAIN_MENU;

  if (!scene.textures.exists(MAIN_MENU.textura)) {
    console.warn('panelInferior: spritesheet uiMainMenu no cargado.');
    return scene.add.rectangle(anchoPanel / 2, altoPanel / 2, anchoPanel, altoPanel, 0x3d2817);
  }

  const fondo = scene.add.sprite(
    anchoPanel / 2,
    altoPanel / 2,
    MAIN_MENU.textura,
    framePanel
  );
  fondo.setOrigin(0.5);
  fondo.setFlipX(true);

  if (rotacion === 90 || rotacion === -90) {
    fondo.setAngle(rotacion);
    fondo.setDisplaySize(altoPanel, anchoPanel);
  } else {
    fondo.setAngle(rotacion);
    fondo.setDisplaySize(anchoPanel, altoPanel);
  }

  fondo.setDepth(0);
  return fondo;
}

function indiceFrameCerrar(tiles, ly) {
  if (Number.isInteger(ly?.frame)) return ly.frame;
  if (ly?.celda) return frameMainTiles(ly.celda.fila, ly.celda.columna, tiles);
  const { fila, columna } = tiles.botonCerrarCelda ?? { fila: 18, columna: 2 };
  return frameMainTiles(fila, columna, tiles);
}

function crearBotonCerrar(scene, anchoPanel, altoPanel, onCerrar, opciones = {}) {
  const ly = { ...LAYOUT.botonCerrar, ...opciones.botonCerrar };
  const tiles = { ...MAIN_TILES, ...opciones.mainTiles };
  const tamano = ly.tamanoDisplay ?? 48;
  const frame = indiceFrameCerrar(tiles, ly);

  const x = anchoPanel - ly.margenDerecho + (ly.offsetX ?? 0);
  const y = ly.margenSuperior + (ly.offsetY ?? 0);

  const btn = scene.add.sprite(x, y, tiles.textura, frame);
  btn.setOrigin(1, 0);
  btn.setDisplaySize(tamano, tamano);
  btn.setDepth(ly.depth ?? 500);
  btn.setAlpha(ly.alpha ?? 0.0000001);

  const hit = new Phaser.Geom.Rectangle(-tamano, 0, tamano, tamano);
  btn.setInteractive(hit, Phaser.Geom.Rectangle.Contains);
  btn.input.cursor = 'pointer';

  btn.on('pointerdown', (pointer) => {
    pointer.event.stopPropagation();
    if (typeof onCerrar === 'function') onCerrar();
  });

  return btn;
}

function normalizarVida(vida) {
  if (!vida) return { vidaActual: 0, vidaMaxima: 1 };
  return {
    vidaActual: vida.vidaActual ?? vida.vida ?? 0,
    vidaMaxima: vida.vidaMaxima ?? 1,
  };
}

function construirEstadisticas(scene, contenedor, estadisticas, layout) {
  const grupo = scene.add.container(0, 0);
  grupo.setDepth(15);
  const ly = LAYOUT.estadisticas;
  const n = estadisticas.length;
  if (n === 0) return grupo;

  const columnaAncho = layout.statsAnchoTotal / n;
  const y = layout.statsY;
  const iconoTam = Math.min(
    columnaAncho * ly.iconoFraccionAnchoCol,
    layout.altoPanel * ly.iconoFraccionAltoPanel,
    ly.iconoTamanoMax
  );

  estadisticas.forEach((stat, i) => {
    const xCol = layout.statsInicioX + i * columnaAncho + ly.gapColumnas;
    let textoX = xCol;

    if (stat.icono) {
      const icono = crearIconoStat(scene, stat.icono, xCol, y, iconoTam);
      if (icono) {
        icono.x = xCol;
        icono.y = y;
        grupo.add(icono);
        textoX = xCol + icono.displayWidth + ly.espacioIconoTexto;
      }
    }

    const etiqueta = String(stat.nombre ?? '');
    const nombre = crearTexto(scene, etiqueta, {
      x: textoX,
      y,
      estilo: LAYOUT.textoStat.estilo,
      escala: ly.textoEscala,
      espaciado: 0,
      origen: { x: 0, y: 0.5 },
      depth: 15,
    });
    grupo.add(nombre);

    const anchoEtiqueta =
      nombre.anchoTexto ??
      medirTexto(etiqueta, { estilo: LAYOUT.textoStat.estilo, escala: ly.textoEscala }).ancho;

    const cantidad = crearTexto(scene, String(stat.cantidad ?? 0), {
      x: textoX + anchoEtiqueta + ly.espacioLabelNumero,
      y,
      estilo: LAYOUT.textoStat.estilo,
      escala: ly.textoEscala,
      espaciado: 0,
      origen: { x: 0, y: 0.5 },
      depth: 15,
    });
    grupo.add(cantidad);
  });

  contenedor.add(grupo);
  return grupo;
}

export function crearPanelInferior(scene, datos, opciones = {}) {
  const cam = scene.cameras.main;
  const fraccion = opciones.fraccionAltura ?? PANEL_DEFECTO.fraccionAltura;
  const anchoPanel = cam.width;
  const altoPanel = cam.height * fraccion;
  const posY = cam.height - altoPanel;

  const layout = calcularLayoutPanel(anchoPanel, altoPanel);
  const vida = normalizarVida(datos.vida);

  const contenedor = scene.add.container(0, posY);
  contenedor.setDepth(opciones.depth ?? PANEL_DEFECTO.depth);
  contenedor.setSize(anchoPanel, altoPanel);

  const cerrarHandler = () => {
    if (typeof opciones.onCerrar === 'function') opciones.onCerrar();
    contenedor.destroy();
    if (scene.panelInferiorActivo === contenedor) {
      scene.panelInferiorActivo = null;
    }
  };

  const fondo = crearFondoPanel(scene, anchoPanel, altoPanel);
  contenedor.add(fondo);

  if (datos.imagen) {
    const retrato = crearRetratoCuadrado(
      scene,
      datos.imagen,
      layout.retratoX,
      layout.retratoY,
      layout.retratoTam
    );
    if (retrato) {
      retrato.setDepth(5);
      contenedor.add(retrato);
    }
  }

  const nombreStr = datos.nombre ?? '';
  const medidaNombre = medirTexto(nombreStr, {
    estilo: LAYOUT.textoNombre.estilo,
    escala: layout.nombreEscala,
    espaciado: 0,
  });

  const lineaY = layout.lineaY;

  const nombre = crearTexto(scene, nombreStr, {
    x: layout.contenidoX,
    y: lineaY,
    estilo: LAYOUT.textoNombre.estilo,
    escala: layout.nombreEscala,
    espaciado: 0,
    origen: { x: 0, y: 0.5 },
    depth: 15,
  });
  contenedor.add(nombre);

  const anchoNombre =
    nombre.anchoTexto ??
    medidaNombre.ancho;
  const barraX = layout.contenidoX + anchoNombre + layout.gapNombreBarra;
  const barraAncho = Math.min(
    anchoPanel * layout.barraAnchoFraccion,
    anchoPanel - barraX - layout.margenDerechoBarra,
    layout.barraAnchoMax
  );

  const barra = crearBarraVidaRect(scene, {
    x: barraX,
    y: lineaY,
    ancho: Math.max(barraAncho, 80),
    alto: layout.barraAlto,
    vidaActual: vida.vidaActual,
    vidaMaxima: vida.vidaMaxima,
    origen: 0,
    depth: 10,
  });
  contenedor.add(barra);

  if (Array.isArray(datos.estadisticas) && datos.estadisticas.length > 0) {
    construirEstadisticas(scene, contenedor, datos.estadisticas, layout);
  }

  const btnCerrar = crearBotonCerrar(scene, anchoPanel, altoPanel, cerrarHandler, opciones);
  contenedor.add(btnCerrar);
  contenedor.bringToTop(btnCerrar);

  contenedor.actualizar = (nuevosDatos) => {
    const v = normalizarVida({ ...datos, ...nuevosDatos }.vida);
    if (barra.actualizarVida) {
      barra.actualizarVida(v.vidaActual, v.vidaMaxima);
    }
    return contenedor;
  };

  contenedor.cerrar = cerrarHandler;
  contenedor.fondo = fondo;
  contenedor.botonCerrar = btnCerrar;
  contenedor.barraVida = barra;
  contenedor.nombre = nombre;

  return contenedor;
}

export {
  MAIN_MENU,
  MAIN_MENU_FRAMES,
  MAIN_TILES,
  MAIN_TILES_FRAMES,
  LAYOUT,
  PANEL_DEFECTO,
  frameMainTiles,
} from './panelInferiorConfig.js';

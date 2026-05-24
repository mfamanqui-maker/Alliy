/**
 * Ensamblador del panel de detalle de entidad.
 *
 * Uso típico:
 *   import { abrirPanelEntidad, precargarDescripcionesPanelEntidad } from './ui/PanelEntidad';
 *   precargarDescripcionesPanelEntidad(this);  // en preload
 *   const panel = abrirPanelEntidad(scene, opciones);
 *
 * El panel pausa el input de la escena que se le pase como `escenaAPausar`
 * (por defecto, la escena `tablero` si existe). Al cerrarse, lo restaura.
 *
 * `opciones` shape:
 *   {
 *     nombre,
 *     equipos: { Aliados, Enemigos },
 *     bando,              // 'Aliados' | 'Enemigos'
 *     idActual,
 *     idInicial,
 *     foto,
 *     vida: { vidaActual, vidaMaxima },
 *     estadisticas: [{ imagen, nombre, cantidad }],
 *     efectos:      [{ imagen, nombre, cantidad }],
 *     acciones:     [{ imagen, nombre, cantidad }],
 *     objetos:      [{ imagen, nombre, cantidad }],
 *     movimiento:   [{ imagen, nombre, cantidad }],
 *     onResolverEntidad,  // (id) => { ...opciones para id }
 *     onCerrar,           // hook externo opcional
 *     escenaAPausar,      // Phaser.Scene cuyo input se desactivará
 *   }
 */

import {
  COLORES,
  DEPTHS,
  HEADER,
  LADO_IZQUIERDO,
  LADO_DERECHO,
  PANEL,
  DESCRIPCIONES,
} from './panelEntidadConfig.js';
import { crearHeader } from './partes/header.js';
import { crearLadoIzquierdo } from './partes/ladoIzquierdo.js';
import { crearSeccionEstadisticasEfectos } from './partes/seccionEstadisticasEfectos.js';
import { crearSeccionAcciones } from './partes/seccionAcciones.js';
import { registrarInputsPanel } from './partes/inputs.js';

export function precargarDescripcionesPanelEntidad(scene) {
  if (!scene?.load?.json) return;
  Object.values(DESCRIPCIONES).forEach((meta) => {
    if (!scene.cache.json.exists(meta.clave)) {
      scene.load.json(meta.clave, meta.ruta);
    }
  });
}

export function abrirPanelEntidad(scene, opciones) {
  if (scene.panelEntidadActivo) {
    scene.panelEntidadActivo.cerrar();
  }

  const cam = scene.cameras.main;
  const anchoPanel = Math.floor(cam.width * PANEL.fraccionAncho);
  const altoPanel = Math.floor(cam.height * PANEL.fraccionAlto);
  const panelX = Math.floor((cam.width - anchoPanel) / 2);
  const panelY = Math.floor((cam.height - altoPanel) / 2);

  const escenaAPausar = opciones.escenaAPausar ?? scene.scene?.get?.('tablero') ?? null;
  if (escenaAPausar && escenaAPausar.input) {
    escenaAPausar.input.enabled = false;
  }

  const velo = scene.add.rectangle(0, 0, cam.width, cam.height, COLORES.velo, COLORES.veloAlpha);
  velo.setOrigin(0, 0);
  velo.setDepth(DEPTHS.velo);
  velo.setScrollFactor(0);
  velo.setInteractive({ useHandCursor: false });
  velo.on('pointerdown', (pointer) => pointer.event?.stopPropagation?.());

  const container = scene.add.container(panelX, panelY);
  container.setDepth(DEPTHS.fondo);
  container.setScrollFactor(0);
  container.setSize(anchoPanel, altoPanel);

  const fondo = scene.add.rectangle(0, 0, anchoPanel, altoPanel, COLORES.fondo, COLORES.fondoAlpha);
  fondo.setOrigin(0, 0);
  fondo.setStrokeStyle(COLORES.bordeGrosor, COLORES.borde, 1);
  container.add(fondo);

  const padding = PANEL.padding;
  const headerAlto = Math.floor(altoPanel * HEADER.altoFraccion);
  const cuerpoAncho = anchoPanel - padding * 2;
  const cuerpoAlto = altoPanel - headerAlto - padding * 2;

  const ladoIzqAncho = Math.floor(cuerpoAncho * LADO_IZQUIERDO.anchoFraccion);
  const restoAncho = cuerpoAncho - ladoIzqAncho;
  const mitadIzqAncho = Math.floor(restoAncho * LADO_DERECHO.splitFraccion);
  const mitadDerAncho = restoAncho - mitadIzqAncho;

  const cuerpoY = padding + headerAlto;
  const ladoDerX = padding + ladoIzqAncho;
  const mitadDerX = ladoDerX + mitadIzqAncho;

  const estado = {
    idActual: opciones.idActual ?? null,
    idInicial: opciones.idInicial ?? opciones.idActual ?? null,
    bando: opciones.bando ?? 'Aliados',
    equipos: opciones.equipos ?? { Aliados: [], Enemigos: [] },
    opciones,
  };

  let inputsHandle = null;
  let header = null;
  let ladoIzq = null;
  let seccionStats = null;
  let seccionAcciones = null;
  let cerrado = false;

  const cerrar = () => {
    if (cerrado) return;
    cerrado = true;
    inputsHandle?.desuscribir?.();
    if (escenaAPausar && escenaAPausar.input) {
      escenaAPausar.input.enabled = true;
    }
    container.destroy();
    velo.destroy();
    if (scene.panelEntidadActivo === api) {
      scene.panelEntidadActivo = null;
    }
    if (typeof opciones.onCerrar === 'function') opciones.onCerrar();
  };

  header = crearHeader(scene, {
    x: padding,
    y: padding,
    ancho: cuerpoAncho,
    alto: headerAlto,
    padre: container,
    nombreInicial: opciones.nombre ?? '',
    onFlechaIzq: () => navegarMismoBando(-1),
    onFlechaDer: () => navegarMismoBando(1),
    onCerrar: () => cerrar(),
  });

  ladoIzq = crearLadoIzquierdo(scene, {
    x: padding,
    y: cuerpoY,
    ancho: ladoIzqAncho,
    alto: cuerpoAlto,
    padre: container,
    datosIniciales: {
      foto: opciones.foto,
      vida: opciones.vida,
    },
    onIrAInicial: () => irAInicial(),
    onHistorial: () => historial(),
  });

  const aplicarDatos = (datos) => {
    if (datos.equipos) estado.equipos = datos.equipos;
    estado.idActual = datos.idActual ?? datos.id ?? estado.idActual;
    estado.bando = datos.bando ?? estado.bando;
    header.fijarNombre(datos.nombre ?? '');
    ladoIzq.actualizar({ foto: datos.foto, vida: datos.vida });

    if (seccionStats) seccionStats.container.destroy();
    if (seccionAcciones) seccionAcciones.container.destroy();

    seccionStats = crearSeccionEstadisticasEfectos(scene, {
      x: ladoDerX,
      y: cuerpoY,
      ancho: mitadIzqAncho,
      alto: cuerpoAlto,
      padre: container,
      datos: {
        estadisticas: datos.estadisticas ?? [],
        efectos: datos.efectos ?? [],
      },
      tooltip: ladoIzq.tooltip,
    });

    seccionAcciones = crearSeccionAcciones(scene, {
      x: mitadDerX,
      y: cuerpoY,
      ancho: mitadDerAncho,
      alto: cuerpoAlto,
      padre: container,
      datos: {
        acciones: datos.acciones ?? [],
        objetos: datos.objetos ?? [],
        movimiento: datos.movimiento ?? [],
      },
      tooltip: ladoIzq.tooltip,
    });
  };

  const mostrarEntidad = (id) => {
    if (id == null) return;
    if (typeof opciones.onResolverEntidad !== 'function') return;
    const nuevos = opciones.onResolverEntidad(id);
    if (!nuevos) return;
    aplicarDatos(nuevos);
  };

  function navegarMismoBando(direccion) {
    const lista = estado.equipos?.[estado.bando] ?? [];
    if (!lista.length || direccion == null) return;

    let indexActual = lista.findIndex((entidad) => entidad.id == estado.idActual);
    if (indexActual < 0) indexActual = 0;

    const nuevoIndex = indexActual + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= lista.length) {
      if (direccion === -1) {
        mostrarEntidad(lista[lista.length - 1].id);
      } else {
        mostrarEntidad(lista[0].id);
      }
      return;
    };
    const elegido = lista[nuevoIndex];
    if (elegido) mostrarEntidad(elegido.id);
  }

  function irAInicial() {
    if (estado.idInicial != null) mostrarEntidad(estado.idInicial);
  }

  function historial() {
    console.log('trabajando en ello...');
  }

  const enrutarScroll = (pointer, deltaY) => {
    const px = pointer.x;
    const py = pointer.y;
    if (seccionStats?.contieneCoordenadas(px, py)) {
      seccionStats.desplazar(px, py, -deltaY * 0.6);
      return;
    }
    if (seccionAcciones?.contieneCoordenadas(px, py)) {
      seccionAcciones.desplazar(px, py, -deltaY * 0.6);
    }
  };

  aplicarDatos({
    idActual: estado.idActual,
    bando: estado.bando,
    nombre: opciones.nombre,
    foto: opciones.foto,
    vida: opciones.vida,
    estadisticas: opciones.estadisticas,
    efectos: opciones.efectos,
    acciones: opciones.acciones,
    objetos: opciones.objetos,
    movimiento: opciones.movimiento,
  });

  inputsHandle = registrarInputsPanel(scene, {
    cerrar,
    navegarMismoBando,
    irAInicial,
    historial,
    scroll: enrutarScroll,
  });

  const actualizar = (datos) => {
    if (datos?.equipos) estado.equipos = datos.equipos;
    if (datos?.onResolverEntidad) estado.opciones.onResolverEntidad = datos.onResolverEntidad;
    if (datos?.idInicial != null) estado.idInicial = datos.idInicial;
    aplicarDatos(datos);
  };

  const api = {
    container,
    cerrar,
    actualizar,
    mostrarEntidad,
  };

  scene.panelEntidadActivo = api;
  return api;
}

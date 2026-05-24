/**
 * Encabezado del panel: flecha izquierda | nombre centrado | flecha derecha | botón X.
 *
 * Las flechas se construyen con un Triangle de Phaser para no depender de
 * spritesheets nuevos. El botón X se dibuja con dos líneas sobre un rectángulo.
 *
 * Callbacks esperados en opciones:
 *   - onFlechaIzq, onFlechaDer, onCerrar
 *
 * Devuelve { container, fijarNombre(nombre) }.
 */

import { crearTexto } from '../../GenerarTexto/index.js';
import { COLORES, DEPTHS, HEADER } from '../panelEntidadConfig.js';

function crearFlecha(scene, opciones) {
  const { x, y, ancho, alto, hacia, onClick } = opciones;
  const container = scene.add.container(x, y);
  container.setDepth(DEPTHS.header);

  const fondo = scene.add.rectangle(0, 0, ancho, alto, COLORES.flechaFondo, 0.9);
  fondo.setOrigin(0.5);
  fondo.setStrokeStyle(2, COLORES.borde, 0.9);
  fondo.setInteractive({ useHandCursor: true });
  container.add(fondo);

  const puntos =
    hacia === 'izquierda'
      ? [ancho * 0.4, 0, -ancho * 0.4, -alto * 0.3, -ancho * 0.4, alto * 0.3]
      : [-ancho * 0.4, 0, ancho * 0.4, -alto * 0.3, ancho * 0.4, alto * 0.3];

  const tri = scene.add.polygon(0, 0, puntos, COLORES.borde, 1);
  tri.setOrigin(0, 0);
  container.add(tri);

  fondo.on('pointerover', () => fondo.setFillStyle(COLORES.flechaHover, 0.95));
  fondo.on('pointerout', () => fondo.setFillStyle(COLORES.flechaFondo, 0.9));
  fondo.on('pointerdown', (pointer) => {
    pointer.event?.stopPropagation?.();
    if (typeof onClick === 'function') onClick();
  });

  return container;
}

function crearBotonCerrar(scene, opciones) {
  const { x, y, tam, onClick } = opciones;
  const container = scene.add.container(x, y);
  container.setDepth(DEPTHS.header);

  const fondo = scene.add.rectangle(0, 0, tam, tam, COLORES.cerrarFondo, 0.95);
  fondo.setOrigin(0.5);
  fondo.setStrokeStyle(2, COLORES.borde, 0.9);
  fondo.setInteractive({ useHandCursor: true });
  container.add(fondo);

  const half = tam * 0.3;
  const linea1 = scene.add.line(18, 18, -half, -half, half, half, 0xffffff, 1);
  linea1.setLineWidth(3);
  const linea2 = scene.add.line(18, 18, -half, half, half, -half, 0xffffff, 1);
  linea2.setLineWidth(3);
  container.add([linea1, linea2]);

  fondo.on('pointerover', () => fondo.setFillStyle(COLORES.cerrarHover, 1));
  fondo.on('pointerout', () => fondo.setFillStyle(COLORES.cerrarFondo, 0.95));
  fondo.on('pointerdown', (pointer) => {
    pointer.event?.stopPropagation?.();
    if (typeof onClick === 'function') onClick();
  });

  return container;
}

export function crearHeader(scene, opciones) {
  const { x, y, ancho, alto, padre, nombreInicial = '', onFlechaIzq, onFlechaDer, onCerrar } = opciones;

  const container = scene.add.container(x, y);
  container.setDepth(DEPTHS.header);
  padre.add(container);

  const banda = scene.add.rectangle(0, 0, ancho, alto, COLORES.bandaTitulo, 0.85);
  banda.setOrigin(0, 0);
  banda.setStrokeStyle(2, COLORES.separador, 0.5);
  container.add(banda);

  const padding = 12;
  const flechaAncho = HEADER.flechaAncho;
  const flechaAlto = HEADER.flechaAlto;
  const cerrarTam = HEADER.cerrarTam;

  const flechaDer = crearFlecha(scene, {
    x: padding + flechaAncho / 2,
    y: alto / 2,
    ancho: flechaAncho,
    alto: flechaAlto,
    hacia: 'derecha',
    onClick: onFlechaDer,
  });
  container.add(flechaDer);

  const flechaIzq = crearFlecha(scene, {
    x: ancho - padding - cerrarTam - 14 - flechaAncho / 2,
    y: alto / 2,
    ancho: flechaAncho,
    alto: flechaAlto,
    hacia: 'izquierda',
    onClick: onFlechaIzq,
  });
  container.add(flechaIzq);

  const btnCerrar = crearBotonCerrar(scene, {
    x: ancho - padding - cerrarTam / 2,
    y: alto / 2,
    tam: cerrarTam,
    onClick: onCerrar,
  });
  container.add(btnCerrar);

  let nombreNodo = null;
  const fijarNombre = (nombre) => {
    if (nombreNodo) {
      nombreNodo.destroy();
      nombreNodo = null;
    }
    nombreNodo = crearTexto(scene, nombre ?? '', {
      x: ancho / 2,
      y: alto / 2,
      estilo: HEADER.nombreEstilo,
      escala: HEADER.nombreEscala,
      origen: { x: 0.5, y: 0.5 },
      depth: DEPTHS.header + 1,
    });
    container.add(nombreNodo);
  };

  fijarNombre(nombreInicial);

  return { container, fijarNombre };
}

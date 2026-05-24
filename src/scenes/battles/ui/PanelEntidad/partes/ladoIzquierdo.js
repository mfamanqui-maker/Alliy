/**
 * Lado izquierdo del panel: foto + barra de vida + texto Va/Vm + tooltip + botones.
 *
 * Devuelve un objeto con métodos para refrescar la foto, la vida y el tooltip.
 *
 * Callbacks:
 *   onIrAInicial — botón "Ir a entidad inicial" (también disparable por Tab)
 *   onHistorial  — botón "Ver historial" (también disparable por H)
 *
 * Tooltip:
 *   { mostrar(clave, nombre), limpiar() } se devuelve para que las listas lo usen.
 */

import { crearBarraVidaRect } from '../../BarraVida/index.js';
import { crearTexto, medirTexto } from '../../GenerarTexto/index.js';
import { COLORES, DEPTHS, LADO_IZQUIERDO, claveTexturaImagen } from '../panelEntidadConfig.js';
import { crearTooltipDescripcion } from './tooltipDescripcion.js';

function crearBoton(scene, opciones) {
  const { x, y, ancho, alto, texto, onClick } = opciones;
  const container = scene.add.container(x, y);
  container.setDepth(DEPTHS.botones);

  const fondo = scene.add.rectangle(0, 0, ancho, alto, COLORES.botonFondo, 1);
  fondo.setOrigin(0, 0);
  fondo.setStrokeStyle(2, COLORES.botonBorde, 0.9);
  fondo.setInteractive({ useHandCursor: true });
  container.add(fondo);

  const etiqueta = crearTexto(scene, texto, {
    x: ancho / 2,
    y: alto / 2,
    estilo: LADO_IZQUIERDO.botonTextoEstilo,
    escala: LADO_IZQUIERDO.botonTextoEscala,
    origen: { x: 0.5, y: 0.5 },
    depth: DEPTHS.botones + 1,
  });
  container.add(etiqueta);

  fondo.on('pointerover', () => fondo.setFillStyle(COLORES.botonHover, 1));
  fondo.on('pointerout', () => fondo.setFillStyle(COLORES.botonFondo, 1));
  fondo.on('pointerdown', (pointer) => {
    pointer.event?.stopPropagation?.();
    if (typeof onClick === 'function') onClick();
  });

  return container;
}

function fotoPlaceholder(scene, ancho, alto) {
  const placeholder = scene.add.rectangle(0, 0, ancho, alto, COLORES.iconoMarcoVacio, 1);
  placeholder.setOrigin(0, 0);
  placeholder.setStrokeStyle(2, COLORES.borde, 0.7);
  return placeholder;
}

function intentarCargarImagen(scene, ruta, onCargada) {
  if (!ruta) return null;
  const clave = claveTexturaImagen(ruta);
  if (scene.textures.exists(clave)) {
    onCargada(clave);
    return clave;
  }
  scene.load.image(clave, ruta);
  scene.load.once('complete', () => {
    if (scene.textures.exists(clave)) onCargada(clave);
  });
  if (!scene.load.isLoading()) scene.load.start();
  return clave;
}

export function crearLadoIzquierdo(scene, opciones) {
  const { x, y, ancho, alto, padre, datosIniciales, onIrAInicial, onHistorial } = opciones;
  const padding = LADO_IZQUIERDO.paddingInterno;

  const container = scene.add.container(x, y);
  container.setDepth(DEPTHS.contenido);
  padre.add(container);

  const banda = scene.add.rectangle(0, 0, ancho, alto, COLORES.bandaSeccion, 0.5);
  banda.setOrigin(0, 0);
  banda.setStrokeStyle(2, COLORES.separador, 0.4);
  container.add(banda);

  const fotoTam = Math.min(ancho - padding * 2, alto * LADO_IZQUIERDO.fotoFraccionAlto);
  const fotoX = (ancho - fotoTam) / 2;
  const fotoY = padding;

  const placeholder = fotoPlaceholder(scene, fotoTam, fotoTam);
  placeholder.setPosition(fotoX, fotoY);
  container.add(placeholder);

  let fotoImg = null;

  const fijarFoto = (ruta) => {
    if (fotoImg) {
      fotoImg.destroy();
      fotoImg = null;
    }
    if (!ruta) return;
    intentarCargarImagen(scene, ruta, (clave) => {
      fotoImg = scene.add.image(fotoX + fotoTam / 2, fotoY + fotoTam / 2, clave);
      fotoImg.setDisplaySize(fotoTam, fotoTam);
      fotoImg.setDepth(DEPTHS.contenido + 1);
      container.add(fotoImg);
    });
  };

  const barraY = fotoY + fotoTam + LADO_IZQUIERDO.gapVerticalEntreBloques + 50;
  const barraAncho = ancho - padding * 2;
  const barra = crearBarraVidaRect(scene, {
    x: padding,
    y: barraY - 20,
    ancho: barraAncho,
    alto: LADO_IZQUIERDO.barraVidaAlto,
    vidaActual: datosIniciales?.vida?.vidaActual ?? 0,
    vidaMaxima: datosIniciales?.vida?.vidaMaxima ?? 1,
    origen: 0,
    depth: DEPTHS.contenido + 1,
  });
  container.add(barra);

  let textoVida = null;
  const fijarTextoVida = (vidaActual, vidaMaxima) => {
    if (textoVida) {
      textoVida.destroy();
      textoVida = null;
    }
    textoVida = crearTexto(scene, `${vidaActual} - ${vidaMaxima}`, {
      x: ancho / 2,
      y: barraY + LADO_IZQUIERDO.barraVidaAlto - 28,
      estilo: LADO_IZQUIERDO.textoVidaEstilo,
      escala: LADO_IZQUIERDO.textoVidaEscala,
      origen: { x: 0.5, y: 0 },
      depth: DEPTHS.contenido + 2,
    });
    container.add(textoVida);
  };

  const textoVidaAlto =
    medirTexto('0', {
      estilo: LADO_IZQUIERDO.textoVidaEstilo,
      escala: LADO_IZQUIERDO.textoVidaEscala,
    }).alto + 8;

  const tooltipY =
    barraY + LADO_IZQUIERDO.barraVidaAlto + textoVidaAlto + LADO_IZQUIERDO.gapVerticalEntreBloques;
  const tooltipAlto = LADO_IZQUIERDO.tooltipAlto;
  const tooltipAncho = ancho - padding * 2;

  const tooltip = crearTooltipDescripcion(scene, {
    x: padding,
    y: tooltipY - 25,
    ancho: tooltipAncho,
    alto: tooltipAlto,
    padre: container,
    medirTexto,
  });

  const botonY = tooltipY + tooltipAlto + LADO_IZQUIERDO.gapVerticalEntreBloques;
  const botonAncho = (ancho - padding * 2 - LADO_IZQUIERDO.botonGap) / 2;

  const btnInicial = crearBoton(scene, {
    x: padding,
    y: botonY - 25,
    ancho: botonAncho,
    alto: LADO_IZQUIERDO.botonAlto,
    texto: 'IR A INICIAL',
    onClick: onIrAInicial,
  });
  container.add(btnInicial);

  const btnHistorial = crearBoton(scene, {
    x: padding + botonAncho + LADO_IZQUIERDO.botonGap,
    y: botonY - 25,
    ancho: botonAncho,
    alto: LADO_IZQUIERDO.botonAlto,
    texto: 'VER HISTORIAL',
    onClick: onHistorial,
  });
  container.add(btnHistorial);

  fijarFoto(datosIniciales?.foto);
  fijarTextoVida(
    datosIniciales?.vida?.vidaActual ?? 0,
    datosIniciales?.vida?.vidaMaxima ?? 1
  );

  return {
    container,
    tooltip,

    actualizar(nuevosDatos) {
      if (nuevosDatos?.foto !== undefined) {
        fijarFoto(nuevosDatos.foto);
      }
      if (nuevosDatos?.vida) {
        const { vidaActual, vidaMaxima } = nuevosDatos.vida;
        barra.actualizarVida(vidaActual ?? 0, vidaMaxima ?? 1);
        fijarTextoVida(vidaActual ?? 0, vidaMaxima ?? 1);
      }
    },
  };
}

/**
 * Mitad derecha del lado derecho del panel.
 * Tres columnas paralelas: ACCIONES | OBJETOS | MOVIMIENTO.
 * Las tres comparten el mismo scroll vertical: si scrolleas en cualquiera de
 * las tres, las tres bajan/suben juntas (la fila n de las tres se alinea
 * horizontalmente, igual al mockup).
 *
 * El alto de contenido es el máximo de las 3 listas para que ninguna corte
 * en mitad de una fila visible.
 */

import { crearTexto } from '../../GenerarTexto/index.js';
import { COLORES, DEPTHS, LISTAS, LADO_DERECHO } from '../panelEntidadConfig.js';
import { crearListaScrollable } from './listaScrollable.js';
import { crearFilaItem, FILA_ALTO } from './filaItem.js';

const SUBCOLUMNAS = [
  { titulo: 'ACCIONES', clave: 'acciones' },
  { titulo: 'OBJETOS', clave: 'objetos' },
  { titulo: 'MOVIMIENTO', clave: 'movimiento' },
];

function dibujarTitulo(scene, padre, x, y, ancho, texto) {
  const banda = scene.add.rectangle(x, y, ancho, LISTAS.tituloAlto, COLORES.bandaTitulo, 0.65);
  banda.setOrigin(0, 0);
  banda.setStrokeStyle(1, COLORES.separador, 0.5);
  padre.add(banda);

  const etiqueta = crearTexto(scene, texto, {
    x: x + ancho / 2,
    y: y + LISTAS.tituloAlto / 2,
    estilo: LISTAS.tituloEstilo,
    escala: LISTAS.tituloEscala,
    origen: { x: 0.5, y: 0.5 },
    depth: DEPTHS.contenido + 5,
  });
  padre.add(etiqueta);
}

function poblarColumna(scene, lista, items, claveJson, ancho, tooltip) {
  items.forEach((item, indice) => {
    const fila = crearFilaItem(scene, {
      ancho,
      item,
      onHover: () => tooltip.mostrar(claveJson, item.nombre),
      onLeave: () => tooltip.limpiar(),
    });
    fila.y = indice * FILA_ALTO;
    lista.agregar(fila);
  });
}

export function crearSeccionAcciones(scene, opciones) {
  const { x, y, ancho, alto, padre, datos, tooltip } = opciones;
  const padding = LADO_DERECHO.paddingInterno;
  const gapColumna = LADO_DERECHO.gapColumnaInterna;

  const container = scene.add.container(x, y);
  container.setDepth(DEPTHS.contenido);
  padre.add(container);

  const banda = scene.add.rectangle(0, 0, ancho, alto, COLORES.bandaSeccion, 0.5);
  banda.setOrigin(0, 0);
  banda.setStrokeStyle(2, COLORES.separador, 0.4);
  container.add(banda);

  const columnaAncho = (ancho - padding * 2 - gapColumna * (SUBCOLUMNAS.length - 1)) / SUBCOLUMNAS.length;
  const listas = [];
  let maxFilas = 0;

  SUBCOLUMNAS.forEach((sub, indice) => {
    const colX = padding + indice * (columnaAncho + gapColumna);
    const colY = padding;

    dibujarTitulo(scene, container, colX, colY, columnaAncho, sub.titulo);

    const listaY = colY + LISTAS.tituloAlto + 6;
    const listaAlto = alto - listaY - padding;
    const items = datos?.[sub.clave] ?? [];

    const lista = crearListaScrollable(scene, {
      x: colX,
      y: listaY,
      ancho: columnaAncho,
      alto: listaAlto,
      padre: container,
    });

    poblarColumna(scene, lista, items, sub.clave, columnaAncho, tooltip);
    listas.push(lista);
    if (items.length > maxFilas) maxFilas = items.length;
  });

  const altoCompartido = maxFilas * FILA_ALTO;
  listas.forEach((l) => l.fijarAltoContenido(altoCompartido));

  const sincronizar = (dy) => {
    listas.forEach((l) => l.desplazar(dy));
  };

  return {
    container,
    listas,

    contieneCoordenadas(px, py) {
      return listas.some((l) => l.contieneCoordenadas(px, py));
    },

    desplazar(px, py, dy) {
      if (this.contieneCoordenadas(px, py)) {
        sincronizar(dy);
      }
    },
  };
}

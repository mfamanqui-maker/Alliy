/**
 * Mitad izquierda del lado derecho del panel.
 * Dos columnas en paralelo: ESTADISTICAS  |  EFECTOS.
 * Cada columna es una lista scrollable independiente.
 *
 * Cada hover sobre un item llama tooltip.mostrar(claveJson, item.nombre).
 */

import { crearTexto } from '../../GenerarTexto/index.js';
import { COLORES, DEPTHS, LISTAS, LADO_DERECHO } from '../panelEntidadConfig.js';
import { crearListaScrollable } from './listaScrollable.js';
import { crearFilaItem, FILA_ALTO } from './filaItem.js';

const SUBSECCIONES = [
  { titulo: 'ESTADISTICAS', clave: 'estadisticas' },
  { titulo: 'EFECTOS', clave: 'efectos' },
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
  const altoTotal = items.length * FILA_ALTO;
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
  lista.fijarAltoContenido(altoTotal);
}

export function crearSeccionEstadisticasEfectos(scene, opciones) {
  const { x, y, ancho, alto, padre, datos, tooltip } = opciones;
  const padding = LADO_DERECHO.paddingInterno;

  const container = scene.add.container(x, y);
  container.setDepth(DEPTHS.contenido);
  padre.add(container);

  const banda = scene.add.rectangle(0, 0, ancho, alto, COLORES.bandaSeccion, 0.5);
  banda.setOrigin(0, 0);
  banda.setStrokeStyle(2, COLORES.separador, 0.4);
  container.add(banda);

  const columnaAncho = (ancho - padding * 3) / 2;
  const listas = [];

  SUBSECCIONES.forEach((sub, indice) => {
    const colX = padding + indice * (columnaAncho + padding);
    const colY = padding;

    dibujarTitulo(scene, container, colX, colY, columnaAncho, sub.titulo);

    const listaY = colY + LISTAS.tituloAlto + 6;
    const listaAlto = alto - listaY - padding;

    const lista = crearListaScrollable(scene, {
      x: colX,
      y: listaY,
      ancho: columnaAncho,
      alto: listaAlto,
      padre: container,
    });

    poblarColumna(scene, lista, datos?.[sub.clave] ?? [], sub.clave, columnaAncho, tooltip);
    listas.push(lista);
  });

  return {
    container,
    listas,

    contieneCoordenadas(px, py) {
      return listas.some((l) => l.contieneCoordenadas(px, py));
    },

    desplazar(px, py, dy) {
      listas.forEach((l) => {
        if (l.contieneCoordenadas(px, py)) l.desplazar(dy);
      });
    },
  };
}

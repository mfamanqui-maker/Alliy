import controladorBatalla from './controladorBatalla.js';
import tablero from './tablero.js';

export default class Vista extends Phaser.Scene {
  constructor() {
    super({ key: 'vista' });
  }
  create() {
    const batalla = new controladorBatalla(
      {
        filas: 5,
        columnas: 5,
        casillaId: 1,
      },
      [
        { id: 0, posicion: { x: 1, y: 1 } },
        { id: 0, posicion: { x: 2, y: 2 } },
      ],
      {
        Aliados: [{
          id: 1,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 1, y: 1 }
        }, {
          id: 2,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 3,
          posicion: { x: 2, y: 3 }
        }, {
          id: 3,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 1, y: 5 }
        }],

        Enemigos: [{
          id: 4,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 5, y: 1 }
        }, {
          id: 5,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 4, y: 3 }
        }, {
          id: 6,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 5, y: 5 }
        }]
      },
      {
        orden: "velocidad",
        condicionesVictoria: "eliminar al equipo contrario",
        clima: "soleado",
        retiradas: true,
        fatal: true
      }
    )

    batalla.CrearTablero();
    const Tablero = new tablero({
        filas: 5,
        columnas: 5,
        casillaId: 1,
      },
      [
        { id: 0, posicion: { x: 1, y: 1 } },
        { id: 0, posicion: { x: 2, y: 2 } },
      ],
      {
        Aliados: [{
          id: 1,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 1, y: 1 }
        }, {
          id: 2,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 3,
          posicion: { x: 2, y: 3 }
        }, {
          id: 3,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 1, y: 5 }
        }],

        Enemigos: [{
          id: 4,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 5, y: 1 }
        }, {
          id: 5,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 4, y: 3 }
        }, {
          id: 6,
          clase: 'guerrero',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 5, y: 5 }
        }]
      })
    console.log(tablero.calcularDistancia(1,6, Tablero.arrayBidimencional));
  }
}
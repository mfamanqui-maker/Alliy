import controladorBatalla from './controladorBatalla.js';

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
        tamaño: 400,
      },
      [
        { id: 0, posicion: { x: 1, y: 1 } },
        { id: 0, posicion: { x: 2, y: 2 } },
      ],
      {
        Aliados: [{
          id: 1,
          familia: 'CuerpoACuerpo',
          arquetipo: 'lumel',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 1, y: 1 }
        }, {
          id: 2,
          familia: 'Distancia',
          arquetipo: 'lumel',
          invetario: ['espada', 'escudo'],
          nivel: 3,
          posicion: { x: 2, y: 3 }
        }, {
          id: 3,
          familia: 'CuerpoACuerpo',
          arquetipo: 'lumel',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 1, y: 5 }
        }],

        Enemigos: [{
          id: 4,
          familia: 'CuerpoACuerpo',
          arquetipo: 'soldado1',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 5, y: 1 }
        }, {
          id: 5,
          familia: 'CuerpoACuerpo',
          arquetipo: 'soldado1',
          invetario: ['espada', 'escudo'],
          nivel: 5,
          posicion: { x: 4, y: 3 }
        }, {
          id: 6,
          familia: 'Distancia',
          arquetipo: 'soldado1',
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
    );
    const tableroData = batalla.CrearTablero();

    this.scene.launch('tablero', {
      ArrayExportado: tableroData.arrayTablero,
      tamaño: tableroData.tamaño,
      controlador: batalla,
    });
    
    this.scene.launch('entidad', { equipos: batalla.equipos, arrayBidimencional: tableroData.arrayTablero });
  }
}
import VistaScene from './scenes/VistaScene.js';
import InstruccionesScene from './scenes/InstruccionesScene.js';
import EstadisticasScene from './scenes/EstadisticasScene.js';
import CodigoScene from './scenes/CodigoScene.js';
import FinScene from './scenes/FinScene.js';
import TimeScene from './scenes/TimeScene.js';
import MenuScene from './scenes/MenuScene.js';
import MapaScene from './scenes/MapaScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1700,
  height: 900,
  backgroundColor: '#2d2d2d',
  /*
  physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
  },
  */

  scene: [VistaScene, EstadisticasScene, InstruccionesScene, CodigoScene,TimeScene , FinScene],
}

window.gameData = {
  // Estado del juego
  fase: null,

  // última jugada
  vigencia: null,
  // conteo de jugadas
  jugada:0,

  // Arrays de proyectiles por resolver
  objetivos_A: [],   // proyectiles aliados  → apuntan a Enemigo_X
  objetivos_E: [],   // proyectiles enemigos → apuntan a Aliado_X

  // Arrays de entidades vivas
  aliados_vivos:  ['Aliado_1', 'Aliado_2', 'Aliado_3'],
  enemigos_vivos: ['Enemigo_1', 'Enemigo_2', 'Enemigo_3'],

  // Lista de botones
  botonesAliados: [],
  textosAliados: [],
  botonesEnemigos: [],
  textosEnemigos: [],

  //sistema de guardado de jugadas
  The_box: [],
  // Selección actual del jugador
  seleccion: {
    aliado: null,
    enemigo: null
  },
  
  // Aliados
  Aliado_1: {
    vidas: 3,
    escudos: 3,
    curas: 2,
    balas: 0,
    accion: null,
    escudo: false,
    objetivo_anterior: null, //correcion del errores con respecto al cambio de objetivos
    objetivo_cura: null, //correcion del errores con respecto al cambio de curas
    vida_maxima: 3,
    Z: true //revivir como zombie
  },
  Aliado_2: {
    vidas: 4,
    escudos: 2,
    curas: 1,
    balas: 0,
    accion: null,
    escudo: false,
    objetivo_anterior: null,
    objetivo_cura: null,
    vida_maxima: 4,
    Z: true
  },
  Aliado_3: {
    vidas: 3,
    escudos: 2,
    curas: 3,
    balas: 0,
    accion: null,
    escudo: false,
    objetivo_anterior: null,
    objetivo_cura: null,
    vida_maxima: 3,
    Z: true
  },

  // Enemigos
  Enemigo_1: {
    vidas: 3,
    escudos: 3,
    curas: 2,
    balas: 0,
    accion: null,
    escudo: false,
    vida_maxima: 3,
    Z: true
  },
  Enemigo_2: {
    vidas: 4,
    escudos: 2,
    curas: 1,
    balas: 0,
    accion: null,
    escudo: false,
    vida_maxima: 4,
    Z: true
  },
  Enemigo_3: {
    vidas: 3,
    escudos: 2,
    curas: 3,
    balas: 0,
    accion: null,
    escudo: false,
    vida_maxima: 3,
    Z: true
  }
}

const game = new Phaser.Game(config);
import VistaScene from './scenes/battles/VistaScene.js';
import InstruccionesScene from './scenes/battles/InstruccionesScene.js';
import EstadisticasScene from './scenes/battles/EstadisticasScene.js';
import CodigoScene from './scenes/battles/CodigoScene.js';
import FinScene from './scenes/battles/FinScene.js';
import TimeScene from './scenes/battles/TimeScene.js';
import MenuScene from './scenes/MenuScene.js';
import GlobalMapScene from './scenes/maps/GlobalMapScene.js';
import HouseMapScene from './scenes/maps/HouseMapScene.js';
import ShopMapScene from './scenes/maps/ShopMapScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1700,
  height: 900,
  backgroundColor: '#2d2d2d',

  pixelArt: true,
  antialias: false,
  roundPixels: true,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },

  scene: [

    MenuScene,

    //══════════════════Escenas de Mapas══════════════════

    ShopMapScene,
    GlobalMapScene,
    HouseMapScene,

    //══════════════════Escenas de batalla══════════════════

    VistaScene,
    EstadisticasScene,
    InstruccionesScene,
    CodigoScene,
    TimeScene,
    FinScene

  ],
}
window.staticData = {
  batalla: 0
}
window.resetGameData = function () {
  window.gameData = {
    // Estado del juego
    fase: null,

    // última jugada
    vigencia: null,
    // conteo de jugadas
    jugada: 0,

    // Arrays de proyectiles por resolver
    objetivos_A: [],
    objetivos_E: [],

    // Lista de botones
    botonesAliados: [],
    textosAliados: [],
    botonesEnemigos: [],
    textosEnemigos: [],

    // sistema de guardado de jugadas
    The_box: [],

    // Selección actual del jugador
    seleccion: {
      aliado: null,
      enemigo: null
    },

    Aliados: [],
    aliadosVivos: [],

    Enemigos: [],
    enemigosVivos: []
  }
}

const game = new Phaser.Game(config);
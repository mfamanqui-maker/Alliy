import MenuScene from './scenes/MenuScene.js';
import GlobalMapScene from './scenes/maps/GlobalMapScene.js';
import HouseMapScene from './scenes/maps/HouseMapScene.js';
import ShopMapScene from './scenes/maps/ShopMapScene.js';
import Vista from './classes/battle/vista.js';
import tableroScene from './scenes/battles/tableroScene.js';
import entidadScene from './scenes/battles/entidadScene.js';

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
    Vista,
    tableroScene,
    entidadScene,
  ],
}
const game = new Phaser.Game(config);
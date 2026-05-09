import controladorBatalla from './controladorBatalla.js';

export default class Vista extends Phaser.Scene {
  constructor() {
    super({ key: 'vista' });
  }
  preload() {
    this.load.json('prueva', 'src/classes/battle/data/prueva.json');
  }
  create() {
    const data = this.cache.json.get('prueva');

    const batalla = new controladorBatalla(
      this,
      data.prueva1.configTablero,
      data.prueva1.casillasEspeciales,
      data.prueva1.equipos,
      data.prueva1.otros
    );
    batalla.iniciarBatalla();
  } //que elegante 7u7
}
export default class tableroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'tablero' });
  }
  init(data) {
    this.Tablero = data.Tablero;
  }
  create() {
    console.log(this.Tablero);
  }
}
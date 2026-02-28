export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }
  create () {
    this.add.text(850, 160, 'Hidalgos? v3', {
      fontSize: '100px',
      color: '#ffffff',
    }).setOrigin(0.5);

    let play = this.add.text(850, 800, `Jugar`, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#1d1d1d',
      padding: { x: 20, y: 15 }
    }).setInteractive({ useHandCursor: true }).setOrigin(0.5)
    play.on('pointerdown', () => this.scene.start('mapa'))
  }
}
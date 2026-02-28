export default class FinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'fin' });
  }

  preload() {
    this.load.image('GG', 'assets/20.PNG');
    this.load.image('XD', 'assets/146.png');
    this.scene.stop('vista')
    this.scene.stop('estadisticas')
    this.scene.stop('instrucciones')
    this.scene.stop('codigo')
  }

  create() {
    // Detener todas las escenas activas
    

    const W = 1700;
    const H = 900;
    const centroX = W / 2;
    const centroY = H / 2;

    // Fondo oscuro completo
    this.add.rectangle(centroX, centroY, W, H, 0x111111);

    // Marco exterior decorativo
    this.add.rectangle(centroX, centroY, W - 60, H - 60)
      .setStrokeStyle(4, 0x737070);

    // Marco interior
    this.add.rectangle(centroX, centroY, W - 100, H - 100)
      .setStrokeStyle(2, 0x737070);

    // Esquinas decorativas
    const esquinaSize = 30;
    const margen = 50;
    this.add.rectangle(margen, margen, esquinaSize, esquinaSize, 0x737070);
    this.add.rectangle(W - margen, margen, esquinaSize, esquinaSize, 0x737070);
    this.add.rectangle(margen, H - margen, esquinaSize, esquinaSize, 0x737070);
    this.add.rectangle(W - margen, H - margen, esquinaSize, esquinaSize, 0x737070);

    // Diamante central decorativo
    const diamante = this.add.graphics();
    diamante.lineStyle(3, 0x737070, 0.3);
    diamante.beginPath();
    diamante.moveTo(centroX, centroY - 200);
    diamante.lineTo(centroX + 300, centroY);
    diamante.lineTo(centroX, centroY + 200);
    diamante.lineTo(centroX - 300, centroY);
    diamante.closePath();
    diamante.strokePath();

    // Líneas decorativas horizontales
    const lineas = this.add.graphics();
    lineas.lineStyle(1, 0x737070, 0.4);
    lineas.beginPath();
    lineas.moveTo(100, centroY - 120);
    lineas.lineTo(W - 100, centroY - 120);
    lineas.strokePath();
    lineas.beginPath();
    lineas.moveTo(100, centroY + 120);
    lineas.lineTo(W - 100, centroY + 120);
    lineas.strokePath();

    // Resultado: victoria o derrota
    const win = window.gameData;

    if (win.enemigos_vivos.length === 0) {
      this.add.text(centroX, centroY - 340, 'GG', {
        fontSize: '96px',
        color: '#7c7c7c',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.image(centroX, centroY, 'GG').setOrigin(0.5).setScale(1.8);

      this.add.text(centroX, centroY + 250, 'Ya w ponte a chambiar', {
        fontSize: '28px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
    } else {
      this.add.text(centroX, centroY - 340, 'Lamentable', {
        fontSize: '96px',
        color: '#aaaaaa',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.image(centroX, centroY, 'XD').setOrigin(0.5);

      this.add.text(centroX, centroY + 250, 'Vamos a decir que solo estabas Testeando', {
        fontSize: '28px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
    }

    // Texto inferior
    this.add.text(centroX, centroY + 340, 'HIDALGOS? v2', {
      fontSize: '24px',
      color: '#555555',
    }).setOrigin(0.5);
  }
}
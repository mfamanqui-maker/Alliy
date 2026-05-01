export default class tableroScene extends Phaser.Scene {
  constructor() {
    super({ key: "tablero" });
    this.tileSize = 400;
    this.tableroData = [];
  }
  create() {
    const ArrayPlano = this.scene.settings.data.ArrayExportado
    const tileSize = this.tileSize;
    this.tableroData = ArrayPlano;

    this.celdas = [];

    for (let y = 0; y < ArrayPlano.length; y++) { //Generar el tablero con Phaser
      for (let x = 0; x < ArrayPlano[y].length; x++) {

        const rect = this.add.graphics();
        rect.fillStyle(0x212121, 1);
        rect.lineStyle(6, 0x000000, 1);
        rect.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        rect.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

        this.celdas.push(rect);
      };
    };

    for (let y = 0; y < ArrayPlano.length; y++) { //Incorporar la referencia de cada casilla Phaser al tablero lógico
      for (let x = 0; x < ArrayPlano[y].length; x++) {
        ArrayPlano[y][x].casillaPhaser = this.celdas[y * ArrayPlano[y].length + x]
      }
    }
    console.log(ArrayPlano)

    this.zoom();
    this.movimiento();
    this.seleccionarCasilla((col, fila) => {

      setTimeout (() => {
        this.redibujarCasilla(col, fila, this.tableroData, 0x212121)
      }, 1000)

      this.redibujarCasilla(col, fila, this.tableroData, 0x363636);
    });
  
  }

  zoom() {
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      const cam = this.cameras.main;
    
      cam.zoom -= deltaY * 0.001;
    
      cam.zoom = Phaser.Math.Clamp(cam.zoom, 0.5, 2);
    });
  }

  movimiento() {
    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x);
        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
      }
    });
  }

  seleccionarCasilla(action) {
    this.input.on("pointerdown", (pointer) => {
      const tileSize = 400;
    
      const worldPoint = pointer.positionToCamera(this.cameras.main);
    
      const x = Math.floor(worldPoint.x / tileSize) + 1 > 0 ? Math.floor(worldPoint.x / tileSize) + 1 : false;
      const y = Math.floor(worldPoint.y / tileSize) + 1 > 0 ? Math.floor(worldPoint.y / tileSize) + 1 : false;
    
      (x && y) && action(x, y); //elegante 
    });
  }

  redibujarCasilla(col, fila, tablero, color) {
    const x = col - 1;
    const y = fila - 1;

    if (!tablero?.[y]?.[x]?.casillaPhaser) return;

    const casilla = tablero[y][x].casillaPhaser;
    const tileSize = this.tileSize;

    casilla.clear();
    casilla.fillStyle(color, 1);  
    casilla.lineStyle(6, 0x000000, 1);
    casilla.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    casilla.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }
}
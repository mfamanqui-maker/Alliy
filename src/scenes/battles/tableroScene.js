export default class tableroScene extends Phaser.Scene {
  constructor() {
    super({ key: "tablero" });
    this.tileSize = 400;
    this.tableroData = [];
    this.overlayBrillo = null;
    this.tweenBrillo = null;
  }

  preload() {
    this.load.spritesheet('grass', 'assets/images/grass.png', { frameWidth: 46, frameHeight: 46 });
  }

  create() {
    const ArrayPlano = this.scene.settings.data.ArrayExportado
    const tileSize = this.tileSize;
    this.tableroData = ArrayPlano;

    this.celdas = [];

    for (let y = 0; y < ArrayPlano.length; y++) {
      for (let x = 0; x < ArrayPlano[y].length; x++) {
        if (ArrayPlano[y][x].id === 0) {
          ArrayPlano[y][x].casillaPhaser = null;
          continue;
        }
        const random = Phaser.Math.Between(0, 8);
        const grass = this.add.sprite(x * tileSize, y * tileSize, 'grass', random).setScale(8.7);
        grass.setSize(tileSize, tileSize);
        grass.setOrigin(0, 0);
        ArrayPlano[y][x].casillaPhaser = grass;
        this.celdas.push(grass);
      }
    }

    this.zoom();
    this.movimiento();
    this.seleccionarCasilla((col, fila) => {
      this.redibujarCasilla(col, fila, this.tableroData);
    });

    if (this.tableroData[0][0].entidad !== false) {
      
    }
  }

  zoom() {
    const zoomMin = 0.25;
    const zoomMax = 4;

    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      const cam = this.cameras.main;

      cam.zoom -= deltaY * 0.001;

      cam.zoom = Phaser.Math.Clamp(cam.zoom, zoomMin, zoomMax);
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
      const tileSize = this.tileSize;
      const worldPoint = pointer.positionToCamera(this.cameras.main);

      const col = Math.floor(worldPoint.x / tileSize) + 1;
      const fila = Math.floor(worldPoint.y / tileSize) + 1;

      if (col < 1 || fila < 1) return;
      if (fila > this.tableroData.length || col > this.tableroData[fila - 1].length) return;

      const casilla = this.tableroData[fila - 1][col - 1];
      if (!casilla || casilla.id === 0) return;

      action(col, fila);

      if (casilla.entidad !== false) {
        const instancia = casilla.entidad.aliadoEspecifico || casilla.entidad.enemigoEspecifico;
        casilla.entidad.moldePhaser.coneccionGeneral(instancia, "this.controlador.acciones");
      }
    });
  }

  quitarBrillo() {
    if (this.tweenBrillo) {
      this.tweenBrillo.stop();
      this.tweenBrillo.remove();
      this.tweenBrillo = null;
    }

    if (this.overlayBrillo) {
      this.overlayBrillo.destroy();
      this.overlayBrillo = null;
    }
  }

  redibujarCasilla(col, fila, tablero, duracionMs = 1800) {
    const x = col - 1;
    const y = fila - 1;

    if (!tablero?.[y]?.[x]?.casillaPhaser) return;

    this.quitarBrillo();

    const sprite = tablero[y][x].casillaPhaser;
    const tileSize = this.tileSize;
    const px = x * tileSize;
    const py = y * tileSize;

    const overlay = this.add.rectangle(
      px + tileSize / 2,
      py + tileSize / 2,
      tileSize,
      tileSize,
      0xffffff,
      0.35
    );
    overlay.setDepth(sprite.depth + 1);
    overlay.setBlendMode(Phaser.BlendModes.ADD);

    this.overlayBrillo = overlay;

    this.tweenBrillo = this.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: duracionMs,
      ease: "Cubic.easeOut",
      onComplete: () => this.quitarBrillo(),
    });
  }
}

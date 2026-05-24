import tablero from '../../classes/battle/tablero.js';
import {
  initAutotileConfig,
  precargarTexturasBorde,
  registrarActualizadorBordes,
  refrescarBordesTablero,
} from './autotile/renderBordesTablero.js';
import { abrirPanelEntidad } from './ui/PanelEntidad/index.js';

const DOBLE_CLICK_MS = 320;

export default class tableroScene extends Phaser.Scene {
  constructor() {
    super({ key: "tablero" });
    this.tileSize = 400;
    this.escalaCasilla = 8.7;
    this.tableroData = [];
    this.overlayBrillo = null;
    this.tweenBrillo = null;
    this.actualizadorBordes = null;
    this.entidadSeleccionada = null;
    this._teclaEnterRegistrada = false;
    this._idEntidadInicial = null;
    this._ultimoClickEntidad = { entidad: null, t: 0 };
  }

  preload() {
    this.load.json('bordesFrames', 'src/scenes/battles/autotile/bordesFrames.json');
    this.load.spritesheet('grass', 'assets/images/grass.png', { frameWidth: 46, frameHeight: 46 });
  }

  create() {
    if (!this.cache.json.exists('bordesFrames')) {
      console.error('tableroScene: no se cargó bordesFrames.json');
      return;
    }

    initAutotileConfig(this.cache.json.get('bordesFrames'));
    precargarTexturasBorde(this);

    if (this.load.list.size > 0) {
      this.load.once('complete', () => this._inicializarTablero());
      this.load.start();
      return;
    }

    this._inicializarTablero();
  }

  _inicializarTablero() {
    const ArrayPlano = this.scene.settings.data.ArrayExportado;
    const tileSize = this.tileSize;
    this.tableroData = ArrayPlano;

    this.celdas = [];

    for (let y = 0; y < ArrayPlano.length; y++) {
      for (let x = 0; x < ArrayPlano[y].length; x++) {
        if (ArrayPlano[y][x].id === 0) {
          ArrayPlano[y][x].casillaPhaser = null;
          ArrayPlano[y][x].bordePhaser = null;
          continue;
        }
        const random = Phaser.Math.Between(0, 8);
        const grass = this.add.sprite(x * tileSize, y * tileSize, 'grass', random).setScale(this.escalaCasilla);
        grass.setSize(tileSize, tileSize);
        grass.setOrigin(0, 0);
        grass.setDepth(0);
        ArrayPlano[y][x].casillaPhaser = grass;
        this.celdas.push(grass);
      }
    }

    this.actualizadorBordes = registrarActualizadorBordes(this, this.tableroData, {
      tileSize,
      escala: this.escalaCasilla,
      depthBorde: 5,
      intervaloMs: 300,
    });
    this.actualizadorBordes.refrescarTodo();

    this.zoom();
    this.movimiento();
    this._registrarTeclaEnter();
    this.seleccionarCasilla((col, fila) => {
      this.redibujarCasilla(col, fila, this.tableroData);
    });
  }

  _registrarTeclaEnter() {
    if (this._teclaEnterRegistrada || !this.input?.keyboard) return;
    this._teclaEnterRegistrada = true;
    this.input.keyboard.on('keydown-ENTER', () => this._abrirPanelEntidadSeleccionada());
  }

  _abrirPanelEntidadSeleccionada() {
    if (!this.entidadSeleccionada) return;
    this._abrirPanelDetalle(this.entidadSeleccionada);
  }

  _cambiarEntidadSeleccionada(nuevaEntidad) {
    if (this.entidadSeleccionada === nuevaEntidad) return;

    if (this.entidadSeleccionada?.moldePhaser?.onDeseleccionar) {
      this.entidadSeleccionada.moldePhaser.onDeseleccionar();
    }

    this.entidadSeleccionada = nuevaEntidad;

    if (!this.entidadSeleccionada) return;

    const instancia =
      this.entidadSeleccionada.aliadoEspecifico || this.entidadSeleccionada.enemigoEspecifico;

    this.entidadSeleccionada.moldePhaser?.onSeleccionar?.(
      instancia,
      this.scene.settings.data.controlador.pilaDetareas
    );
  }

  _resolverBandoDeEntidad(entidad) {
    if (!entidad) return 'Aliados';
    if (entidad.aliadoEspecifico) return 'Aliados';
    if (entidad.enemigoEspecifico) return 'Enemigos';
    return 'Aliados';
  }

  _obtenerEscenaEntidad() {
    return this.scene.get('entidad');
  }

  _resolverMoldePorId(id) {
    const entidad = this._obtenerEscenaEntidad();
    if (!entidad) return null;
    const candidatos = [...(entidad.aliados ?? []), ...(entidad.enemigos ?? [])];
    return candidatos.find((c) => c?.data?.id == id) ?? null;
  }

  _construirOpcionesPanel(entidad) {
    const escenaEntidad = this._obtenerEscenaEntidad();
    const equipos = escenaEntidad?.equipos ?? this.scene.settings.data?.equipos ?? { Aliados: [], Enemigos: [] };
    const bando = this._resolverBandoDeEntidad(entidad);
    const especifico = entidad.aliadoEspecifico ?? entidad.enemigoEspecifico;

    if (typeof especifico?.propiedadesEspeciales === 'function') {
      especifico.propiedadesEspeciales(especifico);
    }
    const datos = entidad.moldePhaser?.obtenerDatosDetalle?.();
    if (!datos) return null;
    this._idEntidadInicial = entidad.data?.id ?? especifico?.id ?? null;

    return {
      ...datos,
      equipos,
      bando,
      idActual: entidad.data?.id ?? especifico?.id ?? null,
      idInicial: this._idEntidadInicial,
      escenaAPausar: this,
      onResolverEntidad: (id) => {
        const molde = this._resolverMoldePorId(id);
        if (!molde) return null;
        const inst = molde.aliadoEspecifico ?? molde.enemigoEspecifico;
        if (typeof inst?.propiedadesEspeciales === 'function') {
          inst.propiedadesEspeciales(inst);
        }
        const datosResueltos = molde.moldePhaser?.obtenerDatosDetalle?.();
        if (!datosResueltos) return null;
        return {
          ...datosResueltos,
          equipos,
          idActual: id,
        };
      },
    };
  }

  _abrirPanelDetalle(entidad) {
    if (!entidad) return;
    const escenaEntidad = this._obtenerEscenaEntidad();
    if (!escenaEntidad) return;

    const opciones = this._construirOpcionesPanel(entidad);
    if (!opciones) return;

    if (escenaEntidad.panelEntidadActivo) {
      escenaEntidad.panelEntidadActivo.actualizar(opciones);
      return;
    }

    abrirPanelEntidad(escenaEntidad, opciones);
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
        const entidad = casilla.entidad;
        const ahora = pointer.downTime ?? Date.now();
        const esDoble =
          this._ultimoClickEntidad.entidad === entidad &&
          ahora - this._ultimoClickEntidad.t <= DOBLE_CLICK_MS;
        this._ultimoClickEntidad = { entidad, t: ahora };

        this._cambiarEntidadSeleccionada(entidad);

        if (esDoble) {
          this._abrirPanelDetalle(entidad);
        }
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

  notificarCambioCasilla(col, fila) {
    if (this.actualizadorBordes) {
      this.actualizadorBordes.marcarRegion(col - 1, fila - 1);
    }
  }

  actualizarBordesRegion(col, fila) {
    const opts = { tileSize: this.tileSize, escala: this.escalaCasilla };
    if (col != null && fila != null) {
      refrescarBordesTablero(this, this.tableroData, {
        ...opts,
        region: [{ x: col - 1, y: fila - 1 }],
      });
    } else if (this.actualizadorBordes) {
      this.actualizadorBordes.refrescarTodo();
    }
  }

  redibujarCasilla(col, fila, tablero, duracionMs = 1800) {
    const x = col - 1;
    const y = fila - 1;

    if (!tablero?.[y]?.[x]?.casillaPhaser) return;

    this.quitarBrillo();

    const celda = tablero[y][x];
    const sprite = celda.casillaPhaser;
    const borde = celda.bordePhaser;
    const tileSize = this.tileSize;
    const px = x * tileSize;
    const py = y * tileSize;
    const depthBase = Math.max(sprite.depth, borde?.depth ?? 0);

    const overlay = this.add.rectangle(
      px + tileSize / 2,
      py + tileSize / 2,
      tileSize,
      tileSize,
      0xffffff,
      0.35
    );
    overlay.setDepth(depthBase + 2);
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

  shutdown() {
    this._cambiarEntidadSeleccionada(null);
    this.actualizadorBordes?.detener();
    this.quitarBrillo();
  }
}

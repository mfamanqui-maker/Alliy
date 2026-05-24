export default class Aliados {
  /**
   * @param {import('../../../../classes/battle/familias/bases/baseGeneral.js').DatosEntidad} data
   * @param {Phaser.Scene} sceneEntidad - instancia de la escena `entidad`
   */
  constructor(data, sceneEntidad) {
    this.data = data;
    this.sceneEntidad = sceneEntidad;
    this.pilaDetareas = null;
    this.aliadoEspecifico = null;
    this.orbesSeleccion = [];
    this._updateOrbesHandler = null;
  }

  /** @returns {Phaser.Scene | undefined} */
  obtenerEscenaTablero() {
    return this.sceneEntidad?.scene?.get?.('tablero');
  }

  iniciarAliado(aliadoEspecifico) {
    this.aliadoEspecifico = aliadoEspecifico ?? null;
    const tablero = this.obtenerEscenaTablero();
    const tileSize = tablero?.tileSize ?? 400;

    if (typeof aliadoEspecifico.construirAnimacionEstatica === 'function') {
      aliadoEspecifico.construirAnimacionEstatica(this.sceneEntidad);
    }

    if (!tablero) {
      return Promise.resolve();
    }

    return aliadoEspecifico.ubicarEnCasillaAsync(tablero, {
      col: this.data.posicion.x,
      fila: this.data.posicion.y,
      tamanoCasilla: tileSize,
      orientacion: 'derecha',
    });
  }

  _detenerSeguimientoOrbes() {
    const tablero = this.obtenerEscenaTablero();
    if (this._updateOrbesHandler && tablero?.events) {
      tablero.events.off('update', this._updateOrbesHandler);
    }
    this._updateOrbesHandler = null;
  }

  _calcularObjetivosOrbes() {
    const sprite = this.aliadoEspecifico?.sprite;
    if (!sprite?.active) return null;

    const radio = 18;
    const semieje = Math.max(sprite.displayWidth, sprite.displayHeight) * 0.5;
    const distancia = semieje;

    return {
      centro: { x: sprite.x, y: sprite.y },
      radio,
      posiciones: [
        { x: sprite.x - distancia, y: sprite.y + distancia },
        { x: sprite.x - distancia, y: sprite.y },
        { x: sprite.x - distancia, y: sprite.y - distancia },
      ],
    };
  }

  _crearOrbesSeleccion() {
    if (this.orbesSeleccion.length > 0) return;
    const tablero = this.obtenerEscenaTablero();
    const objetivos = this._calcularObjetivosOrbes();
    if (!tablero || !objetivos) return;

    this.orbesSeleccion = objetivos.posiciones.map(() => {
      const orbe = tablero.add.circle(objetivos.centro.x, objetivos.centro.y, objetivos.radio, 0x7ed4ff, 0.9);
      orbe.setDepth(20);
      orbe.setStrokeStyle(3, 0xffffff, 0.9);
      orbe.setScale(0.2);
      orbe.setAlpha(0);
      return orbe;
    });
  }

  _animarEntradaOrbes() {
    const tablero = this.obtenerEscenaTablero();
    const objetivos = this._calcularObjetivosOrbes();
    if (!tablero || !objetivos || this.orbesSeleccion.length === 0) return;

    this.orbesSeleccion.forEach((orbe, indice) => {
      orbe.setPosition(objetivos.centro.x, objetivos.centro.y);
      tablero.tweens.killTweensOf(orbe);
      tablero.tweens.add({
        targets: orbe,
        x: objetivos.posiciones[indice].x,
        y: objetivos.posiciones[indice].y,
        alpha: 1,
        scale: 1,
        duration: 180 + indice * 30,
        ease: 'Sine.easeOut',
      });
    });
  }

  _seguirOrbes() {
    const tablero = this.obtenerEscenaTablero();
    if (!tablero || this.orbesSeleccion.length === 0) return;

    this._detenerSeguimientoOrbes();
    this._updateOrbesHandler = () => {
      const objetivos = this._calcularObjetivosOrbes();
      if (!objetivos) return;

      this.orbesSeleccion.forEach((orbe, indice) => {
        if (!orbe?.active) return;
        orbe.x = objetivos.posiciones[indice].x;
        orbe.y = objetivos.posiciones[indice].y;
      });
    };
    tablero.events.on('update', this._updateOrbesHandler);
  }

  _animarSalidaOrbes() {
    const tablero = this.obtenerEscenaTablero();
    const objetivos = this._calcularObjetivosOrbes();
    if (!tablero || !objetivos || this.orbesSeleccion.length === 0) {
      this._destruirOrbes();
      return;
    }

    this._detenerSeguimientoOrbes();
    let restantes = this.orbesSeleccion.length;

    this.orbesSeleccion.forEach((orbe) => {
      tablero.tweens.killTweensOf(orbe);
      tablero.tweens.add({
        targets: orbe,
        x: objetivos.centro.x,
        y: objetivos.centro.y,
        alpha: 0,
        scale: 0.2,
        duration: 160,
        ease: 'Sine.easeIn',
        onComplete: () => {
          orbe.destroy();
          restantes -= 1;
          if (restantes <= 0) {
            this.orbesSeleccion = [];
          }
        },
      });
    });
  }

  _destruirOrbes() {
    this._detenerSeguimientoOrbes();
    this.orbesSeleccion.forEach((orbe) => orbe.destroy());
    this.orbesSeleccion = [];
  }

  onSeleccionar(aliadoEspecifico, pilaDetareas) {
    this.pilaDetareas = pilaDetareas;
    this.aliadoEspecifico = aliadoEspecifico;
    if (!this.aliadoEspecifico) return;
    this.aliadoEspecifico.propiedadesEspeciales(this.aliadoEspecifico);

    this._crearOrbesSeleccion();
    this._animarEntradaOrbes();
    this._seguirOrbes();
  }

  onDeseleccionar() {
    this._animarSalidaOrbes();
  }

  /**
   * Devuelve el shape esperado por `abrirPanelEntidad`.
   * Las descripciones (texto largo por ítem) viven aparte en
   * `ui/PanelEntidad/descripciones/*.json` — aquí solo se pasa nombre+cantidad.
   */
  obtenerDatosDetalle() {
    if (!this.aliadoEspecifico) return null;
    if (typeof this.aliadoEspecifico.propiedadesEspeciales === 'function') {
      this.aliadoEspecifico.propiedadesEspeciales(this.aliadoEspecifico);
    }
    return construirDatosDetalle(this.aliadoEspecifico, 'Aliados');
  }
}

const ICONO_DEFECTO = 'assets/images/candle.png';

function aItems(lista, etiquetaCantidad = '') {
  return (lista ?? []).map((nombre) => ({
    imagen: ICONO_DEFECTO,
    nombre: String(nombre ?? ''),
    cantidad: etiquetaCantidad,
  }));
}

export function construirDatosDetalle(entidadEspecifica, bando) {
  const stats = entidadEspecifica.estadisticas ?? {};
  const lda = entidadEspecifica.listaDeAcciones ?? {};
  const hp = Number(stats.hp ?? 0);
  const estadisticas = Object.entries(stats)
    .filter(([clave]) => clave.toLowerCase() !== 'hp')
    .map(([clave, valor]) => ({
      imagen: ICONO_DEFECTO,
      nombre: String(clave).toUpperCase(),
      cantidad: valor,
    }));

  const acciones = aItems(lda.habilidades);
  const objetos = aItems(lda.objetos);
  const movimiento = aItems(lda.Movimiento ?? lda.movimiento);

  return {
    id: entidadEspecifica.id,
    bando,
    nombre: entidadEspecifica.datos?.arquetipo ?? '',
    foto: ICONO_DEFECTO,
    vida: { vidaActual: hp, vidaMaxima: hp },
    estadisticas,
    efectos: [],
    acciones,
    objetos,
    movimiento,
  };
}

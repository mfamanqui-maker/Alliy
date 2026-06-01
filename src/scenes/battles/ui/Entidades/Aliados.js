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
    this.entidadAliada = null;
    this.acciones = [[], [], []];
    this.objetivoSeleccionado = null;
    this.tareaPendienteObjetivo = null;
    this.orbesSeleccion = [];
    this.flechasNavegacion = [];
    this.marcasObjetivo = [];
    this._handlersObjetivo = [];
    this._updateOrbesHandler = null;
    this._keydownOrbesHandler = null;
    this._keydownObjetivoHandler = null;
    this._estaSeleccionado = false;
    this._cadenaActual = 'principal';
    this._offsetCadena = 0;
    this._transicionandoOrbes = false;
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
    const xOrbes = sprite.x - distancia;

    return {
      centro: { x: sprite.x, y: sprite.y },
      radio,
      posiciones: [
        { x: xOrbes, y: sprite.y + distancia },
        { x: xOrbes, y: sprite.y },
        { x: xOrbes, y: sprite.y - distancia },
      ],
      flechaArriba: { x: xOrbes, y: sprite.y - distancia - radio * 5 },
      flechaAbajo: { x: xOrbes, y: sprite.y + distancia + radio * 5 },
    };
  }

  _resolverEntidadAliada(entidadAliada) {
    if (entidadAliada) return entidadAliada;
    return this.sceneEntidad?.aliados?.find((aliado) => (
      aliado?.aliadoEspecifico === this.aliadoEspecifico ||
      aliado?.data?.id === this.data?.id
    )) ?? null;
  }

  _obtenerCategoriasPrincipales() {
    return [
      { tipo: 'principal', clave: 'movimiento', nombre: 'MOVIMIENTO', indiceAcciones: 2, color: 0x8be66f },
      { tipo: 'principal', clave: 'habilidades', nombre: 'HABILIDAD', indiceAcciones: 0, color: 0x7ed4ff },
      { tipo: 'principal', clave: 'objetos', nombre: 'OBJETO', indiceAcciones: 1, color: 0xf5d36a },
    ];
  }

  _obtenerCategoriaActual() {
    return this._obtenerCategoriasPrincipales().find((categoria) => categoria.clave === this._cadenaActual) ?? null;
  }

  _obtenerElementosCadenaActual() {
    if (this._cadenaActual === 'principal') {
      return this._obtenerCategoriasPrincipales();
    }

    const categoria = this._obtenerCategoriaActual();
    const acciones = this.acciones?.[categoria?.indiceAcciones] ?? [];
    return acciones.map((accion, indiceAccion) => ({
      tipo: 'accion',
      nombre: accion.nombre ?? `ACCION ${indiceAccion + 1}`,
      accion,
      indiceAccion,
      color: accion.condicional === false ? 0x7a7a7a : 0x7ed4ff,
    }));
  }

  _obtenerElementosVisibles() {
    return this._obtenerElementosCadenaActual().slice(this._offsetCadena, this._offsetCadena + 3);
  }

  _limpiarReferenciasOrbesAcciones() {
    this.acciones.flat().forEach((accion) => {
      if (accion) accion.orbePhaser = null;
    });
  }

  _crearOrbe(meta, indice, objetivos) {
    const tablero = this.obtenerEscenaTablero();
    if (!tablero || !objetivos) return;

    const orbe = tablero.add.circle(objetivos.centro.x, objetivos.centro.y, objetivos.radio, meta.color, 0.9);
    orbe.setDepth(20);
    orbe.setStrokeStyle(3, 0xffffff, 0.9);
    orbe.setScale(0.2);
    orbe.setAlpha(0);
    orbe.setInteractive({ useHandCursor: true });

    const etiqueta = tablero.add.text(objetivos.centro.x, objetivos.centro.y, String(meta.nombre).toUpperCase().slice(0, 14), {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    etiqueta.setOrigin(0.5);
    etiqueta.setDepth(21);
    etiqueta.setScale(0.2);
    etiqueta.setAlpha(0);

    orbe.on('pointerdown', (pointer, localX, localY, event) => {
      event?.stopPropagation?.();
      this._manejarClickOrbe(meta);
    });

    if (meta.accion) {
      meta.accion.orbePhaser = orbe;
    }

    const entrada = { orbe, etiqueta, meta, indice };
    this.orbesSeleccion.push(entrada);
    return entrada;
  }

  _crearOrbesSeleccion() {
    if (this.orbesSeleccion.length > 0) return;
    const objetivos = this._calcularObjetivosOrbes();
    if (!objetivos) return;

    this._limpiarReferenciasOrbesAcciones();
    this._obtenerElementosVisibles().forEach((meta, indice) => this._crearOrbe(meta, indice, objetivos));
  }

  _animarEntradaOrbes(direccion = 0) {
    const tablero = this.obtenerEscenaTablero();
    const objetivos = this._calcularObjetivosOrbes();
    if (!tablero || !objetivos || this.orbesSeleccion.length === 0) return;

    this.orbesSeleccion.forEach((entrada, indice) => {
      const { orbe, etiqueta } = entrada;
      const destino = objetivos.posiciones[indice];
      const origen = direccion === 0
        ? objetivos.centro
        : { x: destino.x, y: destino.y + direccion * 70 };

      orbe.setPosition(origen.x, origen.y);
      etiqueta.setPosition(origen.x, origen.y);
      tablero.tweens.killTweensOf([orbe, etiqueta]);
      tablero.tweens.add({
        targets: [orbe, etiqueta],
        x: destino.x,
        y: destino.y,
        alpha: 1,
        scale: 3,
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

      this.orbesSeleccion.forEach(({ orbe, etiqueta }, indice) => {
        if (!orbe?.active) return;
        const posicion = objetivos.posiciones[indice];
        orbe.x = posicion.x;
        orbe.y = posicion.y;
        if (etiqueta?.active) {
          etiqueta.x = posicion.x;
          etiqueta.y = posicion.y;
        }
      });
      this._actualizarPosicionFlechas(objetivos);
    };
    tablero.events.on('update', this._updateOrbesHandler);
  }

  _animarSalidaOrbes(onComplete = null) {
    const tablero = this.obtenerEscenaTablero();
    const objetivos = this._calcularObjetivosOrbes();
    if (!tablero || !objetivos || this.orbesSeleccion.length === 0) {
      this._destruirOrbes();
      onComplete?.();
      return;
    }

    this._detenerSeguimientoOrbes();
    this._destruirFlechasNavegacion();
    let restantes = this.orbesSeleccion.length;

    this.orbesSeleccion.forEach(({ orbe, etiqueta }) => {
      tablero.tweens.killTweensOf([orbe, etiqueta]);
      tablero.tweens.add({
        targets: [orbe, etiqueta],
        x: objetivos.centro.x,
        y: objetivos.centro.y,
        alpha: 0,
        scale: 0.2,
        duration: 160,
        ease: 'Sine.easeIn',
        onComplete: () => {
          orbe.destroy();
          etiqueta?.destroy();
          restantes -= 1;
          if (restantes <= 0) {
            this.orbesSeleccion = [];
            this._limpiarReferenciasOrbesAcciones();
            onComplete?.();
          }
        },
      });
    });
  }

  _destruirOrbes() {
    this._detenerSeguimientoOrbes();
    this.orbesSeleccion.forEach(({ orbe, etiqueta }) => {
      orbe?.destroy();
      etiqueta?.destroy();
    });
    this.orbesSeleccion = [];
    this._limpiarReferenciasOrbesAcciones();
  }

  _mostrarCadena(cadena, offset = 0, direccion = 0, conSalida = true) {
    if (this._transicionandoOrbes) return;
    this._transicionandoOrbes = true;

    const crearEntrada = () => {
      if (!this._estaSeleccionado) {
        this._transicionandoOrbes = false;
        return;
      }

      this._cadenaActual = cadena;
      this._offsetCadena = Math.max(0, offset);
      this._crearOrbesSeleccion();
      this._animarEntradaOrbes(direccion);
      this._crearFlechasNavegacion();
      this._seguirOrbes();
      this._transicionandoOrbes = false;
    };

    if (conSalida && this.orbesSeleccion.length > 0) {
      this._animarSalidaOrbes(crearEntrada);
      return;
    }

    this._destruirOrbes();
    this._destruirFlechasNavegacion();
    crearEntrada();
  }

  _claveMeta(meta) {
    return meta.tipo === 'accion'
      ? `accion:${meta.indiceAccion}`
      : `principal:${meta.clave}`;
  }

  _animarNavegacionCadena(direccion) {
    const tablero = this.obtenerEscenaTablero();
    const objetivos = this._calcularObjetivosOrbes();
    if (!tablero || !objetivos || this._transicionandoOrbes) return;

    const nuevoOffset = this._offsetCadena + direccion;
    const maxOffset = Math.max(0, this._obtenerElementosCadenaActual().length - 3);
    if (nuevoOffset < 0 || nuevoOffset > maxOffset) return;

    this._transicionandoOrbes = true;
    this._detenerSeguimientoOrbes();
    this._destruirFlechasNavegacion();

    const entradasActuales = [...this.orbesSeleccion];
    const entradasPorClave = new Map(
      entradasActuales.map((entrada) => [this._claveMeta(entrada.meta), entrada])
    );

    this._offsetCadena = nuevoOffset;
    const nuevasEntradas = [];
    const nuevasMetas = this._obtenerElementosVisibles();
    const origenNuevo = direccion > 0
      ? { x: objetivos.posiciones[2].x, y: objetivos.posiciones[2].y - 70 }
      : { x: objetivos.posiciones[0].x, y: objetivos.posiciones[0].y + 70 };

    nuevasMetas.forEach((meta, indice) => {
      const clave = this._claveMeta(meta);
      const entradaExistente = entradasPorClave.get(clave);

      if (entradaExistente) {
        entradaExistente.meta = meta;
        entradaExistente.indice = indice;
        if (meta.accion) meta.accion.orbePhaser = entradaExistente.orbe;
        entradasPorClave.delete(clave);
        nuevasEntradas.push(entradaExistente);
        return;
      }

      const nuevaEntrada = this._crearOrbe(meta, indice, objetivos);
      if (!nuevaEntrada) return;
      nuevaEntrada.orbe.setPosition(origenNuevo.x, origenNuevo.y);
      nuevaEntrada.etiqueta.setPosition(origenNuevo.x, origenNuevo.y);
      nuevaEntrada.orbe.setScale(3);
      nuevaEntrada.etiqueta.setScale(3);
      nuevaEntrada.orbe.setAlpha(0);
      nuevaEntrada.etiqueta.setAlpha(0);
      nuevasEntradas.push(nuevaEntrada);
    });

    const salientes = [...entradasPorClave.values()];
    const destinoSalida = direccion > 0
      ? { x: objetivos.posiciones[0].x, y: objetivos.posiciones[0].y + 70 }
      : { x: objetivos.posiciones[2].x, y: objetivos.posiciones[2].y - 70 };
    let pendientes = nuevasEntradas.length + salientes.length;

    const finalizarTween = () => {
      pendientes -= 1;
      if (pendientes > 0) return;
      this.orbesSeleccion = nuevasEntradas;
      this._crearFlechasNavegacion();
      this._seguirOrbes();
      this._transicionandoOrbes = false;
    };

    nuevasEntradas.forEach((entrada, indice) => {
      const destino = objetivos.posiciones[indice];
      tablero.tweens.killTweensOf([entrada.orbe, entrada.etiqueta]);
      tablero.tweens.add({
        targets: [entrada.orbe, entrada.etiqueta],
        x: destino.x,
        y: destino.y,
        alpha: 1,
        scale: 3,
        duration: 180,
        ease: 'Sine.easeOut',
        onComplete: finalizarTween,
      });
    });

    salientes.forEach((entrada) => {
      if (entrada.meta?.accion) entrada.meta.accion.orbePhaser = null;
      tablero.tweens.killTweensOf([entrada.orbe, entrada.etiqueta]);
      tablero.tweens.add({
        targets: [entrada.orbe, entrada.etiqueta],
        x: destinoSalida.x,
        y: destinoSalida.y,
        alpha: 0,
        duration: 160,
        ease: 'Sine.easeIn',
        onComplete: () => {
          entrada.orbe?.destroy();
          entrada.etiqueta?.destroy();
          finalizarTween();
        },
      });
    });

    if (pendientes === 0) {
      this.orbesSeleccion = nuevasEntradas;
      this._crearFlechasNavegacion();
      this._seguirOrbes();
      this._transicionandoOrbes = false;
    }
  }

  _manejarClickOrbe(meta) {
    if (meta.tipo === 'principal') {
      this._mostrarCadena(meta.clave, 0, 0);
      return;
    }

    const nuevaTarea = {
      accion: meta.accion,
      aliado: this.aliadoEspecifico,
      entidad: this.entidadAliada,
      objetivo: null,
      objetivoEntidad: null,
    };
    this._iniciarSeleccionObjetivo(nuevaTarea);
  }

  _normalizarBandosObjetivo(casoDeEleccion) {
    if (casoDeEleccion == null || casoDeEleccion === false) return [];
    if (Array.isArray(casoDeEleccion)) {
      return casoDeEleccion.flatMap((caso) => this._normalizarBandosObjetivo(caso));
    }

    const valor = String(casoDeEleccion).toLowerCase();
    if (valor.includes('ambos') || valor.includes('todos')) return ['Aliados', 'Enemigos'];
    if (valor.includes('aliad')) return ['Aliados'];
    if (valor.includes('enemig')) return ['Enemigos'];
    return [];
  }

  _obtenerCandidatosObjetivo(bandos) {
    const candidatos = [];
    const incluirAliados = bandos.includes('Aliados');
    const incluirEnemigos = bandos.includes('Enemigos');

    if (incluirAliados) {
      (this.sceneEntidad?.aliados ?? []).forEach((entidad) => {
        const especifico = entidad?.aliadoEspecifico;
        if (especifico?.sprite?.active) {
          candidatos.push({ bando: 'Aliados', entidad, especifico, sprite: especifico.sprite });
        }
      });
    }

    if (incluirEnemigos) {
      (this.sceneEntidad?.enemigos ?? []).forEach((entidad) => {
        const especifico = entidad?.enemigoEspecifico;
        if (especifico?.sprite?.active) {
          candidatos.push({ bando: 'Enemigos', entidad, especifico, sprite: especifico.sprite });
        }
      });
    }

    return candidatos;
  }

  _obtenerControladorJugada() {
    return this.sceneEntidad?.controladorTurnos ??
      this.obtenerEscenaTablero()?.scene?.settings?.data?.controlador?.controladorTurnos ??
      null;
  }

  _iniciarSeleccionObjetivo(nuevaTarea) {
    const casoDeEleccion = nuevaTarea.accion?.casoDeElección ?? nuevaTarea.accion?.casoDeEleccion;
    const bandosObjetivo = this._normalizarBandosObjetivo(casoDeEleccion);
    if (bandosObjetivo.length === 0) {
      this.objetivoSeleccionado = null;
      this._finalizarSeleccionObjetivo(nuevaTarea, null);
      return;
    }

    const candidatos = this._obtenerCandidatosObjetivo(bandosObjetivo);
    if (candidatos.length === 0) {
      console.warn('No hay objetivos validos para la accion', nuevaTarea.accion);
      return;
    }

    this._limpiarSeleccionObjetivo();
    this.tareaPendienteObjetivo = nuevaTarea;
    this.objetivoSeleccionado = null;
    this._destruirOrbes();
    this._destruirFlechasNavegacion();
    this._registrarCancelacionObjetivo();
    this._marcarObjetivos(candidatos);
  }

  _marcarObjetivos(candidatos) {
    const tablero = this.obtenerEscenaTablero();
    if (!tablero) return;

    candidatos.forEach((candidato) => {
      const radio = Math.max(candidato.sprite.displayWidth, candidato.sprite.displayHeight) * 0.55;
      const marca = tablero.add.circle(candidato.sprite.x, candidato.sprite.y, radio, 0xffffff, 0.12);
      marca.setDepth(18);
      marca.setStrokeStyle(6, candidato.bando === 'Aliados' ? 0x8be66f : 0xff6b6b, 0.95);
      this.marcasObjetivo.push(marca);

      const handler = (pointer, localX, localY, event) => {
        event?.stopPropagation?.();
        this._finalizarSeleccionObjetivo(this.tareaPendienteObjetivo, candidato);
      };
      candidato.sprite.setInteractive({ useHandCursor: true });
      candidato.sprite.on('pointerdown', handler);
      this._handlersObjetivo.push({ sprite: candidato.sprite, handler });
    });
  }

  _registrarCancelacionObjetivo() {
    const tablero = this.obtenerEscenaTablero();
    if (!tablero?.input?.keyboard || this._keydownObjetivoHandler) return;

    this._keydownObjetivoHandler = (event) => {
      if (event.code !== 'Escape' && event.code !== 'ArrowLeft' && event.code !== 'KeyA') return;
      event.preventDefault?.();
      this._limpiarSeleccionObjetivo();
      this._mostrarCadena(this._cadenaActual, this._offsetCadena, 0, false);
    };
    tablero.input.keyboard.on('keydown', this._keydownObjetivoHandler);
  }

  _limpiarSeleccionObjetivo(limpiarTarea = true) {
    const tablero = this.obtenerEscenaTablero();

    this._handlersObjetivo.forEach(({ sprite, handler }) => {
      sprite?.off?.('pointerdown', handler);
    });
    this._handlersObjetivo = [];

    this.marcasObjetivo.forEach((marca) => marca?.destroy());
    this.marcasObjetivo = [];

    if (this._keydownObjetivoHandler && tablero?.input?.keyboard) {
      tablero.input.keyboard.off('keydown', this._keydownObjetivoHandler);
    }
    this._keydownObjetivoHandler = null;

    if (limpiarTarea) {
      this.tareaPendienteObjetivo = null;
    }
  }

  _finalizarSeleccionObjetivo(nuevaTarea, candidato) {
    if (!nuevaTarea) return;

    this.objetivoSeleccionado = candidato?.especifico ?? null;
    nuevaTarea.objetivo = this.objetivoSeleccionado;
    nuevaTarea.objetivoEntidad = candidato?.entidad ?? null;
    nuevaTarea.bandoObjetivo = candidato?.bando ?? null;
    this._limpiarSeleccionObjetivo();

    const controladorJugada = this._obtenerControladorJugada();
    if (controladorJugada?.actualizarPilaDetareas) {
      controladorJugada.actualizarPilaDetareas(nuevaTarea);
      return;
    }

    if (this.pilaDetareas?.set) {
      this.pilaDetareas.set(this.entidadAliada ?? this.aliadoEspecifico, nuevaTarea);
      return;
    }

    console.warn('No se pudo registrar la tarea seleccionada', nuevaTarea);
  }

  _puedeNavegarArriba() {
    return this._cadenaActual !== 'principal' && this._offsetCadena > 0;
  }

  _puedeNavegarAbajo() {
    if (this._cadenaActual === 'principal') return false;
    return this._offsetCadena + 3 < this._obtenerElementosCadenaActual().length;
  }

  _navegarOrbes(direccion) {
    if (direccion < 0 && !this._puedeNavegarArriba()) return;
    if (direccion > 0 && !this._puedeNavegarAbajo()) return;

    this._animarNavegacionCadena(direccion);
  }

  _volverCadenaPrincipal() {
    if (this._cadenaActual === 'principal') return;
    this._mostrarCadena('principal', 0, 0);
  }

  _registrarInputsNavegacion() {
    const tablero = this.obtenerEscenaTablero();
    if (!tablero?.input?.keyboard || this._keydownOrbesHandler) return;

    this._keydownOrbesHandler = (event) => {
      if (!this._estaSeleccionado) return;

      if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault?.();
        this._navegarOrbes(-1);
        return;
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault?.();
        this._navegarOrbes(1);
        return;
      }
      if (event.code === 'ArrowLeft' || event.code === 'KeyA' || event.code === 'Escape') {
        event.preventDefault?.();
        this._volverCadenaPrincipal();
      }
    };

    tablero.input.keyboard.on('keydown', this._keydownOrbesHandler);
  }

  _detenerInputsNavegacion() {
    const tablero = this.obtenerEscenaTablero();
    if (this._keydownOrbesHandler && tablero?.input?.keyboard) {
      tablero.input.keyboard.off('keydown', this._keydownOrbesHandler);
    }
    this._keydownOrbesHandler = null;
  }

  _crearFlechaNavegacion(tipo, posicion, activa = true) {
    const tablero = this.obtenerEscenaTablero();
    if (!tablero) return null;

    const puntos = tipo === 'arriba'
      ? [0, 28, 22, 0, 44, 28]
      : [0, 0, 44, 0, 22, 28];
    const flecha = tablero.add.triangle(posicion.x, posicion.y, ...puntos, 0xffffff, activa ? 0.9 : 0.25);
    flecha.tipoNavegacion = tipo;
    flecha.setDepth(22);
    flecha.setOrigin(0.5);
    flecha.setInteractive({ useHandCursor: activa });
    flecha.on('pointerdown', (pointer, localX, localY, event) => {
      event?.stopPropagation?.();
      this._navegarOrbes(tipo === 'arriba' ? -1 : 1);
    });
    return flecha;
  }

  _crearFlechasNavegacion() {
    this._destruirFlechasNavegacion();
    if (this._cadenaActual === 'principal') return;
    if (this._obtenerElementosCadenaActual().length <= 3) return;

    const objetivos = this._calcularObjetivosOrbes();
    if (!objetivos) return;

    const flechas = [];
    if (this._puedeNavegarArriba()) {
      flechas.push(this._crearFlechaNavegacion('arriba', objetivos.flechaArriba));
    }
    if (this._puedeNavegarAbajo()) {
      flechas.push(this._crearFlechaNavegacion('abajo', objetivos.flechaAbajo));
    }
    this.flechasNavegacion = flechas.filter(Boolean);
  }

  _actualizarPosicionFlechas(objetivos) {
    this.flechasNavegacion.forEach((flecha) => {
      const posicion = flecha.tipoNavegacion === 'arriba'
        ? objetivos.flechaArriba
        : objetivos.flechaAbajo;
      flecha.setPosition(posicion.x, posicion.y);
    });
  }

  _destruirFlechasNavegacion() {
    this.flechasNavegacion.forEach((flecha) => flecha?.destroy());
    this.flechasNavegacion = [];
  }

  onSeleccionar(aliadoEspecifico, pilaDetareas, entidadAliada = null) {
    if (this._estaSeleccionado && this.aliadoEspecifico === aliadoEspecifico) {
      this.onDeseleccionar();
      return false;
    }

    this.pilaDetareas = pilaDetareas;
    this.aliadoEspecifico = aliadoEspecifico;
    if (!this.aliadoEspecifico) return false;
    this.aliadoEspecifico.propiedadesEspeciales(this.aliadoEspecifico);
    this.entidadAliada = this._resolverEntidadAliada(entidadAliada);
    this.acciones = this.entidadAliada?.acciones ?? [[], [], []];

    this._estaSeleccionado = true;
    this._registrarInputsNavegacion();
    this._mostrarCadena('principal', 0, 0, false);
    return true;
  }

  onDeseleccionar() {
    if (!this._estaSeleccionado) return;
    this._estaSeleccionado = false;
    this._detenerInputsNavegacion();
    this._limpiarSeleccionObjetivo();
    this._animarSalidaOrbes();
    this._cadenaActual = 'principal';
    this._offsetCadena = 0;
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

const ICONO_DEFECTO = 'assets/images/system/candle.png';

function aItems(lista, etiquetaCantidad = '') {
  return (lista ?? []).map((item) => ({
    imagen: ICONO_DEFECTO,
    nombre: String(item?.nombre ?? item ?? ''),
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

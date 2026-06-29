import { obtenerConfiguracionIA, obtenerConfiguracionManual, normalizarConfiguracionIA } from '../../scenes/battles/ui/Entidades/Enemigos.js';

export default class controladorJugada {
  constructor(ArrayExportado, equipos, otros) {
    this.ArrayExportado = ArrayExportado;
    this.equipos = equipos;
    this.otros = otros;
    this.pilaDetareas = this._crearMapaAcciones();
    this.objetivoSeleccionado = null;
    this.iaConfigurada = false;
    this.proyectilesPendientes = null;
    this.entidadesEliminadas = new Set();
    this.doparPendiente = false;
    this.ultiUsada = false;
    this._batallaTerminada = false;
    this.escenaEntidad = null;
    this.escenaTablero = null;
  }

  get acciones() {
    return this.pilaDetareas;
  }

  _crearMapaAcciones() {
    return new Map();
  }

  _resolverStatsAliado(tarea) {
    return tarea?.aliado?.estadisticas ?? null;
  }

  _perteneceAliado(tarea, referencia) {
    if (!tarea || !referencia) return false;
    if (tarea.aliado && referencia.aliado && tarea.aliado === referencia.aliado) return true;
    if (tarea.entidad && referencia.entidad && tarea.entidad === referencia.entidad) return true;
    return false;
  }

  /** Busca en la pila la tarea ya registrada de un aliado. */
  _buscarTareaDeAliado(referencia) {
    for (const [velocidad, tareas] of this.pilaDetareas) {
      const indice = tareas.findIndex((t) => this._perteneceAliado(t, referencia));
      if (indice >= 0) return { velocidad, indice, tarea: tareas[indice] };
    }
    return null;
  }

  _quitarDePila(velocidad, indice) {
    const tareas = this.pilaDetareas.get(velocidad);
    if (!tareas) return;
    tareas.splice(indice, 1);
    if (tareas.length === 0) this.pilaDetareas.delete(velocidad);
  }

  _resolverVelocidadTarea(tarea) {
    const velocidad = Number(
      tarea?.accion?.velocidad ??
      tarea?.enemigo?.estadisticas?.velocidad ??
      tarea?.aliado?.estadisticas?.velocidad ??
      0,
    );
    return Number.isFinite(velocidad) ? velocidad : 0;
  }

  _reordenarPorVelocidad() {
    const nuevoMapa = new Map();
    Array.from(this.pilaDetareas.entries())
      .sort(([velocidadA], [velocidadB]) => velocidadA - velocidadB)
      .forEach(([velocidad, tareas]) => nuevoMapa.set(velocidad, tareas));
    this.pilaDetareas = nuevoMapa;
  }

  _insertarEnPila(nuevaTarea) {
    const velocidad = this._resolverVelocidadTarea(nuevaTarea);
    if (this.pilaDetareas.has(velocidad)) {
      this.pilaDetareas.get(velocidad).push(nuevaTarea);
      return;
    }
    this.pilaDetareas.set(velocidad, [nuevaTarea]);
    this._reordenarPorVelocidad();
  }

  _obtenerTareasAliadas() {
    return Array.from(this.pilaDetareas.values())
      .flat()
      .filter((tarea) => tarea?.aliado?.estadisticas?.accionismo != null);
  }

  _contarAliadosVivos() {
    const escenaEntidad = this._obtenerEscenaEntidad();
    if (escenaEntidad?.aliados) return escenaEntidad.aliados.length;
    return this.equipos?.Aliados?.length ?? 0;
  }

  _todosLosAliadosSinAccionismo() {
    const tareasAliadas = this._obtenerTareasAliadas();
    const aliadosRegistrados = new Set(
      tareasAliadas.map((tarea) => tarea.entidad ?? tarea.aliado),
    );

    const aliadosVivos = this._contarAliadosVivos();
    return aliadosVivos > 0 &&
      aliadosRegistrados.size === aliadosVivos &&
      tareasAliadas.every((tarea) => Number(tarea.aliado.estadisticas.accionismo) <= 0);
  }

  _configurarIACuandoAliadosListos() {
    if (this.iaConfigurada || !this._todosLosAliadosSinAccionismo()) return;
    this.iaConfigurada = true;
    this._ConfigurarIA();
  }

  /**
   * Registra una acción desde las orbes.
   * - accionismo > 0: agrega a la pila y resta 1.
   * - accionismo === 0: reemplaza la acción previa de ese aliado en la pila.
   */
  actualizarPilaDetareas(nuevaTarea, Entidades) {
    if (!nuevaTarea?.accion) return false;

    if (!this.escenaEntidad) {
      this.escenaEntidad = nuevaTarea.entidad?.moldePhaser?.sceneEntidad ?? null;
    }
    this.objetivoSeleccionado = nuevaTarea.objetivo ?? null;
    const stats = this._resolverStatsAliado(nuevaTarea);

    if (!stats || stats.accionismo == null) {
      this._insertarEnPila(nuevaTarea);
      return true;
    }

    const accionismo = Number(stats.accionismo);

    if (accionismo > 0) {
      this._insertarEnPila(nuevaTarea);
      stats.accionismo = accionismo - 1;
      this._configurarIACuandoAliadosListos();
      return true;
    }

    const existente = this._buscarTareaDeAliado(nuevaTarea);
    if (!existente) {
      console.warn('controladorJugada: accionismo agotado y sin acción previa que reemplazar');
      return false;
    }

    this._quitarDePila(existente.velocidad, existente.indice);
    this._insertarEnPila(nuevaTarea);
    this._configurarIACuandoAliadosListos();
    return true;
  }

  /** true cuando todos los aliados gastaron su accionismo (quedaron en 0). */
  confirmarJugada(aliados) {
    return (aliados ?? []).every(
      (aliado) => Number(aliado?.aliadoEspecifico?.estadisticas?.accionismo ?? 0) <= 0,
    );
  }

  _obtenerOrdenEjecucion() {
    const orden = [];
    Array.from(this.pilaDetareas).toReversed().forEach(([, tareas]) => {
      tareas.forEach((tarea) => orden.push(tarea));
    });
    return orden;
  }

  _limpiarSeleccionActiva() {
    const tableroScene = this.escenaTablero;
    const seleccionada = tableroScene?.entidadSeleccionada;
    if (!seleccionada) return;
    seleccionada.moldePhaser?.onDeseleccionar?.();
    tableroScene.entidadSeleccionada = null;
  }

  async generarGuion() {
    this._capturarEscenas();
    this._limpiarSeleccionActiva();
    this._batallaTerminada = false;
    this.entidadesEliminadas = this.entidadesEliminadas ?? new Set();

    const orden = this._obtenerOrdenEjecucion();
    // Si hay habilidades tipo 1, TODOS los proyectiles enemigos se reservan desde
    // el inicio para que cualquier escudo/retirada pueda cancelarlos sin importar
    // el orden de velocidad. Si no hay tipo 1, se ejecutan al instante.
    this.proyectilesPendientes = this._hayHabilidadTipo1()
      ? orden.filter((tarea) => this._esProyectil(tarea))
      : null;

    for (const tarea of orden) {
      if (this._batallaTerminada) return;
      if (this._entidadEliminada(tarea.entidad)) continue;
      await this._ejecutarTarea(tarea);
    }

    if (this.proyectilesPendientes && this.proyectilesPendientes.length > 0) {
      for (const proyectil of [...this.proyectilesPendientes]) {
        if (this._batallaTerminada) return;
        await this._ejecutarProyectil(proyectil);
      }
    }
    this.proyectilesPendientes = null;

    if (this._batallaTerminada) return;
    if (this._verificarFinBatalla()) return;
    this._reiniciarTurno();
  }

  _capturarEscenas() {
    if (this.escenaEntidad && this.escenaTablero) return;
    for (const [, tareas] of this.pilaDetareas) {
      for (const tarea of tareas) {
        const molde = tarea?.entidad?.moldePhaser;
        if (!molde) continue;
        this.escenaEntidad = this.escenaEntidad ?? molde.sceneEntidad ?? null;
        this.escenaTablero = this.escenaTablero ?? molde.obtenerEscenaTablero?.() ?? null;
        if (this.escenaEntidad && this.escenaTablero) return;
      }
    }
  }

  _obtenerEscenaEntidad() {
    if (this.escenaEntidad) return this.escenaEntidad;
    this._capturarEscenas();
    return this.escenaEntidad;
  }

  _esTareaEnemiga(tarea) {
    return Boolean(tarea?.entidad?.enemigoEspecifico);
  }

  _esProyectil(tarea) {
    return this._esTareaEnemiga(tarea) && tarea?.bandoObjetivo === 'Aliados' && Boolean(tarea?.objetivoEntidad);
  }

  _hayHabilidadTipo1() {
    for (const [, tareas] of this.pilaDetareas) {
      for (const tarea of tareas) {
        const caso = tarea?.accion?.casoDeElección ?? tarea?.accion?.casoDeEleccion;
        if (caso === 1) return true;
      }
    }
    return false;
  }

  async _ejecutarProyectil(proyectil) {
    if (!proyectil || proyectil.bloqueado) return;
    const objetivoWrapper = proyectil.objetivoEntidad;
    if (objetivoWrapper && this._entidadEliminada(objetivoWrapper)) return;
    await this._ejecutarFuncionTarea(proyectil);
    if (objetivoWrapper) this._aplicarDanoYActualizar(objetivoWrapper);
  }

  _obtenerEscenaTablero(tarea = null) {
    return tarea?.entidad?.moldePhaser?.obtenerEscenaTablero?.() ??
      tarea?.objetivoEntidad?.moldePhaser?.obtenerEscenaTablero?.() ??
      null;
  }

  _crearContextoEjecucion(tarea) {
    return {
      tarea,
      arrayBidimencional: this.ArrayExportado,
      controladorJugada: this,
      escenaTablero: this._obtenerEscenaTablero(tarea),
    };
  }

  _resolverParametroAccion(tarea) {
    if (tarea?.casillaObjetivo) return tarea.casillaObjetivo;
    return tarea?.objetivo ?? null;
  }

  async _ejecutarFuncionTarea(tarea) {
    const resultado = tarea?.accion?.ejecución?.(
      this._resolverParametroAccion(tarea),
      this._crearContextoEjecucion(tarea),
    );
    if (resultado?.then) await resultado;
  }

  _obtenerSpriteEntidad(entidad) {
    return entidad?.aliadoEspecifico?.sprite ??
      entidad?.enemigoEspecifico?.sprite ??
      null;
  }

  _pausarAnimacionesEntidades(tableroScene) {
    const pausadas = [];
    const entidadScene = tableroScene?.scene?.get?.('entidad');
    const entidades = [
      ...(entidadScene?.aliados ?? []),
      ...(entidadScene?.enemigos ?? []),
    ];

    entidades.forEach((entidad) => {
      const sprite = this._obtenerSpriteEntidad(entidad);
      if (sprite?.anims?.isPlaying) {
        sprite.anims.pause();
        pausadas.push(sprite);
      }
    });

    return () => pausadas.forEach((sprite) => sprite?.anims?.resume?.());
  }

  _crearTooltipTipo1(tableroScene) {
    const tooltip = tableroScene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 14, y: 10 },
      align: 'left',
    });
    // Fijado a la camara (scrollFactor 0) para que el tamaño no dependa del zoom.
    tooltip.setScrollFactor(0);
    tooltip.setDepth(1002);
    tooltip.setVisible(false);
    return tooltip;
  }

  _posicionEntidad(wrapper) {
    const especifico = wrapper?.aliadoEspecifico ?? wrapper?.enemigoEspecifico;
    const posicion = especifico?.datos?.posicion ?? wrapper?.data?.posicion;
    if (!posicion) return null;
    return { x: Number(posicion.x), y: Number(posicion.y) };
  }

  _dentroDeRango(origen, destino, rango) {
    if (rango == null) return true;
    if (!origen || !destino) return false;
    return Math.abs(origen.x - destino.x) <= rango && Math.abs(origen.y - destino.y) <= rango;
  }

  /** Agrupa los proyectiles pausados por aliado objetivo: { objetivoEntidad, acciones: Map<nombre, veces> }. */
  _resumirProyectilesPendientes() {
    const resumen = new Map();
    (this.proyectilesPendientes ?? []).forEach((proyectil) => {
      if (proyectil.bloqueado) return;
      const wrapper = proyectil.objetivoEntidad;
      if (!wrapper || this._entidadEliminada(wrapper)) return;
      const id = wrapper.data?.id ?? wrapper;
      if (!resumen.has(id)) {
        resumen.set(id, { objetivoEntidad: wrapper, acciones: new Map() });
      }
      const entrada = resumen.get(id);
      const nombre = proyectil.accion?.nombre ?? 'Proyectil';
      entrada.acciones.set(nombre, (entrada.acciones.get(nombre) ?? 0) + 1);
    });
    return Array.from(resumen.values());
  }

  _asegurarTexturaParticula(tableroScene) {
    const clave = 'particulaProyectilTipo1';
    if (tableroScene.textures.exists(clave)) return clave;
    const grafico = tableroScene.add.graphics();
    grafico.fillStyle(0xffffff, 1);
    grafico.fillCircle(10, 10, 10);
    grafico.generateTexture(clave, 20, 20);
    grafico.destroy();
    return clave;
  }

  _crearParpadeoSprite(tableroScene, sprite, color) {
    if (!sprite?.active) return null;

    const tintePrevio = sprite.tintTopLeft;
    const alphaPrevio = sprite.alpha;
    sprite.setTint(color);

    const tween = tableroScene.tweens.add({
      targets: sprite,
      alpha: 0.45,
      duration: 420,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    return () => {
      tableroScene.tweens?.killTweensOf(sprite);
      sprite.setAlpha(alphaPrevio ?? 1);
      if (tintePrevio != null && tintePrevio !== 0xffffff) {
        sprite.setTint(tintePrevio);
      } else {
        sprite.clearTint();
      }
      tween?.remove?.();
    };
  }

  /** Aliados vivos, dentro de rango del lanzador, candidatos a ser seleccionados. */
  _obtenerCandidatosTipo1(tarea) {
    const escenaEntidad = this._obtenerEscenaEntidad();
    const origen = this._posicionEntidad(tarea?.entidad);
    const rango = tarea?.accion?.rango;
    const candidatos = [];

    (escenaEntidad?.aliados ?? []).forEach((wrapper) => {
      if (this._entidadEliminada(wrapper)) return;
      const sprite = this._obtenerSpriteEntidad(wrapper);
      if (!sprite?.active) return;
      const destino = this._posicionEntidad(wrapper);
      if (!this._dentroDeRango(origen, destino, rango)) return;
      candidatos.push({ wrapper, sprite, objetivo: wrapper.aliadoEspecifico });
    });

    return candidatos;
  }

  async _resolverHabilidadTipo1(tarea) {
    const efecto = tarea?.accion?.efectoTipo1 ?? null;
    const pendientes = this.proyectilesPendientes ?? [];

    if (efecto === 'escudo' && pendientes.length === 0) return;

    const seleccion = await this._mostrarSeleccionTipo1(tarea);
    if (!seleccion) return;

    if (efecto === 'escudo') {
      this._aplicarEscudo(tarea, seleccion.wrapper);
    } else if (efecto === 'retirada') {
      this._aplicarRetirada(seleccion.wrapper);
    }
  }

  _aplicarEscudo(tarea, aliadoWrapper) {
    const lista = this.proyectilesPendientes ?? [];
    const indice = lista.findIndex(
      (proyectil) => !proyectil.bloqueado && proyectil.objetivoEntidad === aliadoWrapper,
    );
    if (indice < 0) return;
    lista[indice].bloqueado = true;
    lista.splice(indice, 1);
    tarea?.accion?.ejecución?.(tarea.entidad?.aliadoEspecifico, this._crearContextoEjecucion(tarea));
  }

  _aplicarRetirada(aliadoWrapper) {
    if (this.proyectilesPendientes) {
      this.proyectilesPendientes = this.proyectilesPendientes.filter(
        (proyectil) => proyectil.objetivoEntidad !== aliadoWrapper,
      );
    }
    this._eliminarEntidad(aliadoWrapper);
    this._verificarFinBatalla();
  }

  async _mostrarSeleccionTipo1(tarea) {
    const tableroScene = this._obtenerEscenaTablero(tarea) ?? this.escenaTablero;
    const camara = tableroScene?.cameras?.main;
    if (!tableroScene || !camara) return null;

    const candidatos = this._obtenerCandidatosTipo1(tarea);
    if (candidatos.length === 0) return null;

    const restaurarAnimaciones = this._pausarAnimacionesEntidades(tableroScene);
    const claveParticula = this._asegurarTexturaParticula(tableroScene);

    const vista = camara.worldView;
    const filtro = tableroScene.add.rectangle(
      vista.x + vista.width / 2,
      vista.y + vista.height / 2,
      vista.width,
      vista.height,
      0x222222,
      0.5,
    );
    filtro.setDepth(999);
    const actualizarFiltro = () => {
      const vistaActual = camara.worldView;
      filtro.setPosition(vistaActual.x + vistaActual.width / 2, vistaActual.y + vistaActual.height / 2);
      filtro.setSize(vistaActual.width, vistaActual.height);
    };
    tableroScene.events?.on?.('update', actualizarFiltro);

    const tooltip = this._crearTooltipTipo1(tableroScene);
    const resumen = this._resumirProyectilesPendientes();
    const resumenPorId = new Map();
    resumen.forEach((entrada) => {
      const id = entrada.objetivoEntidad?.data?.id;
      if (id != null) resumenPorId.set(String(id), entrada);
    });

    const emisores = [];
    resumen.forEach((entrada) => {
      const sprite = this._obtenerSpriteEntidad(entrada.objetivoEntidad);
      if (!sprite?.active) return;
      const emisor = tableroScene.add.particles(sprite.x, sprite.y, claveParticula, {
        speed: { min: 60, max: 160 },
        angle: { min: 0, max: 360 },
        lifespan: 650,
        frequency: 70,
        quantity: 2,
        scale: { start: 1, end: 0 },
        tint: 0xff3333,
        blendMode: 'ADD',
      });
      emisor.setDepth(1001);
      emisores.push(emisor);
    });

    const restauradoresBrillo = [];
    const handlers = [];

    const seleccionado = await new Promise((resolve) => {
      candidatos.forEach((candidato) => {
        const id = candidato.wrapper?.data?.id;
        const restaurar = this._crearParpadeoSprite(tableroScene, candidato.sprite, 0x66ccff);
        if (restaurar) restauradoresBrillo.push(restaurar);

        const downHandler = (pointer, localX, localY, event) => {
          event?.stopPropagation?.();
          resolve(candidato);
        };
        const overHandler = (pointer) => {
          const entrada = id == null ? null : resumenPorId.get(String(id));
          if (!entrada) return;
          const texto = Array.from(entrada.acciones.entries())
            .map(([nombre, veces]) => `${nombre}: ${veces}`)
            .join('\n');
          tooltip.setText(texto);
          tooltip.setPosition(pointer.x + 20, pointer.y + 20);
          tooltip.setVisible(true);
        };
        const moveHandler = (pointer) => {
          if (tooltip.visible) tooltip.setPosition(pointer.x + 20, pointer.y + 20);
        };
        const outHandler = () => tooltip.setVisible(false);

        candidato.sprite.setInteractive({ useHandCursor: true });
        candidato.sprite.on('pointerdown', downHandler);
        candidato.sprite.on('pointerover', overHandler);
        candidato.sprite.on('pointermove', moveHandler);
        candidato.sprite.on('pointerout', outHandler);
        handlers.push({ sprite: candidato.sprite, downHandler, overHandler, moveHandler, outHandler });
      });
    });

    handlers.forEach(({ sprite, downHandler, overHandler, moveHandler, outHandler }) => {
      sprite.off('pointerdown', downHandler);
      sprite.off('pointerover', overHandler);
      sprite.off('pointermove', moveHandler);
      sprite.off('pointerout', outHandler);
    });
    restauradoresBrillo.forEach((restaurar) => restaurar());
    emisores.forEach((emisor) => emisor?.destroy?.());
    tableroScene.events?.off?.('update', actualizarFiltro);
    tableroScene.tweens?.killTweensOf(filtro);
    filtro.destroy();
    tooltip.destroy();
    restaurarAnimaciones();

    return seleccionado;
  }

  async _ejecutarTarea(tarea) {
    if (this._esProyectil(tarea)) {
      // Con tipo 1 activo el proyectil ya esta reservado en proyectilesPendientes
      // (se ejecuta en el flush final); sin tipo 1 se ejecuta de inmediato.
      if (this.proyectilesPendientes) return;
      await this._ejecutarProyectil(tarea);
      return;
    }

    // El objetivo murio o se retiro antes de ejecutarse: se descarta la accion.
    if (tarea.objetivoEntidad && this._entidadEliminada(tarea.objetivoEntidad)) return;

    const casoDeEleccion = tarea.accion.casoDeElección ?? tarea.accion.casoDeEleccion;
    const caso = typeof casoDeEleccion === 'string' ? casoDeEleccion.toLowerCase() : casoDeEleccion;

    if (caso === 1) {
      await this._resolverHabilidadTipo1(tarea);
      return;
    }

    await this._ejecutarFuncionTarea(tarea);
    if (tarea.objetivoEntidad) this._aplicarDanoYActualizar(tarea.objetivoEntidad);
  }

  _aplicarDanoYActualizar(objetivoWrapper) {
    const escenaEntidad = this._obtenerEscenaEntidad();
    if (escenaEntidad?.panelEntidadActivo && this.escenaTablero?._abrirPanelDetalle) {
      this.escenaTablero._abrirPanelDetalle(objetivoWrapper);
    }
    this._verificarMuertes();
  }

  _entidadEliminada(wrapper) {
    if (!wrapper) return false;
    if (this.entidadesEliminadas?.has(wrapper)) return true;
    return !(wrapper.aliadoEspecifico ?? wrapper.enemigoEspecifico);
  }

  _verificarMuertes() {
    const escenaEntidad = this._obtenerEscenaEntidad();
    if (!escenaEntidad) return;
    const todos = [...(escenaEntidad.aliados ?? []), ...(escenaEntidad.enemigos ?? [])];
    todos.forEach((wrapper) => {
      const especifico = wrapper.aliadoEspecifico ?? wrapper.enemigoEspecifico;
      if (especifico && Number(especifico.estadisticas?.hp) <= 0) {
        this._eliminarEntidad(wrapper);
      }
    });
    this._verificarFinBatalla();
  }

  _eliminarTareasDeEntidad(wrapper) {
    for (const [velocidad, tareas] of [...this.pilaDetareas]) {
      const filtradas = tareas.filter((tarea) => tarea.entidad !== wrapper);
      if (filtradas.length === 0) this.pilaDetareas.delete(velocidad);
      else this.pilaDetareas.set(velocidad, filtradas);
    }
  }

  _eliminarEntidad(wrapper) {
    if (!wrapper || this.entidadesEliminadas.has(wrapper)) return;
    this.entidadesEliminadas.add(wrapper);

    const especifico = wrapper.aliadoEspecifico ?? wrapper.enemigoEspecifico;
    const posicion = this._posicionEntidad(wrapper);
    if (posicion) {
      const casilla = this.ArrayExportado?.[posicion.y - 1]?.[posicion.x - 1];
      if (casilla && casilla.entidad === wrapper) casilla.entidad = false;
    }

    // Limpia orbes/flechas/marcadores de seleccion de esta entidad para que no
    // queden elementos interactivos huerfanos tras destruir su sprite.
    wrapper.moldePhaser?.onDeseleccionar?.();

    especifico?.cancelarUbicacionAnimacion?.();
    especifico?.sprite?.destroy?.();
    if (especifico) especifico.sprite = null;

    const escenaEntidad = this._obtenerEscenaEntidad();
    if (escenaEntidad) {
      escenaEntidad.aliados = (escenaEntidad.aliados ?? []).filter((w) => w !== wrapper);
      escenaEntidad.enemigos = (escenaEntidad.enemigos ?? []).filter((w) => w !== wrapper);
    }

    this._eliminarTareasDeEntidad(wrapper);
    if (this.proyectilesPendientes) {
      this.proyectilesPendientes = this.proyectilesPendientes.filter(
        (proyectil) => proyectil.objetivoEntidad !== wrapper && proyectil.entidad !== wrapper,
      );
    }

    const tableroScene = this.escenaTablero;
    if (tableroScene?.entidadSeleccionada === wrapper) {
      tableroScene.entidadSeleccionada = null;
    }
    if (escenaEntidad?.panelEntidadActivo) {
      escenaEntidad.panelEntidadActivo.cerrar?.();
    }
  }

  _verificarFinBatalla() {
    if (this._batallaTerminada) return true;
    const escenaEntidad = this._obtenerEscenaEntidad();
    if (!escenaEntidad) return false;

    const aliadosVivos = (escenaEntidad.aliados ?? []).length;
    const enemigosVivos = (escenaEntidad.enemigos ?? []).length;

    let resultado = null;
    if (aliadosVivos === 0 && enemigosVivos === 0) resultado = 'empate';
    else if (enemigosVivos === 0) resultado = 'victoria';
    else if (aliadosVivos === 0) resultado = 'derrota';
    if (!resultado) return false;

    this._batallaTerminada = true;
    this._mostrarFinBatalla(resultado);
    return true;
  }

  _mostrarFinBatalla(resultado) {
    const scene = this.escenaTablero;
    if (!scene) return;
    const camara = scene.cameras?.main;
    const ancho = camara?.width ?? 800;
    const alto = camara?.height ?? 600;

    const overlay = scene.add.rectangle(ancho / 2, alto / 2, ancho, alto, 0x000000, 0.75);
    overlay.setScrollFactor(0);
    overlay.setDepth(2000);

    const titulos = { victoria: 'VICTORIA', derrota: 'DERROTA', empate: 'EMPATE' };
    const label = scene.add.text(ancho / 2, alto / 2, titulos[resultado] ?? 'FIN', {
      fontFamily: 'monospace',
      fontSize: '96px',
      color: '#ffffff',
    });
    label.setOrigin(0.5);
    label.setScrollFactor(0);
    label.setDepth(2001);

    overlay.setInteractive();
    overlay.once('pointerdown', () => {
      const destino = this.otros?.destino?.[resultado];
      const escenaEntidad = this._obtenerEscenaEntidad();
      escenaEntidad?.scene?.stop?.('entidad');
      scene.scene.stop('vista');
      if (destino?.key) {
        scene.scene.start(destino.key, { x: destino.x, y: destino.y });
      } else {
        scene.scene.stop('tablero');
      }
    });
  }

  activarDopar() {
    if (this.ultiUsada) return;
    this.ultiUsada = true;
    this.doparPendiente = true;
  }

  _reiniciarTurno() {
    const escenaEntidad = this._obtenerEscenaEntidad();
    this.pilaDetareas = new Map();
    this.iaConfigurada = false;
    this.objetivoSeleccionado = null;
    this.proyectilesPendientes = null;

    (escenaEntidad?.aliados ?? []).forEach((wrapper) => {
      const especifico = wrapper.aliadoEspecifico;
      if (!especifico?.estadisticas) return;
      const base = Number(wrapper.accionismoBase ?? 1);
      especifico.estadisticas.accionismo = base + (this.doparPendiente ? 1 : 0);
    });
    this.doparPendiente = false;

    if (this.escenaTablero?.input) this.escenaTablero.input.enabled = true;
    if (escenaEntidad?.input) escenaEntidad.input.enabled = true;
  }

  async _ConfigurarIA() {
    const configuraciónManual = obtenerConfiguracionManual();
    const configuracion = configuraciónManual || await obtenerConfiguracionIA();
    const tareasNormalizadas = normalizarConfiguracionIA(configuracion, this.ArrayExportado);
    tareasNormalizadas.forEach((tarea) => {
      this._insertarEnPila(tarea, this.ArrayExportado);
    });
    await this.generarGuion();
  }
}

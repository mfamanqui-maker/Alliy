import { crearRegistroAliados } from '../../classes/battle/familias/aliadoEspecifico.js';
import { crearRegistroEnemigos } from '../../classes/battle/familias/enemigoEspecifico.js';
import { precargarSpritesheet } from '../../classes/battle/familias/bases/phaserMoldFactory.js';
import { precargarTodosLosTextos, registrarTodosLosFramesTexto } from './ui/GenerarTexto/index.js';
import { precargarDescripcionesPanelEntidad } from './ui/PanelEntidad/index.js';
import Aliados from './ui/Entidades/Aliados.js';
import Enemigos from './ui/Entidades/Enemigos.js';

export default class entidadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'entidad' });
    this.equipos = null;
    this.arrayBidimencional = null;
  }

  init(data) {
    this.equipos = data?.equipos ?? null;
    this.arrayBidimencional = data?.arrayBidimencional ?? null;
    this.controladorTurnos = data?.controladorTurnos ?? null;
  }

  preload() {
    precargarSpritesheet(this, 'lumelStatic', 'assets/images/battle/personajes/lumelStatic.png', 64, 64);
    precargarSpritesheet(this, 'brunnStatic', 'assets/images/battle/personajes/brunnStatic.png', 64, 64);
    precargarSpritesheet(this, 'soldado1Static', 'assets/images/battle/personajes/c1Static.png', 64, 64);
    precargarTodosLosTextos(this);
    precargarDescripcionesPanelEntidad(this);
  }

  create() {
    registrarTodosLosFramesTexto(this);

    const data = this.scene.settings.data;
    if (this.equipos == null && data?.equipos != null) {
      this.equipos = data.equipos;
    }
    if (!this.equipos?.Aliados || !this.equipos?.Enemigos) {
      return;
    }
    if (this.arrayBidimencional == null && data?.arrayBidimencional != null) {
      this.arrayBidimencional = data.arrayBidimencional;
    }

    const registroAliados = crearRegistroAliados(this.equipos.Aliados);
    const registroEnemigos = crearRegistroEnemigos(this.equipos.Enemigos);

    this.aliados = [];
    this.enemigos = [];

    this.equipos.Aliados.forEach((entidad) => {
      const nuevoAliado = {
        data: entidad,
        moldePhaser: new Aliados(entidad, this),
        aliadoEspecifico: registroAliados.obtenerPorId(entidad.id),
        acciones: null,
      }
      nuevoAliado.aliadoEspecifico.propiedadesEspeciales(nuevoAliado.aliadoEspecifico);
      const {habilidades, objetos, movimiento} = nuevoAliado.aliadoEspecifico.listaDeAcciones;
      const acciones = [[], [], []];
      
      habilidades.forEach((habilidad) => {
        const elementoAccion = {
          nombre: habilidad.nombre,
          ejecución: habilidad.ejecución,
          condicional: habilidad.condicional,
          casoDeElección: habilidad.casoDeElección,
          velocidad: habilidad.velocidad,
          orbePhaser: null,
        }
        acciones[0].push(elementoAccion);
      });
      objetos.forEach((objeto) => {
        const elementoAccion = {
          nombre: objeto.nombre,
          ejecución: objeto.ejecución,
          condicional: objeto.condicional,
          casoDeElección: objeto.casoDeElección,
          velocidad: objeto.velocidad,
          orbePhaser: null,
        }
        acciones[1].push(elementoAccion);
      });
      movimiento.forEach((movimiento) => {
        const elementoAccion = {
          nombre: movimiento.nombre,
          ejecución: movimiento.ejecución,
          condicional: movimiento.condicional,
          casoDeElección: movimiento.casoDeElección,
          velocidad: movimiento.velocidad,
          orbePhaser: null,
        }
        acciones[2].push(elementoAccion);
      });
      
      nuevoAliado.acciones = acciones;
      nuevoAliado.moldePhaser.iniciarAliado(nuevoAliado.aliadoEspecifico);
      this.aliados.push(nuevoAliado);
    });

    this.equipos.Enemigos.forEach((entidad) => {
      const nuevoEnemigo = {
        data: entidad,
        moldePhaser: new Enemigos(entidad, this),
        enemigoEspecifico: registroEnemigos.obtenerPorId(entidad.id),
        acciones: null,
      }
      nuevoEnemigo.enemigoEspecifico.propiedadesEspeciales(nuevoEnemigo.enemigoEspecifico);
      const {habilidades, objetos, movimiento} = nuevoEnemigo.enemigoEspecifico.listaDeAcciones;
      const acciones = [[], [], []];
      
      habilidades.forEach((habilidad) => {
        const elementoAccion = {
          nombre: habilidad.nombre,
          ejecución: habilidad.ejecución,
          condicional: habilidad.condicional,
          casoDeElección: habilidad.casoDeElección,
          velocidad: habilidad.velocidad,
        }
        acciones[0].push(elementoAccion);
      });
      
      objetos.forEach((objeto) => {
        const elementoAccion = {
          nombre: objeto.nombre,
          ejecución: objeto.ejecución,
          condicional: objeto.condicional,
          casoDeElección: objeto.casoDeElección,
          velocidad: objeto.velocidad,
        }
        acciones[1].push(elementoAccion);
      });
      movimiento.forEach((movimiento) => {
        const elementoAccion = {
          nombre: movimiento.nombre,
          ejecución: movimiento.ejecución,
          condicional: movimiento.condicional,
          casoDeElección: movimiento.casoDeElección,
          velocidad: movimiento.velocidad,
        }
        acciones[2].push(elementoAccion);
      });
      nuevoEnemigo.acciones = acciones;
      nuevoEnemigo.moldePhaser.iniciarEnemigo(nuevoEnemigo.enemigoEspecifico);
      this.enemigos.push(nuevoEnemigo);
    });

    this.aliados.forEach((aliado) => {
      this.arrayBidimencional[aliado.data.posicion.y - 1][aliado.data.posicion.x - 1].entidad = aliado;
    });
    this.enemigos.forEach((enemigo) => {
      this.arrayBidimencional[enemigo.data.posicion.y - 1][enemigo.data.posicion.x - 1].entidad = enemigo;
    });
  }
}

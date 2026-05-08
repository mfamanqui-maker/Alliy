import { crearRegistroAliados } from '../../classes/battle/familias/aliadoEspecifico.js';
import { crearRegistroEnemigos } from '../../classes/battle/familias/enemigoEspecifico.js';
import { precargarSpritesheet } from '../../classes/battle/familias/bases/phaserMoldFactory.js';
import Aliados from './ui/Aliados.js';

export default class entidadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'entidad' });
    this.equipos = null;
    this.arrayBidimencional = null;
  }

  init(data) {
    this.equipos = data?.equipos ?? null;
    this.arrayBidimencional = data?.arrayBidimencional ?? null;
  }

  preload() {
    precargarSpritesheet(this, 'lumelStatic', 'assets/images/LumelStatic.png', 64, 64);
  }

  create() {
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

    const registroAliados = crearRegistroAliados(this.equipos);
    const registroEnemigos = crearRegistroEnemigos(this.equipos);

    this.aliados = [];
    this.enemigos = [];

    this.equipos.Aliados.forEach((entidad) => {
      const nuevoAliado = {
        data: entidad,
        moldePhaser: new Aliados(entidad, this),
        aliadoEspecifico: registroAliados.obtenerPorId(entidad.id),
      }
      nuevoAliado.moldePhaser.iniciarAliado(nuevoAliado.aliadoEspecifico);
      this.aliados.push(nuevoAliado);
    });


    this.equipos.Enemigos.forEach((entidad) => {
      const nuevoEnemigo = {
        data: entidad,
        moldePhaser: '',
        enemigoEspecifico: registroEnemigos.obtenerPorId(entidad.id),
      }
      this.enemigos.push(nuevoEnemigo);
    });
  }
}

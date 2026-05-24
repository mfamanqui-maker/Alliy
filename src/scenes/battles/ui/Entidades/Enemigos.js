import { construirDatosDetalle } from './Aliados.js';

export default class Enemigos {
  constructor(data, sceneEntidad) {
    this.data = data;
    this.sceneEntidad = sceneEntidad;
    this.pilaDetareas = null;
    this.enemigoEspecifico = null;
  }

  obtenerEscenaTablero() {
    return this.sceneEntidad?.scene?.get?.('tablero');
  }

  iniciarEnemigo(enemigoEspecifico) {
    this.enemigoEspecifico = enemigoEspecifico ?? null;
    const tablero = this.obtenerEscenaTablero();
    const tileSize = tablero?.tileSize ?? 400;

    if (typeof enemigoEspecifico.construirAnimacionEstatica === 'function') {
      enemigoEspecifico.construirAnimacionEstatica(this.sceneEntidad);
    }

    if (!tablero) {
      return Promise.resolve();
    }

    return enemigoEspecifico.ubicarEnCasillaAsync(tablero, {
      col: this.data.posicion.x,
      fila: this.data.posicion.y,
      tamanoCasilla: tileSize,
      orientacion: 'izquierda',
    });
  }

  onSeleccionar(enemigoEspecifico, pilaDetareas) {
    this.pilaDetareas = pilaDetareas;
    this.enemigoEspecifico = enemigoEspecifico;
    if (!this.enemigoEspecifico) return;
    if (typeof this.enemigoEspecifico.propiedadesEspeciales === 'function') {
      this.enemigoEspecifico.propiedadesEspeciales(this.enemigoEspecifico);
    }
  }

  onDeseleccionar() {}

  obtenerDatosDetalle() {
    if (!this.enemigoEspecifico) return null;
    if (typeof this.enemigoEspecifico.propiedadesEspeciales === 'function') {
      this.enemigoEspecifico.propiedadesEspeciales(this.enemigoEspecifico);
    }
    return construirDatosDetalle(this.enemigoEspecifico, 'Enemigos');
  }
}

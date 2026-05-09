export default class Enemigos {
    constructor(data, sceneEntidad) {
        this.data = data;
        this.sceneEntidad = sceneEntidad;
    }

    obtenerEscenaTablero() {
        return this.sceneEntidad?.scene?.get?.('tablero');
    }
    
    iniciarEnemigo(enemigoEspecifico) {
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
}
import { abrirPanelInferior } from '../PanelInferior/index.js';

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

    coneccionGeneral(enemigoEspecifico, pilaDetareas) {
        this.pilaDetareas = pilaDetareas;
        this.enemigoEspecifico = enemigoEspecifico;
        this.enemigoEspecifico.generarEstadisticas(this.enemigoEspecifico);
        console.log(this.enemigoEspecifico.estadisticas);
        const datos = {
            imagen: 'assets/images/candle.png',
            nombre: this.enemigoEspecifico.datos.arquetipo,
            vida: {
                vidaActual: this.enemigoEspecifico.estadisticas.hp,
                vidaMaxima: this.enemigoEspecifico.estadisticas.hp,
            },
            estadisticas: [
                {icono: 'assets/images/candle.png', nombre: 'ATK', cantidad: this.enemigoEspecifico.estadisticas.ataque},
                {icono: 'assets/images/candle.png', nombre: 'DEF', cantidad: this.enemigoEspecifico.estadisticas.defensa}, 
                {icono: 'assets/images/candle.png', nombre: 'VELOCIDAD', cantidad: this.enemigoEspecifico.estadisticas.velocidad}, 
                {icono: 'assets/images/candle.png', nombre: 'NIVEL', cantidad: this.enemigoEspecifico.estadisticas.nivel},
            ]
        };
        const scene = this.sceneEntidad;
        this.panel = abrirPanelInferior(scene, datos, {
            onCerrar: () => {
                this.panel = null;
            },
        });
    }
}
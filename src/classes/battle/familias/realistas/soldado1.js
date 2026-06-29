import BaseRealistas from '../bases/baseRealistas.js';
import { registrarAnimacionesDesdeSpritesheet } from '../bases/phaserMoldFactory.js';
import tablero from '../../tablero.js';

export default class Soldado1 extends BaseRealistas {
  /** @param {import('../bases/baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  construirAnimacionEstatica(scene) {
    registrarAnimacionesDesdeSpritesheet(scene, 'soldado1Static', [{
      key: 'soldado1_static',
      startFrame: 0,
      endFrame: 5,
      frameRate: 10,
      repeat: -1,
    }]);
  }
  
  obtenerConfigAnimacionEstatica() {
    return {
      molde: { textureKey: 'soldado1Static', frame: 0, escala: 9 },
      animKey: 'soldado1_static',
    };
  }

  propiedadesEspeciales(aliadoEspecifico) {
    const n = aliadoEspecifico.datos.nivel;
    const prev = aliadoEspecifico.estadisticas ?? {};
    const hpMax = 200 * n;
    aliadoEspecifico.estadisticas = {
      hp : prev.hp ?? hpMax,
      hpMax,
      ataque : prev.ataque ?? (15 * n),
      velocidad : 10,
      escudos : prev.escudos ?? (5 * n),
      curas : 0,
      balas : prev.balas ?? 0,
    }
    aliadoEspecifico.listaDeAcciones = {
      habilidades : [ 
      {
        nombre: "curar",
        ejecución: (aliadoObjetivo) => { aliadoObjetivo.estadisticas.hp += 25 + 10*n; aliadoEspecifico.estadisticas.curas -= 1; },
        rango: 3,
        condicional: aliadoEspecifico.estadisticas.curas > 0,
        casoDeElección: 0,
        velocidad: 15 + n*2,
        ruta: "../../../assets/images/battle/iconos/accion/S_Holy03.png"
      },

      {
        nombre: "escudar",
        ejecución: () => { aliadoEspecifico.estadisticas.escudos -= 1; },
        rango: 2,
        condicional: aliadoEspecifico.estadisticas.escudos > 0,
        efectoTipo1: 'escudo',
        casoDeElección: 1,
        velocidad: 10 + 3*(n-1),
        ruta: "../../../assets/images/battle/iconos/accion/E_Wood03.png"
      },
      
      {
        nombre: "atacar",
        ejecución: (enemigoObjetivo) => { enemigoObjetivo.estadisticas.hp -= 25 + 10*n + aliadoEspecifico.estadisticas.ataque; },
        rango: 2,
        condicional: true,
        casoDeElección: 0,
        velocidad: 15 + (n-1),
        ruta: "../../../assets/images/battle/iconos/accion/S_Sword01.png"
      },

      {
        nombre: "descansar",
        ejecución: () => { aliadoEspecifico.estadisticas.ataque += n + 5; },
        condicional: true,
        casoDeElección: null,
        velocidad: 20 + 2*(n-1),
        ruta: "../../../assets/images/battle/iconos/accion/S_Dagger06.png"
      },

      {
        nombre: "dopar",
        ejecución: () => { console.log("xD"); },
        condicional: aliadoEspecifico.estadisticas.ulti,
        casoDeElección: null,
        velocidad: 25 + 2*n,
        ruta: "../../../assets/images/battle/iconos/accion/S_Buff01.png"
      }
    ],

      objetos : [{
        nombre: "Tomarbebida",
        ejecución: () => { aliadoEspecifico.estadisticas.hp += 30; },
        condicional: true,
        casoDeElección: null,
        velocidad: 10,
        ruta: "../../../assets/images/battle/iconos/accion/I_Water.png"
      }, {
        nombre: "PonerTrampa",
        ejecución: () => { console.log("PonerTrampa"); },
        condicional: n > 3,
        casoDeElección: "casilla",
        velocidad: 10,
        ruta: "../../../assets/images/battle/iconos/accion/S_Earth03.png"
      }
    ],

      movimiento : [{
        nombre: "Rey1",
        ejecución: (coordenadas, contexto) => {
          return tablero.moverEntidad(contexto?.tarea?.entidad ?? aliadoEspecifico, coordenadas, contexto?.arrayBidimencional);
        },
        rango: 1,
        condicional: true,
        casoDeElección: "casilla",
        velocidad: 10,
        ruta: "../../../assets/images/battle/iconos/accion/A_Shoes01.png"
      }, {
        nombre: "Restirada",
        ejecución: () => {},
        rango: 2,
        condicional: true,
        efectoTipo1: 'retirada',
        casoDeElección: 1,
        velocidad: 10,
        ruta: "../../../assets/images/battle/iconos/accion/S_Buff11.png"
      }
    ]
    };
  }
}

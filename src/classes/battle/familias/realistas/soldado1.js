import BaseRealistas from '../bases/baseRealistas.js';
import { registrarAnimacionesDesdeSpritesheet } from '../bases/phaserMoldFactory.js';

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
    aliadoEspecifico.estadisticas = {
      hp : 200 * n,
      ataque : 15 * n,
      velocidad : 10,
      escudos : 5 * n,
      curas : 0,
      balas : 0,
    }
    aliadoEspecifico.listaDeAcciones = {
      habilidades : [
          {
            nombre: "verificar si tiene n",
            ejecución: () => { console.log(n)},
            condicional: true,
            casoDeElección: null
          },
    
          {
            nombre: "curar",
            ejecución: (aliadoObjetivo) => { aliadoObjetivo.estadisticas.hp += 25 + 10*n; aliadoEspecifico.estadisticas.curas -= 1; },
            condicional: aliadoEspecifico.estadisticas.curas > 0,
            casoDeElección: 0
          },
    
          {
            nombre: "escudar",
            ejecución: (aliadoObjetivo) => { aliadoEspecifico.estadisticas.escudos -= 10; },
            condicional: aliadoEspecifico.estadisticas.escudos > 0,
            casoDeElección: 1
          },
          
          {
            nombre: "atacar",
            ejecución: (enemigoObjetivo) => { enemigoObjetivo.estadisticas.hp -= 25 + 10*n + aliadoEspecifico.estadisticas.ataque; },
            condicional: true,
            casoDeElección: 0
          },
    
          {
            nombre: "descansar",
            ejecución: () => { aliadoEspecifico.estadisticas.ataque += n + 5; },
            condicional: true,
            casoDeElección: null
          },
    
          {
            nombre: "dopar",
            ejecución: () => { console.log("xD"); },
            condicional: aliadoEspecifico.estadisticas.ulti,
            casoDeElección: null
          }
        ],
      objetos : [{
        nombre: "Tomarbebida",
        ejecución: () => { console.log("Tomarbebida"); },
        condicional: true,
        casoDeElección: 0
      }, {
        nombre: "PonerTrampa",
        ejecución: () => { console.log("PonerTrampa"); },
        condicional: true,
        casoDeElección: 1
      }
    ],

      movimiento : [{
        nombre: "Rey1",
        ejecución: () => { console.log("Rey1"); },
        condicional: true,
        casoDeElección: 0
      }, {
        nombre: "Restirada",
        ejecución: () => { console.log("Restirada"); },
        condicional: true,
        casoDeElección: 1
      }
    ]
  }
  }
}

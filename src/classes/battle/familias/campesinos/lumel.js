import Aliados from '../../../../scenes/battles/ui/Entidades/Aliados.js';
import BaseCampesinos from '../bases/baseCampesinos.js';
import { registrarAnimacionesDesdeSpritesheet } from '../bases/phaserMoldFactory.js';

export default class Lumel extends BaseCampesinos {
  /** @param {import('../bases/baseGeneral.js').DatosEntidad} datos */
  constructor(datos) {
    super(datos);
  }

  /**
   * La textura `lumelStatic` debe estar encolada en `preload` de la escena (p. ej. `entidadScene`).
   * Aquí solo se registran las animaciones cuando la textura ya existe en `create`.
   */
  construirAnimacionEstatica(scene) {
    registrarAnimacionesDesdeSpritesheet(scene, 'lumelStatic', [{
      key: 'lumel_static',
      startFrame: 0,
      endFrame: 5,
      frameRate: 10,
      repeat: -1,
    }]);
  }

  /** Usado por `BaseGeneral.ubicarEnCasillaAsync` para crear el sprite y reproducir la anim. */
  obtenerConfigAnimacionEstatica() {
    return {
      molde: { textureKey: 'lumelStatic', frame: 0, escala: 9 },
      animKey: 'lumel_static',
    };
  }

  propiedadesEspeciales(aliadoEspecifico) {
    const n = aliadoEspecifico.datos.nivel;
    aliadoEspecifico.estadisticas = {
      hp : 100 + 50 * n,
      ataque : 10 + 5* n,
      velocidad : 1,
      escudos : 3,
      curas : 1 + 2*n,
      ulti: true
    }

    aliadoEspecifico.listaDeAcciones = {
      habilidades : [ 
      {
        nombre: "verificar si tiene n",
        ejecución: () => { console.log(n)},
        condicional: true,
        casoDeElección: null,
        velocidad: 10
      },

      {
        nombre: "curar",
        ejecución: (aliadoObjetivo) => { aliadoObjetivo.estadisticas.hp += 25 + 10*n; aliadoEspecifico.estadisticas.curas -= 1; },
        condicional: aliadoEspecifico.estadisticas.curas > 0,
        casoDeElección: "Aliados",
        velocidad: 15 + n*2
      },

      {
        nombre: "escudar",
        ejecución: (aliadoObjetivo) => { aliadoEspecifico.estadisticas.escudos -= 10; },
        condicional: aliadoEspecifico.estadisticas.escudos > 0,
        casoDeElección: 1,
        velocidad: 10 + 3*(n-1)
      },
      
      {
        nombre: "atacar",
        ejecución: (enemigoObjetivo) => { enemigoObjetivo.estadisticas.hp -= 25 + 10*n + aliadoEspecifico.estadisticas.ataque; },
        condicional: true,
        casoDeElección: "Enemigos",
        velocidad: 15 + n-1
      },

      {
        nombre: "descansar",
        ejecución: () => { aliadoEspecifico.estadisticas.ataque += n + 5; },
        condicional: true,
        casoDeElección: null,
        velocidad: 20 + 2*(n-1)
      },

      {
        nombre: "dopar",
        ejecución: () => { console.log("xD"); },
        condicional: aliadoEspecifico.estadisticas.ulti,
        casoDeElección: null,
        velocidad: 25 + 2*n
      }
    ],

      objetos : [{
        nombre: "Tomarbebida",
        ejecución: () => { aliadoEspecifico.estadisticas.hp += 30; },
        condicional: true,
        casoDeElección: 0,
        velocidad: 10
      }, {
        nombre: "PonerTrampa",
        ejecución: () => { console.log("PonerTrampa"); },
        condicional: n > 3,
        casoDeElección: 1,
        velocidad: 10
      }
    ],

      movimiento : [{
        nombre: "Rey1",
        ejecución: () => { console.log("Rey1"); },
        condicional: true,
        casoDeElección: 0,
        velocidad: 10
      }, {
        nombre: "Restirada",
        ejecución: () => { console.log("Restirada"); },
        condicional: true,
        casoDeElección: 1,
        velocidad: 10
      }
    ]
    };
  }
}

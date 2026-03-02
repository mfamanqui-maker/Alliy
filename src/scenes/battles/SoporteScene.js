export default class SoporteScene extends Phaser.Scene {
  constructor(key) {
    super({ key });
  }
  cargar(Aliado_1, Aliado_2, Aliado_3, Enemigo_1, Enemigo_2, Enemigo_3) {
    const entidades = [Aliado_1, Aliado_2, Aliado_3, Enemigo_1, Enemigo_2, Enemigo_3]
    window.resetGameData()
    const w = window.gameData
    entidades.forEach((value, index) => {

      let nombreArray = (index >= 3) ? "Enemigos" : "Aliados";
      let nombreArrayFinalidad = (index >= 3) ? "enemigosVivos" : "aliadosVivos";

      // 3. Definimos los datos del personaje según el "value" (B1, B2, B3)
      let datosPersonaje = null;

      if (value === "B1") {
        datosPersonaje = { vidas: 3, escudos: 1, curas: 3, balas: 0, accion: null, escudo: false, objetivo_anterior: null, objetivo_cura: null, vida_maxima: 3, Z: true };
      } else if (value === "B2") {
        datosPersonaje = { vidas: 4, escudos: 2, curas: 1, balas: 0, accion: null, escudo: false, objetivo_anterior: null, objetivo_cura: null, vida_maxima: 4, Z: true };
      } else if (value === "B3") {
        datosPersonaje = { vidas: 3, escudos: 3, curas: 1, balas: 0, accion: null, escudo: false, objetivo_anterior: null, objetivo_cura: null, vida_maxima: 3, Z: true };
      }

      // 4. Si el valor era válido, lo metemos en el array correspondiente
      if (datosPersonaje) {
        // Usamos corchetes para acceder a la propiedad dinámicamente (w["Aliados"] o w["Enemigos"])
        w[nombreArray].push(datosPersonaje);
        w[nombreArrayFinalidad].push(value)
      }
    });
  }

}


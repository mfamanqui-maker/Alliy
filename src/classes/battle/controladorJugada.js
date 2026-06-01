export default class controladorJugada {
  constructor(ArrayExportado, equipos, otros) {
    this.ArrayExportado = ArrayExportado;
    this.equipos = equipos;
    this.otros = otros;
    this.pilaDetareas = this._crearMapaAcciones();
    this.objetivoSeleccionado = null;
  }

  get acciones() {
    return this.pilaDetareas;
  }

  _crearMapaAcciones() {
    const mapaDeAcciones = new Map();
    return mapaDeAcciones;
  }

  actualizarPilaDetareas(nuevaTarea) { //más 10 de ego 
    this.objetivoSeleccionado = nuevaTarea?.objetivo ?? null;
    controladorJugada.idTarea++
    if (this.pilaDetareas.has(nuevaTarea.accion.velocidad)) {
      this.pilaDetareas.get(nuevaTarea.accion.velocidad).push(nuevaTarea)
    } else {
      this.pilaDetareas.set(nuevaTarea.accion.velocidad, [nuevaTarea]);

      const velocidades = Array.from(this.pilaDetareas.keys())
      const velocidadesOrdenadas = []
      const longitud = velocidades.length-1
      let   menorVelocidad = Infinity
      let   iDeEliminación;

      for (let i = 0; i <= longitud ; i++) {
        menorVelocidad = Infinity
        velocidades.forEach((velocidad, i) => {
          if (menorVelocidad > velocidad) {
            menorVelocidad = velocidad
            iDeEliminación = i
          }
        })
        velocidades.splice(iDeEliminación, 1)
        velocidadesOrdenadas.push(menorVelocidad)
      } 
      
      const viejoMapa = this.pilaDetareas
      const nuevoMapa = new Map()

      velocidadesOrdenadas.forEach((velocidad) => {
        nuevoMapa.set(velocidad, viejoMapa.get(velocidad))
      })

      this.pilaDetareas=nuevoMapa

      console.log(this.pilaDetareas)
    }
  }

  generarGuion() {
    console.log("holas");
  }
}

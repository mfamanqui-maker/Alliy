export default class controladorTurnos {
  constructor(ArrayExportado, equipos, otros) {
    this.ArrayExportado = ArrayExportado;
    this.equipos = equipos;
    this.otros = otros;
  }

  get acciones() {
    const mapaDeAcciones = new Map();
    this.ArrayExportado.forEach(fila => {
        for (let i = 0; i < fila.length; i++) {
            if (fila[i].id === 0 || fila[i].entidad === false) {
                continue;
            }
            mapaDeAcciones.set(fila[i].entidad, null);
        }
    });
    return mapaDeAcciones;
  }
}

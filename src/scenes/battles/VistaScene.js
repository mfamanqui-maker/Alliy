import SoporteScene from './SoporteScene.js';

export default class VistaScene extends SoporteScene {
  constructor() {
    super('vista');
  }

  preload() {
    const w = window.staticData
    w.batalla++
    if (w.batalla === 1) this.cargar("B1", false, false, "B1", false, false)
    if (w.batalla === 2) this.cargar("B1", "B2", false, "B1", "B2", false)
    if (w.batalla === 3) this.cargar("B1", "B2", "B3", "B1", "B2", "B3")

  }
  create() {
    const w = window.gameData
    this.add.text(850, 60, `Batalla ${window.staticData.batalla}`, {
      fontSize: '80px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const filas = [150, 450, 750];

    const nombresAliados = w.aliadosVivos;

    w.Aliados.forEach((y, i) => {
      this.add.rectangle(120, filas[i], 150, 220, 0x444444)

      const boton = this.add.circle(330, filas[i], 90, 0x444444).setInteractive({
        useHandCursor: true
      })
      console.log('ypai')
      w.botonesAliados.push(boton)
      boton.on('pointerdown', () => {
        if (w.aliadosVivos.includes(nombresAliados[i]) || w.fase === 'Curar?') {
          w.seleccion.aliado = nombresAliados[i]
          this.children.list.forEach(child => child.setAlpha(1));
          boton.setAlpha(0.5);
        }
      });

      const texto = this.add.text(330, filas[i], nombresAliados[i], {
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5);
      w.textosAliados.push(texto)

    });

    const nombresEnemigos = w.enemigosVivos;

    w.Enemigos.forEach((y, i) => {
      this.add.rectangle(1580, filas[i], 150, 220, 0x444444)


      const boton = this.add.circle(1370, filas[i], 90, 0x444444).setInteractive({
        useHandCursor: true
      })
      w.botonesEnemigos.push(boton)
      boton.on('pointerdown', () => {
        if (w.enemigosVivos.includes(nombresEnemigos[i])) {
          w.seleccion.enemigo = nombresEnemigos[i]
          this.children.list.forEach(child => child.setAlpha(1));
          boton.setAlpha(0.5);
        }
      });

      const texto = this.add.text(1370, filas[i], nombresEnemigos[i], {
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5);
      w.textosEnemigos.push(texto)

    });
  }
}
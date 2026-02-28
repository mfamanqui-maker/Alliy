export default class MapaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'mapa' });
  }
  preload () { 
    this.load.spritesheet('Down', 'assets/WalkDown.png', {frameWidth: 32, frameHeight: 32})
    this.load.spritesheet('Up', 'assets/WalkUp.png', {frameWidth: 32, frameHeight: 32})
    this.load.spritesheet('Right', 'assets/WalkRight.png', {frameWidth: 32, frameHeight: 32})
    this.load.spritesheet('Left', 'assets/WalkLeft.png', {frameWidth: 32, frameHeight: 32})

    this.load.image('dragon1', 'assets/55.PNG')
    this.load.image('dragon2', 'assets/95.PNG')

    this.w = this.input.keyboard.addKey('W')
    this.a = this.input.keyboard.addKey('A')
    this.s = this.input.keyboard.addKey('S')
    this.d = this.input.keyboard.addKey('D')
  }

  create () {
    this.Lumel = this.add.sprite(850,450, 'Down').setScale(2).setOrigin(0.5);
    this.anims.create({
      key:'walk-down',
      frames: this.anims.generateFrameNumbers('Down', {start: 0, end: 7}),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key:'walk-up',
      frames: this.anims.generateFrameNumbers('Up', {start: 0, end: 7}),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key:'walk-left',
      frames: this.anims.generateFrameNumbers('Left', {start: 0, end: 7}),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key:'walk-right',
      frames: this.anims.generateFrameNumbers('Right', {start: 0, end: 7}),
      frameRate: 10,
      repeat: -1
    })

    this.enemyGroup = this.physics.add.group({
        collideWorldBounds: true,
        bounceX: 1,
        bounceY: 1
    });

    for (let i = 0; i < 5; i++) {
        const x = 100 + (i * 80);
        const y = 150;
        const enemy1 = this.enemyGroup.create(x, y, 'dragon1').setScale(0.2);
        
        // Velocidad aleatoria
        const velX = Phaser.Math.Between(-200, 200);
        const velY = Phaser.Math.Between(-200, 200);
        enemy1.setVelocity(velX, velY);
    }

    for (let i = 0; i < 5; i++) {
        const x = 100 + (i * 80);
        const y = 350;
        const enemy2 = this.enemyGroup.create(x, y, 'dragon2').setScale(0.2);
        
        const velX = Phaser.Math.Between(-200, 200);
        const velY = Phaser.Math.Between(-200, 200);
        enemy2.setVelocity(velX, velY);
    }
    this.enemyGroup.children.iterate((image) => {
      const velocidadx = Phaser.Math.Between(-150, 150);
      const velocidady = Phaser.Math.Between(-150, 150);
      image.setVelocity(velocidadx, velocidady);
    });
  }
  update() {
    if (this.w.isDown) {
      this.Lumel.play('walk-up', true)
      this.Lumel.y -= 5
    };
    if (this.a.isDown) {
      this.Lumel.play('walk-left', true);
      this.Lumel.x -= 5
    } 
    if (this.s.isDown) {
      this.Lumel.play('walk-down', true);
      this.Lumel.y += 5
    }
    if (this.d.isDown) {
      this.Lumel.play('walk-right', true);
      this.Lumel.x += 5
    }
  }
}
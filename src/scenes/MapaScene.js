export default class MapaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'mapa' });
  }
  preload () { 
    this.load.tilemapTiledJSON('global', 'assets/maps/globalMap.tmj');
    this.load.image('tileset', 'assets/images/tileset_1bit.png');
    this.load.spritesheet('right', 'assets/images/WalkRight.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    this.load.spritesheet('up', 'assets/images/WalkUp.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    this.load.spritesheet('left', 'assets/images/WalkLeft.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    this.load.spritesheet('down', 'assets/images/WalkDown.png', {
      frameWidth: 32,
      frameHeight: 32
    })
  }

  create () {
    this.configGlobal = this.make.tilemap({ key: 'global' })
    this.tileset = this.configGlobal.addTilesetImage('sin textura', 'tileset')
    
    const ground = this.configGlobal.createLayer('ground', this.tileset)
    const wall = this.configGlobal.createLayer('walls', this.tileset)
    const decoration = this.configGlobal.createLayer('decoration', this.tileset)
    const objets = this.configGlobal.getObjectLayer('objects')
    const playerStart = objets.objects.find(obj => obj.name === 'start');
    
    this.player = this.physics.add.sprite(playerStart.x, playerStart.y, 'down', 0).setOrigin(0.5).setScale(0.7)
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2); 

    this.w = this.input.keyboard.addKey('W')
    this.a = this.input.keyboard.addKey('A')
    this.s = this.input.keyboard.addKey('S')
    this.d = this.input.keyboard.addKey('D')

    this.physics.world.setBounds(0, 0, this.configGlobal.widthInPixels, this.configGlobal.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.configGlobal.widthInPixels, this.configGlobal.heightInPixels);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    this.cameras.main.setZoom(4);
  
    wall.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, wall);

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('down', { start: 0, end: 7}),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('left', { start: 0, end: 7}),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('up', { start: 0, end: 7}),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('right', { start: 0, end: 7}),
      frameRate: 10,
      repeat: -1
    })
    this.speed = 100
    this.direction = 'down'
  }
  update() {
    this.player.setVelocity(0, 0)
    if (!(this.w.isDown || this.s.isDown || this.a.isDown || this.d.isDown)) {
      this.player.setFrame(1)
    }
    if (this.w.isDown) {
      this.player.play('up', true)
      this.player.setVelocityY(-this.speed)
      this.direction= 'up'
    } else if (this.s.isDown) {
      this.player.play('down', true)
      this.player.setVelocityY(this.speed)
      this.direction= 'down'
    }
    if (this.a.isDown) {
      this.player.play('left', true)
      this.player.setVelocityX(-this.speed)
      this.direction= 'left'
    } else if (this.d.isDown) {
      this.player.play('right', true)
      this.player.setVelocityX(this.speed)
      this.direction= 'right'
    }
  }
}
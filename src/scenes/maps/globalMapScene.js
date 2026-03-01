export default class MapaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'globalMap' });
  }
  preload() {
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

  create() {
    this.configGlobal = this.make.tilemap({ key: 'global' })
    this.tileset = this.configGlobal.addTilesetImage('sin textura', 'tileset')

    const ground = this.configGlobal.createLayer('ground', this.tileset)
    const wall = this.configGlobal.createLayer('walls', this.tileset, 0, 0)
    const decoration = this.configGlobal.createLayer('decoration', this.tileset)
    const objets = this.configGlobal.getObjectLayer('objects')
    const playerStart = objets.objects.find(obj => obj.name === 'start');

    this.player = this.physics.add.sprite(playerStart.x, playerStart.y, 'down', 0).setOrigin(0.5).setScale(0.7)
    this.lumelHouse = this.add.zone(61, 587, 20, 20);
    this.shop = this.add.zone(270, 552, 20, 20);
    this.battle1 = this.add.zone(117, 281, 20, 20);
    this.battle2 = this.add.zone(542, 213, 20, 20);

    // Paso 2: Habilitar física en cada zona
    this.physics.world.enable(this.lumelHouse);
    this.physics.world.enable(this.shop);
    this.physics.world.enable(this.battle1);
    this.physics.world.enable(this.battle2);

    // Paso 3: Hacer que no se muevan
    this.lumelHouse.body.setAllowGravity(false);
    this.lumelHouse.body.moves = false;

    this.shop.body.setAllowGravity(false);
    this.shop.body.moves = false;

    this.battle1.body.setAllowGravity(false);
    this.battle1.body.moves = false;

    this.battle2.body.setAllowGravity(false);
    this.battle2.body.moves = false;

    // Gráficos visuales (debug)
    this.add.circle(61, 587, 10, 0xff0000, 0.3);
    this.add.circle(270, 552, 10, 0x00ff00, 0.3);
    this.add.circle(117, 281, 10, 0xffff00, 0.3);
    this.add.circle(542, 213, 10, 0xff00ff, 0.3);
    // OVERLAPS
    this.physics.add.overlap(this.player, this.lumelHouse, () => {
      if (this.enter.isDown) this.scene.start('houseMap')
    });

    this.physics.add.overlap(this.player, this.shop, () => {
      console.log('yapi')
    });

    this.physics.add.overlap(this.player, this.battle1, () => {
      console.log('yapi')
    });

    this.physics.add.overlap(this.player, this.battle2, () => {
      console.log('yapi')
    });

    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    this.w = this.input.keyboard.addKey('W')
    this.a = this.input.keyboard.addKey('A')
    this.s = this.input.keyboard.addKey('S')
    this.d = this.input.keyboard.addKey('D')
    this.enter = this.input.keyboard.addKey('ENTER')

    this.physics.world.setBounds(0, 0, this.configGlobal.widthInPixels, this.configGlobal.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.configGlobal.widthInPixels, this.configGlobal.heightInPixels);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    this.player.body.setSize(14, 14);
    this.cameras.main.setZoom(4);

    wall.setCollisionByExclusion([-1]);
    wall.setCollision([74], false)

    this.physics.add.collider(this.player, wall);

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('down', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('left', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('up', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('right', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    })
    this.speed = 100
    this.direction = 'down'
  }
  update() {
    this.player.setVelocity(0, 0)
    if (this.input.activePointer.isDown) {
      console.log(this.player.x)
      console.log(this.player.y)
    }
    if (!(this.w.isDown || this.s.isDown || this.a.isDown || this.d.isDown)) {
      this.player.setFrame(0)
    }
    if (this.w.isDown) {
      this.player.play('up', true)
      this.player.setVelocityY(-this.speed)
      this.direction = 'up'
    } else if (this.s.isDown) {
      this.player.play('down', true)
      this.player.setVelocityY(this.speed)
      this.direction = 'down'
    }
    if (this.a.isDown) {
      this.player.play('left', true)
      this.player.setVelocityX(-this.speed)
      this.direction = 'left'
    } else if (this.d.isDown) {
      this.player.play('right', true)
      this.player.setVelocityX(this.speed)
      this.direction = 'right'
    }
  }
}
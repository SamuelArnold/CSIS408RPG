
EnemyTank = function(index, game, player, bullets)
{
    var x = game.world.randomX;
    var y = game.world.randomY;
    this.game = game;
    this.health = 3;
	this.type  = 0; 
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;
    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.tank.anchor.set(0.5);
    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);
    this.tank.angle = game.rnd.angle();
    game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);
};

EnemyTank.prototype.damage = function()
{
    this.health = this.health - power;
   // this.health -= 1;

    if (this.health <= 0) {
        this.alive = false;
        this.tank.kill();
        return true;
    }

    return false;
}

EnemyTank.prototype.update = function()
{

    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300) {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
			
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();

            bullet.reset(this.tank.x, this.tank.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
        }
    }
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload : preload, create : create, update : update, render : render });

function preload()
{
    game.load.image('tank', 'assets/Hero.png');
    game.load.image('enemy', 'assets/Turtle.png');
	game.load.image('enemy2', 'assets/Shark.png');
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
}
var land;
var shadow;
var tank;
var turret;
var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;
var logo;
var currentSpeed = 0;
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var moveUp;
var turnRight;
var turnLeft;
var gameStart = false;
var amountkilled = 0;
var power = 1;

function create()
{
    gameStart = false;


    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;

    //  The base of our tank
    tank = game.add.sprite(0, 0, 'tank');
    tank.anchor.setTo(0.5, 0.5);

	logo = game.add.sprite(0, 200, 'logo');
    logo.fixedToCamera = true;
    game.input.onDown.add(removeLogo, this);

}

function removeLogo()
{

    game.input.onDown.remove(removeLogo, this);
    logo.kill();
    gameStart = true;

    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;
    tank.health = 30;
    //  Finally the turret that we place on-top of the tank body

    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');

    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 20;
    enemiesAlive = 20;

    for (var i = 0; i < enemiesTotal; i++) {
        enemies.push(new EnemyTank(i, game, tank, enemyBullets));
    }

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(50, 'bullet', 0, false);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++) {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();

    // turret.bringToTop();
    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

    moveUp = game.input.keyboard.addKey(Phaser.Keyboard.W);
    turnRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
    turnLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
}

function update()
{
    if (gameStart == true) {
        game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);

        enemiesAlive = 0;

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {
                enemiesAlive++;
                game.physics.arcade.collide(tank, enemies[i].tank);
                game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
                enemies[i].update();
            }
        }

        if (turnLeft.isDown) {
            tank.angle -= 4;
        }
        else if (turnRight.isDown) {
            tank.angle += 4;
        }

        if (moveUp.isDown) {
            //  The speed we'll travel at
            currentSpeed = 300;
        }
        else {
            if (currentSpeed > 0) {
                currentSpeed -= 4;
            }
        }

        if (currentSpeed > 0) {
            game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
        }
        land.tilePosition.x = -game.camera.x;
        land.tilePosition.y = -game.camera.y;

        if (game.input.activePointer.isDown) {
            //  Boom!
            fire();
        }
		if (tank.health < 1){
			document.location.reload();
		}
    }
}

function bulletHitPlayer(tank, bullet)
{

    bullet.kill();
    tank.health -= 1;
	if   (tank.health < 1){
		var explosionAnimation = explosions.getFirstExists(false);
		explosionAnimation.z = 1000;
		explosionAnimation.reset(tank.x, tank.y);
		explosionAnimation.play('kaboom', 30, false, true);
		explosionAnimation.bringToTop();
				explosionAnimation.z = 1000;
	}
}

function bulletHitEnemy(tank, bullet)
{
    bullet.kill();
    var destroyed = enemies[tank.name].damage();

    if (destroyed) {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
              amountkilled  += 1;
              if (amountkilled >= 3)
			{
             power += 3;
			 amountkilled = 0;
			}
    }
}

function fire()
{
    if (game.time.now > nextFire && bullets.countDead() > 0) {
        nextFire = game.time.now + fireRate + 250;
        var bullet = bullets.getFirstExists(false);
        bullet.reset(tank.x, tank.y);
        bullet.rotation = game.physics.arcade.moveToPointer(bullet, 600, game.input.activePointer);
    }
}

function render()
{
    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text('Player Health: ' + tank.health, 32, 64);
	game.debug.text('your power is: '  + power, 32, 96);
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y:1000},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var platforms;
var cursors;
var stars;
var bombs;
var score = 0;
var scoreText;
var gameOver = false;

var game = new Phaser.Game(config);

function preload() {
    //this.load.setBaseURL('http://labs.phaser.io');
    //this.load.image('sky', 'assets/skies/space3.png');
    //this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'images/tiles/7.png');
    this.load.image('bomb', 'images/tiles/2.png');
    this.load.spritesheet('dude', 'images/dude.png', {frameWidth: 32, frameHeight: 48});
    this.load.image('background', 'images/background.png');
    this.load.image('brick', 'images/tiles/5.png');
}

function create() {
    this.add.image(400, 300, 'background').setScale(2);
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'brick').setScale(2).refreshBody();
    platforms.create(200, 580, 'brick').setScale(2).refreshBody();
    
    platforms.create(600, 400, 'brick');
    platforms.create(50, 350, 'brick');
    platforms.create(750, 220, 'brick');

    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{key: 'dude', frame: 4}],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    });

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x:12, y:0, stepX: 70}
    });

    stars.children.iterate(function(child) {
        child.setScale(0.25);
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
    scoreText = this.add.text(16, 16, 'score: 0', {fontsize: '32px', 'fill': '#000'});

}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 1;
    scoreText.setText('Score: '+score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setScale(0.25);
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && (player.body.touching.down || player.body.touching.left || player.body.touching.right)) {
        player.setVelocityY(-330);
    }
}
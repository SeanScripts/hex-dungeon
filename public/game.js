const gameState = {};

const config = {
	type: Phaser.AUTO,
	width: 1200,
	height: 800,
	backgroundColor: "#2d2d2d",
	scene: [HexDemoScene]
};

const game = new Phaser.Game(config);
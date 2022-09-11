// Create the canvas for the game to display in
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

var scale = 50;
var dxx = 0.0;
var dxy = 0.0;
var dyx = 0.0;
var dyy = 0.0;

// Load the background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
  // show the background image
  bgReady = true;
};
bgImage.src = "images/background.png";
// Load the hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
  // show the here image
  heroReady = true;
};
heroImage.src = "images/hero.png";
// Load the monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
  // show the monster image
  monsterReady = true;
};
monsterImage.src = "images/monster.png";
// Create the game objects
var hero = {
  speed: 256 // movement speed of hero in pixels per second
};
var monster = {};
var monstersCaught = 0;
// Handle keyboard controls
var keysDown = {};
// Check for keys pressed where key represents the keycode captured
addEventListener("keydown", function (key) {
  keysDown[key.keyCode] = true;
}, false);
addEventListener("keyup", function (key) {
  delete keysDown[key.keyCode];
}, false);
// Reset the player and monster positions when player catches a monster
var reset = function () {
  // Reset player's position to centre of canvas
  hero.x = canvas.width / 2;
  hero.y = canvas.height / 2;
  // Place the monster somewhere on the canvas randomly
  monster.x = 32 + (Math.random() * (canvas.width - 64));
  monster.y = 32 + (Math.random() * (canvas.height - 64));
};
// Update game objects - change player position based on key pressed
var update = function (modifier) {
  if (87 in keysDown) { //w
	hero.x -= hero.speed * modifier * 0.5;
    hero.y -= hero.speed * modifier * 0.5*Math.sqrt(3.0);
  }
  if (69 in keysDown) { //e
    hero.x += hero.speed * modifier * 0.5;
    hero.y -= hero.speed * modifier * 0.5*Math.sqrt(3.0);
  }
  if (65 in keysDown) { //a
    hero.x -= hero.speed * modifier;
  }
  if (68 in keysDown) { //d
    hero.x += hero.speed * modifier;
  }
  if (90 in keysDown) { //z
    hero.x -= hero.speed * modifier * 0.5;
    hero.y += hero.speed * modifier * 0.5*Math.sqrt(3.0);
  }
  if (88 in keysDown) { //x
    hero.x += hero.speed * modifier * 0.5;
    hero.y += hero.speed * modifier * 0.5*Math.sqrt(3.0);
  }
  if (49 in keysDown) { //1
    scale -= 1;
  }
  if (50 in keysDown) { //2
    scale += 1;
  }
  if (51 in keysDown) { //3
    dxx -= 0.001;
  }
  if (52 in keysDown) { //4
    dxx += 0.001;
  }
  if (53 in keysDown) { //5
    dxy -= 0.001;
  }
  if (54 in keysDown) { //6
    dxy += 0.001;
  }
  if (55 in keysDown) { //7
    dyx -= 0.001;
  }
  if (56 in keysDown) { //8
    dyx += 0.001;
  }
  if (57 in keysDown) { //9
    dyy -= 0.001;
  }
  if (48 in keysDown) { //0
    dyy += 0.001;
  }
  // Check if player and monster collider
  if (
    hero.x <= (monster.x + 32)
    && monster.x <= (hero.x + 32)
    && hero.y <= (monster.y + 32)
    && monster.y <= (hero.y + 32)
  ) {
    ++monstersCaught;
    reset();
  }
};

function flat_hex_corner(center, size, i) {
    var angle_deg = 60 * i;
    var angle_rad = Math.PI / 180 * angle_deg;
    return {"x": center.x + size * Math.sin(angle_rad), "y": center.y + size * Math.cos(angle_rad)};
}

function draw_hexagon(ctx, center, size) {
	ctx.beginPath();
	pt = flat_hex_corner(center, size, 0);
	ctx.moveTo(pt.x, pt.y);
	for (var i = 1; i <= 6; i++) {
		pt = flat_hex_corner(center, size, i);
		ctx.lineTo(pt.x, pt.y);
	}
	ctx.stroke();
}

// quadratic approximation
function distortion(center, scale, point, distortion) {
	var nx = (distortion.xx*(point.x - center.x)*(point.x - center.x) + distortion.xy*(point.x - center.x)*(point.y - center.y))/scale;
	var ny = (distortion.yx*(point.y - center.y)*(point.x - center.x) + distortion.yy*(point.y - center.y)*(point.y - center.y))/scale;
	return {"x": point.x + nx, "y": point.y + ny};
}

function draw_distorted_hexagon(ctx, center, size, dcenter, scale, dis) {
	ctx.beginPath();
	pt = distortion(dcenter, scale, flat_hex_corner(center, size, 0), dis);
	ctx.moveTo(pt.x, pt.y);
	for (var i = 1; i <= 6; i++) {
		pt = distortion(dcenter, scale, flat_hex_corner(center, size, i), dis);
		ctx.lineTo(pt.x, pt.y);
	}
	ctx.stroke();
}

/*
ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x, y);
	ctx.stroke();
	*/

// Draw everything on the canvas
var render = function () {
	ctx.fillStyle = "#000000"
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.strokeStyle = "#FFFFFF"
  /*
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0);
  }
  */
  if (heroReady) {
    ctx.drawImage(heroImage, hero.x, hero.y);
  }
  if (monsterReady) {
    ctx.drawImage(monsterImage, monster.x, monster.y);
  }
  // Display score and time 
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "24px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Monsters caught: " + monstersCaught, 20, 20);
  ctx.fillText("Time: " + count, 20, 50);
  // Display game over message when timer finished
  if(finished==true){
    ctx.fillText("Game over!", 200, 220);
  }
  
  
  offsetx = canvas.width*0.5
  offsety = canvas.height*0.5
  center = {"x": offsetx, "y": offsety}
	for (var i = -10; i <= 10; i++) {
		for (var j = -10; j <= 10; j++) {
			for (var k = -10; k <= 10; k++) {
				x = offsetx+scale*(-i + 0.5*j + 0.5*k)
				y = offsety+scale*Math.sqrt(3)*0.5*(j-k)
				dis = {"xx":dxx, "xy":dxy, "yx":dyx, "yy":dyy}
				//dpt = distortion({"x": offsetx, "y": offsety}, scale, {"x": x, "y": y}, dis);
				//ctx.strokeStyle = "#FFFFFF";
				//draw_hexagon(ctx, {"x": x, "y": y}, scale/Math.sqrt(3))
				ctx.strokeStyle = "#FF0000";
				draw_distorted_hexagon(ctx, {"x": x, "y": y}, scale/Math.sqrt(3), center, scale, dis);
			}
		}
	}
  
};
var count = 30; // how many seconds the game lasts for - default 30
var finished = false;
var counter =function(){
  count=count-1; // countown by 1 every second
  // when count reaches 0 clear the timer, hide monster and
  // hero and finish the game
    if (count <= 0)
    {
      // stop the timer
       clearInterval(counter);
       // set game to finished
       finished = true;
       count=0;
       // hider monster and hero
       monsterReady=false;
       heroReady=false;
    }
}
// timer interval is every second (1000ms)
setInterval(counter, 1000);
// The main game loop
var main = function () {
  // run the update function
  update(0.02); // do not change
  // run the render function
  render();
  // Request to do this again ASAP
  requestAnimationFrame(main);
};
// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
// Let's play this game!
reset();
main();
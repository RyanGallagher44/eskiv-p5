/* 
	This is where you put your p5.js Javascript code (your "sketch"). 
	
	I have filled in some demo code just to get you started in setting up a sketch,
	and creating a class. You can delete it or modify it as you see fit. 

	Please feel free to make use of the p5.js reference documentation:
		- https://p5js.org/reference/

	As well their examples:
		- https://p5js.org/examples/
	
	p5.js can be anything covered by the normal Javascript specification, plus
	whatever is included in the specifics of the p5.js specification. 
	
	If, after editing this file, you don't see your changes being implemented when
	you load it in the browser, hold down Shift and click Reload in your browser
	to force it to re-download the script code. 
	
	You can also always look at the Javascript console in your browser to see if
	there are any errors, and use console.log() to send messages to the console,
	which are useful for tracking what is and isn't running, or debugging variables.
	
	If you find the in-class discussion of the below trivially easy, here are a few
	extra challenges to try (in order of difficulty): 
		- Make it so that the text changes color ever time it bounces!
		- Make it so that a number of bouncing texts are spawned instead of one!
		-	Make it so that the moving text creates fading shadows behind it as it goes!
		- Fix the bouncing function so that it is pixel perfect (so the text can't exceed 
			the canvas bounds, no matter what its movement vector is set to)!
		- Make it so that your multiple bouncing texts bounce off of each other as well as
			the canvas bounds!
*/

/* Ryan Gallagher */

let speeds = {
	easy: 3,
	medium: 5,
	hard: 7
};

let collect;
let tap;
let dead;
let player;
let player_vx = 0;
let player_vy = 0;
let player_speed = 3;
let collected = false;
let rect_x;
let rect_y;
let rect_w = 25;
let score = 0;
let enemies = new Array ();
let game_over = false;
let difficulty;
let selected_diff = 'easy'; 

/* this function resets the entire game */
function restart () {
	game_over = false;

	rect_x = random(0, width-rect_w);
	rect_y = random(0, height-rect_w);

	player = new Player({
		x: width/2,
		y: height/2,
		w: 25
	});

	collected = false;
	score = 0;
	enemies.splice(0, enemies.length);
}

class Sound {

	constructor(src) {
		this.sound = document.createElement("audio");
		this.sound.src = src;
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.style.display = "none";
		document.body.appendChild(this.sound);
		this.play = function () {
			this.sound.play();
		};
		this.stop = function () {
			this.sound.pause();
		};
	}
}

function preload() {
	collect = new Sound('sounds/collect.wav');
	tap = new Sound('sounds/tap.wav');
	dead = new Sound('sounds/dead.wav');
}

function setup() {
	createCanvas(600,500);
	frameRate(60);

	/* difficulty select */
	difficulty = createSelect();
	difficulty.position(650, 25);
	difficulty.option('easy (enemy speed = 3)');
	difficulty.option('medium (enemy speed = 5)');
	difficulty.option('hard (enemy speed = 7)');

	rect_x = random(0, width-rect_w);
	rect_y = random(0, height-rect_w);

	player = new Player({
		x: width/2,
		y: height/2,
		w: 25
	});
}

function draw() {
	background(0);

	/* change enemy speeds whenever difficulty is changed */
	difficulty.changed(() => {
		selected_diff = difficulty.value().split(' ')[0];
		enemies.forEach((enemy) => {
			if (enemy.dir == 'horizontal') {
				enemy.vx = speeds[selected_diff];
			} else {
				enemy.vy = speeds[selected_diff];
			}
		});
	});
  
	if (!game_over) {
		if (collected) {
			let dir_chance = int(random(0, 2));	/* creating a 50/50 chance of horizontal or vertical */
			
			if (dir_chance == 0) {
				enemies.push(new Enemy({
					x: random(0, width-10),
					y: random(0, height-10),
					w: 10,
					dir: 'horizontal',
					vx: speeds[selected_diff],
					vy: 0,
					color: color(random(0, 255), random(0, 255), random(0, 255))
				}));
			} else {
				enemies.push(new Enemy({
					x: random(0, width-10),
					y: random(0, height-10),
					w: 10,
					dir: 'vertical',
					vx: 0,
					vy: speeds[selected_diff],
					color: color(random(0, 255), random(0, 255), random(0, 255))
				}));
			}

			/* respawning rectangle */
			rect_x = random(0, width-rect_w);
			rect_y = random(0, height-rect_w);
			collected = !collected;
		}

		fill(255, 255, 255);
		rect(rect_x, rect_y, rect_w, rect_w);

		/* scoreboard */
		textSize(24);
		text(`Score: ${score}`, 10, 25);
		fill(255, 255, 255);

		/* draws the player */
		player.draw();

		/* draws each enemy */
		enemies.forEach((enemy) => {
			enemy.draw();
		});
	} else {	/* display game over screen */
		textSize(24);
		text('Game Over', width/2-(textWidth('Game Over')), height/2);
		textSize(16);
		text(`Final Score: ${score}`, width/2-(textWidth(`Final Score: ${score}`)), (height/2)+25);
		fill(255, 255, 255);
	}
}

/* called whenever a key is pressed */
function keyPressed() {
	if (keyCode === 65 || keyCode === 74) {	/* LEFT */
		player_vx = -player_speed;
	}
	if (keyCode === 68 || keyCode === 76) {	/* RIGHT */
		player_vx = player_speed;
	}
	if (keyCode === 83 || keyCode === 75) {	/* DOWN */
		player_vy = player_speed;
	}
	if (keyCode === 87 || keyCode === 73) {	/* UP */
		player_vy = -player_speed;
	}

	if (game_over) {
		if (keyCode === 32) {
			restart();
		}
	}
}

/* called whenever a key is released */
function keyReleased() {
	if (keyCode === 65 || keyCode === 74) {
		player_vx = 0;
	}
	if (keyCode === 68 || keyCode === 76) {
		player_vx = 0;
	}
	if (keyCode === 83 || keyCode === 75) {
		player_vy = 0;
	}
	if (keyCode === 87 || keyCode === 73) {
		player_vy = 0;
	}
}

/* player object */
class Player {
	
	constructor(args) {
		this.x = args.x;
		this.y = args.y;
		this.w = args.w;

		if (args.color == undefined) {
			this.color = color(255,255,255);
		} else {
			this.color = args.color;
		}
	}
	
	draw () {
		noStroke();
		ellipse(this.x, this.y, this.w);
		fill(this.color);

		this.x+=player_vx;
		this.y+=player_vy;	

		// checking canvas bounds
		if (this.x+(this.w/2) >= width) {
			this.x = width-(this.w/2);
		}
		if (this.x-(this.w/2) <= 0) {
			this.x = this.w/2;
		}
		if (this.y+(this.w/2) >= height) {
			this.y = height-(this.w/2);
		}
		if (this.y-(this.w/2) <= 0) {
			this.y = this.w/2;
		}

		// checking intersection with rectangle
		if (this.x+(this.w/2) >= rect_x && this.x-(this.w/2) <= rect_x+rect_w &&
			this.y+(this.w/2) >= rect_y && this.y-(this.w/2) <= rect_y+rect_w) {
			collected = !collected;
			score += 5;
			collect.play();
		}

		// checking intersection with each of the enemies
		enemies.forEach((enemy) => {
			if (this.x+(this.w/2) >= enemy.x && this.x-(this.w/2) <= enemy.x+enemy.w &&
				this.y+(this.w/2) >= enemy.y && this.y-(this.w/2) <= enemy.y+enemy.w) {
				dead.play();
				game_over = true;
			}
		});
	}
}

/* enemy object */
class Enemy {

	constructor(args) {
		this.x = args.x;
		this.y = args.y;
		this.w = args.w;
		this.dir = args.dir;
		this.vx = args.vx;
		this.vy = args.vy;

		if (args.color == undefined) {
			this.color = color(255,255,255);
		} else {
			this.color = args.color;
		}
	}
	
	draw () {
		noStroke();
		ellipse(this.x, this.y, this.w);
		fill(this.color);

		if (this.dir === 'horizontal') {
			this.x+=this.vx;

			/* reverse the direction of enemy when it hits a wall */
			if (this.x+(this.w/2) >= width) {
				tap.play();
				this.vx *= -1;
			}
			if (this.x-(this.w/2) <= 0) {
				tap.play();
				this.vx *= -1;
			}
		}

		if (this.dir === 'vertical') {
			this.y+=this.vy;

			/* reverse the direction of enemy when it hits a wall */
			if (this.y+(this.w/2) >= height) {
				tap.play();
				this.vy *= -1;
			}
			if (this.y-(this.w/2) <= 0) {
				tap.play();
				this.vy *= -1;
			}
		}
	}
}
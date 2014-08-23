var vec2 = require('fd-vec2');
var body = require('fd-body-2d');
var keyboard = require('fd-keyboard');
var createRenderer = require('fd-body-2d-renderer');
var collisions = require('fd-body-2d-collision');

var keyMap = {
    87          : 'up',
    83          : 'down',
    65          : 'left',
    68          : 'right',
    32          : 'jump'
};

var keyDown     = null,
    keyPressed  = null,
    keyReleased = null;

var mouse = vec2.zero();

window.init = function() {

	var canvas = document.querySelector('#canvas');
	var ctx = canvas.getContext('2d');
	var renderer = createRenderer(ctx);

	canvas.addEventListener('mousemove', function(evt) {
		mouse.x = evt.offsetX;
		mouse.y = evt.offsetY;
	});

	var kb = keyboard(canvas, keyMap);
	keyPressed  = kb.pressed;
    keyDown     = kb.down;
    keyReleased = kb.released;

	var walls = [
		[ 20, 20, 150, 20 ],
		[ 20, 20, 20, 200 ],
		[ 300, 300, 500, 100],
		[ 300, 320, 500, 520],
		[ 20, 200, 50, 200 ]

	].map(function(w) {
		return {
			position: vec2(w[0], w[1]),
			body: new body.LineSegment(vec2(w[2] - w[0], w[3] - w[1]))
		}
	});

	var ball = {
		position: vec2(150, 150),
		heading: vec2.zero(),
		velocity: vec2.zero(),
		body: new body.Circle(20)
	};

	ball = {
		position: vec2(150, 150),
		heading: vec2.zero(),
		velocity: vec2.zero(),
		body: new body.AABB(30, 30)
	};

	var box1 = {
		position: vec2(150, 450),
		body: new body.AABB(50, 50)
	};

	function tick() {

		var now = Date.now();
		var dt = now - lastTick;

		if (dt > 0) {
			update(dt / 1000);
			lastTick = now;
			render();
		}

		window.requestAnimationFrame(tick);

	}

	var lastTick = Date.now();
	window.requestAnimationFrame(tick);

	function update(delta) {
		
		processInput();

		ball.position.adjust_(ball.velocity, delta);

		collide();

	}

	function render() {

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.lineWidth = 1;

		ctx.strokeStyle = '#e0e0e0';
		for (var i = 0; i < walls.length; ++i) {
			renderer.renderBoundingCircle(walls[i]);
		}

		renderer.renderBoundingCircle(box1);
		renderer.renderBoundingCircle(ball);
		
		ctx.strokeStyle = 'black';
		for (var i = 0; i < walls.length; ++i) {
			renderer.renderOne(walls[i]);
		}

		renderer.renderOne(box1);

		ctx.strokeStyle = 'blue';
		ctx.fillStyle = 'blue';

		renderer.renderOne(ball);

		// ctx.beginPath();
		// ctx.arc(ball.position.x, ball.position.y, ball.body.radius, 0, Math.PI * 2, false);

		// ctx.globalAlpha = 0.2;
		// ctx.fill();

		// ctx.globalAlpha = 1;
		// ctx.stroke();

		// ctx.strokeStyle = 'red';
		// ctx.beginPath();
		// ctx.moveTo(ball.position.x, ball.position.y);
		// ctx.lineTo(
		// 	ball.position.x + ball.heading.x * ball.body.radius,
		// 	ball.position.y + ball.heading.y * ball.body.radius
		// );
		// ctx.stroke();

	}

	var BALL_SPEED = 100;

	function processInput() {

		vec2.sub(mouse, ball.position, ball.heading);
		ball.heading.normalize_();
		
		if (keyDown.up) {
			vec2.mul(ball.heading, BALL_SPEED, ball.velocity);
		} else if (keyDown.down) {
			vec2.mul(ball.heading, BALL_SPEED, ball.velocity);
			ball.velocity.mul_(-1);
		} else if (keyDown.left) {
			vec2.mul(ball.heading, BALL_SPEED, ball.velocity);
			var tmp = ball.velocity.x;
			ball.velocity.x = ball.velocity.y;
			ball.velocity.y = -tmp;
		} else if (keyDown.right) {
			vec2.mul(ball.heading, BALL_SPEED, ball.velocity);
			var tmp = ball.velocity.x;
			ball.velocity.x = -ball.velocity.y;
			ball.velocity.y = tmp;
		} else {
			ball.velocity.x = 0;
			ball.velocity.y = 0;
		}
	
	}

	function collide() {

		var result = new collisions.Result();

		if (collisions(box1, ball, result)) {
			ball.position.add_(result.mtv);
			// ball.position.add_(result.mtv);
		}


		// for (var i = 0; i < walls.length; ++i) {
		// 	if (collisions(walls[i], ball, result)) {
		// 		ball.position.add_(result.mtv);
		// 	}
		// }

	}

}
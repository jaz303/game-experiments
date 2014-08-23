(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/work/games/waw/exp/geo-renderer/main.js":[function(require,module,exports){
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
},{"fd-body-2d":"/Users/jason/work/games/waw/node_modules/fd-body-2d/index.js","fd-body-2d-collision":"/Users/jason/work/games/waw/node_modules/fd-body-2d-collision/index.js","fd-body-2d-renderer":"/Users/jason/work/games/waw/node_modules/fd-body-2d-renderer/index.js","fd-keyboard":"/Users/jason/work/games/waw/node_modules/fd-keyboard/index.js","fd-vec2":"/Users/jason/work/games/waw/node_modules/fd-vec2/index.js"}],"/Users/jason/work/games/waw/node_modules/fd-body-2d-collision/index.js":[function(require,module,exports){
var body = require('fd-body-2d');
var vec2 = require('fd-vec2');

var T = body.types;

module.exports = checkCollision;
module.exports.Result = Result;

var tv1 = vec2.zero();
var tv2 = vec2.zero();

function Result() {
	this.mtv = vec2.zero();
}

function checkCollision(i1, i2, result) {

    var p1 = i1.position;
    var b1 = i1.body;
    var p2 = i2.position;
    var b2 = i2.body;

    if ((b1.type & 1) && (b2.type & 1)) {
    	// this check is pointless for 2 circles as it's the same as the full test
    	if (b1.type !== T.BODY_CIRCLE || b2.type !== T.BODY_CIRCLE) {
    		vec2.add(p1, b1.boundOffset, tv1);
    		vec2.add(p2, b2.boundOffset, tv2);
    		var rss = b1.boundRadius + b2.boundRadius;
    		if (tv1.distancesq(tv2) > rss*rss) {
    		    return false;
    		}
    	}
	}

	var colliding	= null;
	var flipped 	= false;

	if (b1.type > b2.type) {
        
        var tmp = b2;
        b2 = b1;
        b1 = tmp;

        tmp = i2;
        i2 = i1;
        i1 = tmp;

        flipped = true;

    }

    if (b1.type === T.BODY_AABB) {
    	if (b2.type === T.BODY_AABB) {
    		colliding = AABB_AABB(i1, i2, result);
    	} else if (b2.type === T.BODY_CIRCLE) {
    		colliding = AABB_circle(i1, i2, result);
    	} else if (b2.type === T.BODY_LINE_SEGMENT) {
    		colliding = AABB_lineSegment(i1, i2, result);
    	}
    } else if (b1.type === T.BODY_CIRCLE) {
        if (b2.type === T.BODY_CIRCLE) {
        	//colliding = circle_circle(i1, i2, result);
        } else if (b2.type === T.BODY_LINE_SEGMENT) {
            colliding = circle_lineSegment(i1, i2, result);
        }
    }

    if (colliding === null) {
    	console.error("warning: unsupported arguments to collision detection");
    	return false;	
    } else {
    	if (flipped) {
    		result.mtv.x *= -1;
    		result.mtv.y *= -1;
    	}
    	return colliding;
    }

/*
    if (b1.type == T.BODY_AABB) {
        if (b2.type == T.BODY_AABB) {
            return AABB_AABB(b1, b2, result);
        } else if (b2.type == T.BODY_CIRCLE) {
            return AABB_circle(b1, b2, result);
        } else if (b2.type == T.BODY_POLYGON) {
            return AABB_polygon(b1, b2, result);
        } else if (b2.type == T.BODY_LINE) {
            return AABB_line(b1, b2, result);
        } else if (b2.type == T.BODY_LINE_SEGMENT) {
            return AABB_lineSegment(b1, b2, result);
        } else if (b2.type == T.BODY_H_AXIS) {
            return AABB_hAxis(b1, b2, result);
        } else if (b2.type == T.BODY_V_AXIS) {
            return AABB_vAxis(b1, b2, result);
        }
    } else if (b1.type == T.BODY_CIRCLE) {
        if (b2.type == T.BODY_CIRCLE) {
            return circle_circle(b1, b2, result);
        } else if (b2.type == T.BODY_POLYGON) {
            return circle_polygon(b1, b2, result);
        } else if (b2.type == T.BODY_LINE) {
            return circle_line(b1, b2, result);
        } else if (b2.type == T.BODY_LINE_SEGMENT) {
            return circle_lineSegment(b1, b2, result);
        } else if (b2.type == T.BODY_H_AXIS) {
            return circle_hAxis(b1, b2, result);
        } else if (b2.type == T.BODY_V_AXIS) {
            return circle_vAxis(b1, b2, result);
        }
    } else if (b1.type == T.BODY_POLYGON) {
        if (b2.type == T.BODY_POLYGON) {
            return polygon_polygon(b1, b2, result);
        } else if (b2.type == T.BODY_LINE) {
            return polygon_line(b1, b2, result);
        } else if (b2.type == T.BODY_LINE_SEGMENT) {
            return polygon_lineSegment(b1, b2, result);
        } else if (b2.type == T.BODY_H_AXIS) {
            return polygon_hAxis(b1, b2, result);
        } else if (b2.type == T.BODY_V_AXIS) {
            return polygon_vAxis(b1, b2, result);
        }
    } else if (b1.type == T.BODY_LINE_SEGMENT) {
        if (b2.type == T.BODY_LINE_SEGMENT) {
            return lineSegment_lineSegment(b1, b2, result);
        } else if (b2.type == T.BODY_LINE) {
            return lineSegment_line(b1, b2, result);
        } else if (b2.type == T.BODY_H_AXIS) {
            return lineSegment_hAxis(b1, b2, result);
        } else if (b2.type == T.BODY_V_AXIS) {
            return lineSegment_vAxis(b1, b2, result);
        }
    }
*/

}

function AABB_AABB(obj1, obj2, result) {

	var b1 = obj1.body;
	var b2 = obj2.body;

	var move = Infinity;
	var axis = null;

	var right = obj1.position.x - (obj2.position.x + b2.width);
	if (right > 0) {
		return false;
	} else {
		axis = 0;
		move = right;
	}

	var left = (obj1.position.x + b1.width) - obj2.position.x;
	if (left < 0) {
		return false;
	} else if (left < Math.abs(move)) {
		axis = 0;
		move = left;
	}

	var down = obj1.position.y - (obj2.position.y + b2.height);
	if (down > 0) {
		return false;
	} else if (-down < Math.abs(move)) {
		axis = 1;
		move = down;
	}

	var up = (obj1.position.y + b1.height) - obj2.position.y;
	if (up < 0) {
		return false;
	} else if (up < Math.abs(move)) {
		axis = 1;
		move = up;
	}
	
	if (axis === 0) {
		result.mtv.x = move;
		result.mtv.y = 0;
	} else {
		result.mtv.x = 0;
		result.mtv.y = move;
	}

	return true;

}

function AABB_circle(obj1, obj2, result) {

}

function AABB_lineSegment(obj1, obj2, result) {
	
}

function circle_circle(obj1, obj2, result) {
	
	// var distanceSq = b1.pos.distanceSq(b2.pos);
	// if (distanceSq >= b1.boundRadiusSq + b2.boundRadiusSq) {
	// 	result.colliding = true;
	// }

};

function circle_lineSegment(circle, segment, result) {

	var segmentVector 		= segment.body.size;
	var segmentEndToCentre	= circle.position.sub(segment.position);

	var t = segmentEndToCentre.dot(segmentVector) / segmentVector.magnitudesq();
	if (t < 0) t = 0;
	if (t > 1) t = 1;

	var projected = segmentVector.mul(t);
	var closest = segment.position.add(projected);
	var closestToCenter = circle.position.sub(closest);
	var distSq = vec2.magnitudesq(closestToCenter);

	if (distSq < circle.body.radius * circle.body.radius) {

		var dist = Math.sqrt(distSq);

		vec2.div(closestToCenter, dist, result.mtv);
		result.mtv.mul_(dist - circle.body.radius);

		return true;

	} else {

		return false;
	
	}

};

/*

//
// Supporting functions for Separating Axis Theorem

function projectTest(v1, v2, points1, points2) {
	var normal = new Vec2(-(v2.y - v1.y), v2.x - v1.x);
	normal.normalize();

	var min1 = Infinity,
		max1 = -Infinity,
		min2 = Infinity,
		max2 = -Infinity;

	for (var i = 0; i < points1.length; i++) {
		var dot = points1[i].dot(normal);
		if (dot < min1) min1 = dot;
		if (dot > max1) max1 = dot;
	}

	for (var i = 0; i < points2.length; i++) {
		var dot = points2[i].dot(normal);
		if (dot < min2) min2 = dot;
		if (dot > max2) max2 = dot;
	}

	if (max1 >= min2 && min1 <= max2) {
		return true;
	} else {
		return false;
	}
}

function collidePolygonPoints(p1, p2, result) {
	if (p1.length > 2) {
		for (var a = 1; a < p1.length; a++) {
			if (!projectTest(p1[a], p1[a-1], p1, p2)) return;
		}
	}
	
	if (!projectTest(p1[0], p1[p1.length - 1], p1, p2)) {
		return;
	}
	
	if (p2.length > 2) {
		for (var a = 1; a < p2.length; a++) {
			if (!projectTest(p2[a], p2[a-1], p2, p1)) return;
		}
	}
	
	if (!projectTest(p2[0], p2[p2.length - 1], p2, p1)) {
		return;
	}
	
	result.colliding = true;
};

// Not sure this is correct although it seems to work.
// Double check - http://www.sevenson.com.au/actionscript/sat/
// Also - http://www.metanetsoftware.com/technique/tutorialA.html#section3
// (closest point algorithm below is lame. Voroni regions are better)
function collideCirclePoints(center, radius, points, result) {
	var minDistanceSq = 10000000, minPoint = null;
	for (var i = 0; i < points.length; i++) {
		var p = points[i], d = p.distanceSq(center);
		if (d < minDistanceSq) {
			minDistanceSq = d;
			minPoint = p;
		}
	}
	
	var normal = minPoint.sub(center);
	normal.normalize();
	                                                            haA
	var dot = center.dot(normal),
			min1 = dot - radius,
			max1 = dot + radius,
			min2 = 1000000000000,
			max2 = -1000000000000;
	
	for (var i = 0; i < points.length; i++) {
		var dot = points[i].dot(normal);
		if (dot < min2) min2 = dot;
		if (dot > max2) max2 = dot;
	}

	if (max1 >= min2 && min1 <= max2) {
		result.colliding = true;
	} else {
		result.colliding = false;
	}
};

function collideLines(s1, e1, s2, e2, seg1, seg2, result) {
	var denom = ((e1.x - s1.x) * (e2.y - s2.y)) - ((e1.y - s1.y) * (e2.x - s2.x));
	if (denom == 0) return;
	
	var n1    = ((s1.y - s2.y) * (e2.x - s2.x)) - ((s1.x - s2.x) * (e2.y - s2.y)),
		r     = n1 / denom,
		n2    = ((s1.y - s2.y) * (e1.x - s1.x)) - ((s1.x - s2.x) * (e1.y - s1.y)),
		s     = n2 / denom;
	
	if (seg1 && (r < 0 || r > 1)) return;
	if (seg2 && (s < 0 || s > 1)) return;
	
	result.colliding = true;
	result.poi.push(new Vec2(s1.x + (r * (e1.x - s1.x)),
													 s1.y + (r * (e1.y - s1.y))));
}

//
// Collision detectors

function AABB_AABB(b1, b2, result) {
	if (!(
			b1.pos.x > (b2.pos.x + b2.width) ||
			(b1.pos.x + b1.width < b2.pos.x) ||
			b1.pos.y > (b2.pos.y + b2.height) ||
			(b1.pos.y + b1.height) < b2.pos.y)) {
		result.colliding = true;
	}
};

function AABB_circle(b1, b2, result) {
	collideCirclePoints(b2.pos, b2.radius, [
		new Vec2(b1.pos.x, b1.pos.y),
		new Vec2(b1.pos.x + b1.width, b1.pos.y),
		new Vec2(b1.pos.x + b1.width, b1.pos.y + b1.height),
		new Vec2(b1.pos.x, b1.pos.y + b1.height)
	], result);
};

function AABB_polygon(b1, b2, result) {
	collidePolygonPoints([
		new Vec2(b1.pos.x, b1.pos.y),
		new Vec2(b1.pos.x + b1.width, b1.pos.y),
		new Vec2(b1.pos.x + b1.width, b1.pos.y + b1.height),
		new Vec2(b1.pos.x, b1.pos.y + b1.height)
	], b2.translatedPoints, result);
};

function AABB_line(b1, b2, result) {
	var tl = b1.pos,
			tr = new Vec2(tl.x + b1.width, tl.y),
			bl = new Vec2(tl.x, tl.y + b1.height),
			br = new Vec2(tl.x + b1.width, tl.y + b1.height),
			ls = b2.pos,
			le = b2.pos.add(b2.slope);
	
	collideLines(tl, tr, ls, le, true, false, result);
	collideLines(tr, br, ls, le, true, false, result);
	collideLines(br, bl, ls, le, true, false, result);
	collideLines(bl, tl, ls, le, true, false, result);
};

function AABB_lineSegment(b1, b2, result) {
	collidePolygonPoints([
		new Vec2(b1.pos.x, b1.pos.y),
		new Vec2(b1.pos.x + b1.width, b1.pos.y),
		new Vec2(b1.pos.x + b1.width, b1.pos.y + b1.height),
		new Vec2(b1.pos.x, b1.pos.y + b1.height)
	], [b2.pos, b2.pos.add(b2.size)], result);
};

function AABB_hAxis(b1, b2, result) {
	if ((b1.pos.y) <= b2.pos.y && (b1.pos.y + b1.height) >= b2.pos.y) {
		result.colliding = true;
	}
};

function AABB_vAxis(b1, b2, result) {
	if ((b1.pos.x) <= b2.pos.x && (b1.pos.x + b1.width) >= b2.pos.x) {
		result.colliding = true;
	}
};



function circle_polygon(b1, b2, result) {
	collideCirclePoints(b1.pos, b1.radius, b2.translatedPoints, result);
};

// http://paulbourke.net/geometry/sphereline/
function circle_line(b1, b2, result) {
	var d = b2.slope,
			p = b2.pos,
			a = d.x * d.x + d.y * d.y,
			b = 2 * ((d.x * (p.x - b1.pos.x)) + (d.y * (p.y - b1.pos.y))),
			c = b1.pos.x * b1.pos.x + b1.pos.y * b1.pos.y;
			
	c += p.x * p.x + p.y * p.y;
	c -= 2 * (b1.pos.x * p.x + b1.pos.y * p.y);
	c -= b1.radius * b1.radius;
			
	var discrim = (b * b) - (4 * a * c);
	
	if (Math.abs(a) < EPSILON || discrim < 0) {
		return;
	}
	
	var mu1 = (-b + Math.sqrt(discrim)) / (2 * a),
			mu2 = (-b - Math.sqrt(discrim)) / (2 * a);
			
	result.poi.push(b2.pos.add(d.mul(mu1)));
	result.poi.push(b2.pos.add(d.mul(mu2)));
	
	
	// There are potentially two points of intersection given by
	//    p = p1 + mu1 (p2 - p1)
	//    p = p1 + mu2 (p2 - p1)
	// *mu1 = (-b + sqrt(bb4ac)) / (2 * a);
	// *mu2 = (-b - sqrt(bb4ac)) / (2 * a);
	
	result.colliding = true;
};



function circle_hAxis(b1, b2, result) {
	if ((b1.pos.y - b1.radius) <= b2.pos.y && (b1.pos.y + b1.radius) >= b2.pos.y) {
		result.colliding = true;
	}
};

function circle_vAxis(b1, b2, result) {
	if ((b1.pos.x - b1.radius) <= b2.pos.x && (b1.pos.x + b1.radius) >= b2.pos.x) {
		result.colliding = true;
	}
};

function polygon_polygon(b1, b2, result) {
	collidePolygonPoints(b1.translatedPoints, b2.translatedPoints);
};

function polygon_line(b1, b2, result) {
	var tps = b1.translatedPoints,
			ls  = b2.pos,
			le  = b2.pos.add(b2.slope);
	for (var i = 0, l = tps.length - 1; i < l; i++) {
		collideLines(tps[i], tps[i + 1], ls, le, true, false, result);
	}
	collideLines(tps[tps.length - 1], tps[0], ls, le, true, false, result);
};

function polygon_lineSegment(b1, b2, result) {
	collidePolygonPoints(b1.translatedPoints, [b2.pos, b2.pos.add(b2.size)], result);
};

function polygon_hAxis(b1, b2, result) {
	var less = false, more = false;
	for (var i = 0; i < b1.translatedPoints.length; i++) {
		if (b1.translatedPoints[i].y <= b2.pos.y) {
			less = true;
		} else if (b1.translatedPoints[i].y >= b2.pos.y) {
			more = true;
		}
	}
	if (less && more) result.colliding = true;
};

function polygon_vAxis(b1, b2, result) {
	var less = false, more = false;
	for (var i = 0; i < b1.translatedPoints.length; i++) {
		if (b1.translatedPoints[i].x <= b2.pos.x) {
			less = true;
		} else if (b1.translatedPoints[i].x >= b2.pos.x) {
			more = true;
		}
	}
	if (less && more) result.colliding = true;
};

// http://stackoverflow.com/questions/1119451/how-to-tell-if-a-line-intersects-a-polygon-in-c
// http://paulbourke.net/geometry/lineline2d/
function lineSegment_lineSegment(b1, b2, result) {
	collideLines(b1.pos, b1.pos.add(b1.size), b2.pos, b2.pos.add(b2.size), true, true, result);
};

// http://paulbourke.net/geometry/lineline2d/
function lineSegment_line(b1, b2, result) {
	collideLines(b1.pos, b1.pos.add(b1.size), b2.pos, b2.pos.add(b2.slope), true, false, result);
};

function lineSegment_hAxis(b1, b2, result) {
	var p1 = b1.pos, p2 = b1.pos.add(b1.size);
	if (p1.y > p2.y) {
		var tmp = p2;
		p2 = p1;
		p1 = tmp;
	}
	if (p1.y <= b2.pos.y && p2.y >= b2.pos.y) {
		result.colliding = true;
	}
};

function lineSegment_vAxis(b1, b2, result) {
	var p1 = b1.pos, p2 = b1.pos.add(b1.size);
	if (p1.x > p2.x) {
		var tmp = p2;
		p2 = p1;
		p1 = tmp;
	}
	if (p1.x <= b2.pos.x && p2.x >= b2.pos.x) {
		result.colliding = true;
	}
};
*/
},{"fd-body-2d":"/Users/jason/work/games/waw/node_modules/fd-body-2d/index.js","fd-vec2":"/Users/jason/work/games/waw/node_modules/fd-vec2/index.js"}],"/Users/jason/work/games/waw/node_modules/fd-body-2d-renderer/index.js":[function(require,module,exports){
var vec2 = require('fd-vec2');
var T = require('fd-body-2d').types;

module.exports = function(ctx, width, height) {
	return new Renderer(ctx, width, height);
}

function Renderer(ctx, width, height) {
	this._ctx = ctx;
	this.width = width || ctx.canvas.width;
	this.height = height || ctx.canvas.height;
	this.fill = false;
	this.stroke = true;
	this._tmp1 = vec2.zero();
	this._tmp2 = vec2.zero();
}

Renderer.prototype.renderOne = function(obj) {
	
	var pos 	= obj.position;
	var body 	= obj.body;
	var ctx 	= this._ctx;

	ctx.beginPath();

	switch (body.type) {
		case T.BODY_AABB:
			ctx.rect(pos.x, pos.y, body.width, body.height);
			break;
		case T.BODY_CIRCLE:
			ctx.arc(pos.x, pos.y, body.radius, 0, Math.PI * 2, true);
			break;
		case T.BODY_POLYGON:
			ctx.save();
			ctx.translate(pos.x, pos.y);
			var points = body.points, start = points.x;
			ctx.moveTo(start.x, start.y);
			for (var i = 0, l = points.length; i < l; ++i) {
				ctx.lineTo(points[i].x, points[i].y);
			}
			ctx.lineTo(start.x, start.y);
			ctx.restore();
			break;
		case T.BODY_LINE_SEGMENT:
			ctx.moveTo(pos.x, pos.y);
			ctx.lineTo(pos.x + body.size.x, pos.y + body.size.y);
			break;
		case T.BODY_LINE:
			vec2.mul(body.slope, 10000, this._tmp1);
			vec2.add(pos, this._tmp1, this._tmp2);
			vec2.sub(pos, this._tmp1, this._tmp1);
			ctx.moveTo(this._tmp1.x, this._tmp1.y);
			ctx.lineTo(this._tmp2.x, this._tmp2.y);
			break;
		case T.BODY_H_AXIS:
			ctx.moveTo(0, pos.y);
			ctx.lineTo(this.width, pos.y);
			break;
		case T.BODY_V_AXIS:
			ctx.moveTo(pos.x, 0);
			ctx.lineTo(pos.x, this.height);
			break;
	}

	this.fill && ctx.fill();
	this.stroke && ctx.stroke();

}

Renderer.prototype.renderBoundingCircle = function(obj) {

	var pos 	= obj.position;
	var body 	= obj.body;
	var ctx 	= this._ctx;

	if (body.type & 1) {
		ctx.beginPath();
		ctx.arc(pos.x + body.boundOffset.x,
				pos.y + body.boundOffset.y,
				body.boundRadius,
				0, Math.PI * 2,
				true);
		ctx.stroke();
	}

}

Renderer.prototype.renderArray = function(ary) {
	for (var i = 0, l = ary.length; i < l; ++i) {
		this.renderOne(ary[i]);
	}
}

Renderer.prototype.renderEach = function(thing) {
	thing.forEach(this.renderOne, this);
}
},{"fd-body-2d":"/Users/jason/work/games/waw/node_modules/fd-body-2d/index.js","fd-vec2":"/Users/jason/work/games/waw/node_modules/fd-vec2/index.js"}],"/Users/jason/work/games/waw/node_modules/fd-body-2d/index.js":[function(require,module,exports){
var vec2 = require('fd-vec2');

var types = {};

types.BODY_AABB           	= 1;
types.BODY_CIRCLE         	= 3;
types.BODY_POLYGON        	= 5;
types.BODY_LINE_SEGMENT   	= 7;
types.BODY_LINE           	= 8;
types.BODY_H_AXIS         	= 10;
types.BODY_V_AXIS         	= 12;

exports.types 				= types;

exports.AABB 				= AABB;
exports.Circle 				= Circle;
exports.Polygon 			= Polygon;
exports.LineSegment 		= LineSegment;
exports.Line 				= Line;
exports.HAxis 				= HAxis;
exports.VAxis 				= VAxis;

function AABB(width, height) {
	this.width = width;
	this.height = height;

	this.boundOffset = vec2(width / 2, height / 2);
	this.boundRadiusSq = ((width/2)*(width/2) + (height/2)*(height/2));
	this.boundRadius = Math.sqrt(this.boundRadiusSq);
}

AABB.prototype.type = types.BODY_AABB;

function Circle(radius) {
	this.radius = radius;

	this.boundOffset = vec2.zero();
	this.boundRadius = radius;
	this.boundRadiusSq = radius * radius;
}

Circle.prototype.type = types.BODY_CIRCLE;

function Polygon(points) {
	this.points = points;

	var maxSq = 0, zero = vec2.zero();
	for (var i = 0; i < this.points.length; ++i) {
		var p = this.points[i], d = vec2.distancesq(zero, p);
		if (d > maxSq) maxSq = d;
	}

	this.boundOffset = vec2.zero();
	this.boundRadiusSq = maxSq;
	this.boundRadius = Math.sqrt(maxSq);
}

Polygon.prototype.type = types.BODY_POLYGON;

function LineSegment(size) {
	this.size = vec2.clone(size);

	this.boundOffset = vec2.zero();
	vec2.midpoint(this.size, this.boundOffset);

	this.boundRadiusSq = this.boundOffset.magnitudesq();
	this.boundRadius = Math.sqrt(this.boundRadiusSq);
}

LineSegment.prototype.type = types.BODY_LINE_SEGMENT;

function Line(slope) {
	this.slope = vec2.clone(slope);
}

Line.prototype.type = types.BODY_LINE;

function HAxis() {}
HAxis.prototype.type = types.BODY_H_AXIS;

function VAxis() {}
VAxis.prototype.type = types.BODY_V_AXIS;[]
},{"fd-vec2":"/Users/jason/work/games/waw/node_modules/fd-vec2/index.js"}],"/Users/jason/work/games/waw/node_modules/fd-keyboard/index.js":[function(require,module,exports){
module.exports = function(el, keymap) {

	var pressed 	= {},
		down 		= {},
		released	= {};

	for (var keycode in keymap) {
		var action = keymap[keycode];
		pressed[action] = down[action] = released[action] = false;
	}

	el.addEventListener('keydown', function(evt) {
		var action;
		if (evt.repeat || !(action = keymap[evt.which])) return;
	    evt.stopPropagation();
	    evt.preventDefault();
	    down[action] = true;
	    pressed[action] = true;
	});

	el.addEventListener('keyup', function(evt) {
	    var action;
	    if (evt.repeat || !(action = keymap[evt.which])) return;
	    evt.stopPropagation();
	    evt.preventDefault();
	    down[action] = false;
	    released[action] = true;
	});

	function reset() {
		for (var k in pressed) {
			pressed[k] = released[k] = false;
		}
	}

	return {
		pressed		: pressed,
		down 		: down,
		released 	: released,
		reset 		: reset
	};

}
},{}],"/Users/jason/work/games/waw/node_modules/fd-vec2/Vec2.js":[function(require,module,exports){
module.exports = Vec2;

var sqrt	= Math.sqrt,
	cos 	= Math.cos,
	sin 	= Math.sin,
	atan2	= Math.atan2;

function Vec2(x, y) {
	this.x = x;
	this.y = y;
}

//
//

Vec2.prototype.eq = function(rhs) {
	return this.x === rhs.x && this.y === rhs.y;
}

//
// Return new vectors

Vec2.prototype.clone = function() {
	return new Vec2(this.x, this.y);
}

Vec2.prototype.add = function(rhs) {
	return new Vec2(this.x + rhs.x, this.y + rhs.y);
}

Vec2.prototype.sub = function(rhs) {
	return new Vec2(this.x - rhs.x, this.y - rhs.y);
}

Vec2.prototype.mul = function(rhs) {
	return new Vec2(this.x * rhs, this.y * rhs);
}

Vec2.prototype.div = function(rhs) {
	return new Vec2(this.x / rhs, this.y / rhs);
}

Vec2.prototype.normalize = function() {
	var mag = this.magnitude();
	return new Vec2(this.x / mag, this.y / mag);
}

Vec2.prototype.midpoint = function() {
	return new Vec2(this.x/2, this.y/2);
}

Vec2.prototype.adjust = function(rhs, amount) {
	return new Vec2(
		this.x + rhs.x * amount,
		this.y + rhs.y * amount
	);
}

//
// Modify in place

Vec2.prototype.add_ = function(rhs) {
	this.x += rhs.x;
	this.y += rhs.y;
}

Vec2.prototype.sub_ = function(rhs) {
	this.x -= rhs.x;
	this.y -= rhs.y;
}

Vec2.prototype.mul_ = function(rhs) {
	this.x *= rhs;
	this.y *= rhs;
}

Vec2.prototype.div_ = function(rhs) {
	this.x /= rhs;
	this.y /= rhs;
}

Vec2.prototype.normalize_ = function() {
	var mag = this.magnitude();
	this.x /= mag;
	this.y /= mag;
}

Vec2.prototype.midpoint_ = function() {
	this.x /= 2;
	this.y /= 2;
}

Vec2.prototype.adjust_ = function(rhs, amount) {
	this.x += rhs.x * amount;
	this.y += rhs.y * amount;
}

//
// Scalar

Vec2.prototype.distance = function(rhs) {
	var dx = this.x - rhs.x,
		dy = this.y - rhs.y;
	return sqrt(dx*dx + dy*dy);
}

Vec2.prototype.distancesq = function(rhs) {
	var dx = this.x - rhs.x,
		dy = this.y - rhs.y;
	return dx*dx + dy*dy;
}

Vec2.prototype.magnitude = function() {
	return sqrt(this.x*this.x + this.y*this.y);
}

Vec2.prototype.magnitudesq = function() {
	return this.x*this.x + this.y*this.y;
}

Vec2.prototype.dot = function(rhs) {
	return this.x*rhs.x + this.y*rhs.y;
}

Vec2.prototype.angle = function(rhs) {
	return atan2(rhs.y - this.y, rhs.x - this.x);
}
},{}],"/Users/jason/work/games/waw/node_modules/fd-vec2/index.js":[function(require,module,exports){
var Vec2 = require('./Vec2');

var sqrt    = Math.sqrt,
    cos     = Math.cos,
    sin     = Math.sin;

module.exports = exports = function(x, y) {
    return new Vec2(x, y);
};

exports.Vec2 = Vec2;

exports.zero = function() {
    return new Vec2(0, 0);
}

exports.eq = function(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y;
}

exports.clone = function(v) {
    return new Vec2(v.x, v.y);
}

exports.add = function(v1, v2, out) {
    out.x = v1.x + v2.x;
    out.y = v1.y + v2.y;
}

exports.sub = function(v1, v2, out) {
    out.x = v1.x - v2.x;
    out.y = v1.y - v2.y;
}

exports.mul = function(v, s, out) {
    out.x = v.x * s;
    out.y = v.y * s;
}

exports.div = function(v, s, out) {
    out.x = v.x / s;
    out.y = v.y / s;
}

exports.normalize = function(v, out) {
    var mag = sqrt(v.x * v.x + v.y * v.y);
    out.x = v.x / mag;
    out.y = v.y / mag;
}

// exports.transform = function(vec, pos, rotation, out) {
//     var nx = pos.x + (Math.cos(rotation) * vec.x - Math.sin(rotation) * vec.y);
//     out.y = pos.y + (Math.sin(rotation) * vec.x - Math.sin(rotation) * vec.y);
//     out.x = nx;
// }

exports.distance = function(v1, v2) {
    var dx = v1.x - v2.x, dy = v1.y - v2.y;
    return Math.sqrt(dx*dx + dy*dy);
}

exports.distancesq = function(v1, v2) {
    var dx = v1.x - v2.x, dy = v1.y - v2.y;
    return dx*dx + dy*dy;
}

exports.magnitude = function(v) {
    return sqrt(v.x*v.x + v.y*v.y);
}

exports.magnitudesq = function(v) {
    return v.x*v.x + v.y*v.y;
}

exports.midpoint = function(v, out) {
    out.x = v.x / 2;
    out.y = v.y / 2;
}

exports.adjust = function(v, delta, amount, out) {
    out.x = v.x + delta.x * amount;
    out.y = v.y + delta.y * amount;
}

exports.dot = function(v1, v2) {
    return v1.x*v2.x + v1.y*v2.y;
}

exports.angle = function(v1, v2) {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
}

},{"./Vec2":"/Users/jason/work/games/waw/node_modules/fd-vec2/Vec2.js"}]},{},["/Users/jason/work/games/waw/exp/geo-renderer/main.js"]);

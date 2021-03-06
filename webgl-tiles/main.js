var glMatrix = require('gl-matrix');
for (var k in glMatrix) {
	if (k === 'glMatrix') continue;
	window[k] = glMatrix[k];
}

var canvas, gl, mvMatrix = mat4.create(), perspectiveMatrix, shaderProgram, tiles;

window.init = function() {

    var imgTiles = document.querySelector('img');

    canvas = document.querySelector('#canvas');
    gl = canvas.getContext('webgl');

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    var vertexShader = getShader(gl, '#shader-vs');
    var fragmentShader = getShader(gl, '#shader-fs');

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
      
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("unable to link shader program");
    }
      
    gl.useProgram(shaderProgram);

    //
    // make one tile

    var vpa = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vpa);

    var squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

    var vertices = [
        32,  32,  0.0,
        0, 32,  0.0,
        32,  0, 0.0,
        0, 0, 0.0
    ];
      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    //
    // get a texture

    tiles = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tiles);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgTiles);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    //
    // render stuff

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
    perspectiveMatrix = makeOrtho(0, 800, 600, 0, -10, 10);

    function drawTile(x, y) {
        loadIdentity();
        mvTranslate([x, y, -6]);
        setMatrixUniforms(gl);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vpa, 3, gl.FLOAT, false, 0, 0);
    
    drawTile(10, 10);
    drawTile(100, 100);
    drawTile(200, 200);

}

function getShader(gl, selector) {

    var el = document.querySelector(selector);

    if (el.type == "x-shader/x-fragment") {
        var shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (el.type == "x-shader/x-vertex") {
        var shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
       throw "meh";
    }

    gl.shaderSource(shader, el.textContent);
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
        throw new Error("shader compile error: " + gl.getShaderInfoLog(shader));
    }

    return shader;

}

function makePerspective() {

}

function makeOrtho(left, right, bottom, top, znear, zfar) {

    var tx = -(right+left)/(right-left);
    var ty = -(top+bottom)/(top-bottom);
    var tz = -(zfar+znear)/(zfar-znear);

    return mat4.clone([
        2/(right-left), 0, 0, 0,
        0, 2/(top-bottom), 0, 0,
        0, 0, -2/(zfar-znear), 0,
        tx, ty, tz, 1
    ]);

}

function mvTranslate(vec) {
    mat4.translate(mvMatrix, mvMatrix, vec);
}

function setMatrixUniforms(gl) {

    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, perspectiveMatrix);

    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, mvMatrix);
}

function loadIdentity() {
    mat4.identity(mvMatrix);
}
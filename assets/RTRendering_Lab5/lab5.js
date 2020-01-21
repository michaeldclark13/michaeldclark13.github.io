///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 5
//     Michael Clark (clark.2816)
//     Assigned: Thursday November 14, 2019
//     Due: Monday December 2, 2019
//     Lab overview: In this lab, you will enhance  your scene with  texture 
//                   mapping, environment cube mapping, and put everything together.
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc)
var shaderProgram;  // the shader program
var display_mode=3;

var vMatrix = mat4.create();   // view matrix
var mMatrix = mat4.create();   // model matrix
var pMatrix = mat4.create();   // projection matrix
var v2wMatrix = mat4.create();
var X_angle = 0.0;
var Y_angle = 0.0;


var cameraPosition = [0,0,30];
var cameraCenterOfInterest = [0,0,0];
var cameraUpVector = [0, 1, 0];


//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");

        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    var canvas = document.getElementById("lab5-canvas");
    

    initGL(canvas);
    initShaders();

    gl.enable(gl.DEPTH_TEST); 
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    
    shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);

    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "ModelMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "ViewMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "ProjectionMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, 'NormalMatrix');
    shaderProgram.v2wMatrixUniform = gl.getUniformLocation(shaderProgram, "ViewToWorldMatrix");		

    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "Ka");	
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "Kd");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "Ks");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
    shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "Ia");	
    shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "Id");
    shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "Is");

    shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
  	shaderProgram.cube_map_textureUniform = gl.getUniformLocation(shaderProgram, "cubeMap");	
    shaderProgram.display_modeUniform = gl.getUniformLocation(shaderProgram, "display_mode");

    initTextures();

    InitializeBuffers();

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    document.addEventListener('mousedown', onDocumentMouseDown, false); 
    document.addEventListener('keydown', onKeyDown, false);
}

var then = 0;

// Draw the scene repeatedly
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;


  drawScene(deltaTime);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

///////////////////////////////////////////////////////////
///////               Create VBO          /////////////////
function InitializeBuffers() {
    InitializePlaneBuffers();
    InitializeSphereBuffers(); 
    InitializeShapeBuffers(); 
    InitializeTorusBuffers();
}


function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function setMatrixUniforms(model, nMatrix) 
{
  gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, model);
  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);
  gl.uniformMatrix4fv(shaderProgram.v2wMatrixUniform, false, v2wMatrix);

}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var sunMatrix = mat4.create();
mat4.identity(sunMatrix);

var lightMatrix = mat4.create();
mat4.identity(lightMatrix);

var planetMatrix = mat4.create();
mat4.identity(planetMatrix);

var ringMatrix = mat4.create();
mat4.identity(ringMatrix);

var time =0;
function drawScene(deltaTime) {

    time +=deltaTime
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]); 	
    gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0); 
    gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0); 
    gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0); 


    var Mstack = []; 
   
    //VIEW, MODEL, PROJECTION SETUP

    mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 

    mat4.lookAt(cameraPosition, cameraCenterOfInterest, cameraUpVector, vMatrix);	// set up the view matrix
    var model = mat4.create(); 
    mat4.identity(model);
    model = mat4.rotate(model, degToRad(X_angle), [1, 0, 0]);   // now set up the model matrix
    model = mat4.rotate(model, degToRad(Y_angle), [0, 1, 0]);   // now set up the model matrix


    var nMatrix = mat4.create();
    mat4.identity(nMatrix); 
    nMatrix = mat4.multiply(nMatrix, vMatrix);

    mat4.identity(v2wMatrix);
    v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
    v2wMatrix = mat4.inverse(v2wMatrix);
    v2wMatrx = mat4.transpose(v2wMatrix);
   
    mat4.identity(sunMatrix);
    sunMatrix = mat4.scale(sunMatrix, [4, 4, 4]);
    PushMatrix(Mstack, model)
    model = mat4.multiply(model, sunMatrix); 
    setNormalMatrix(model, vMatrix);
    drawSphere(model, nMatrix, sun_ambient, sun_diffuse, sun_specular, sun_shine, sunTexture);

    model = PopMatrix(Mstack);
    PushMatrix(Mstack,model);
    setNormalMatrix(model, vMatrix);
    drawPlanes(model, nMatrix);


    model = PopMatrix(Mstack);
    PushMatrix(Mstack, model);
    mat4.identity(lightMatrix);
    lightMatrix = mat4.translate(lightMatrix, light_pos);  	
    model = mat4.multiply(model, lightMatrix);
    setNormalMatrix(model, vMatrix);
    drawSphere(model, nMatrix, planet_ambient, planet_diffuse, planet_specular, planet_shine, iceTexture);


    model = PopMatrix(Mstack);
    PushMatrix(Mstack, model);
    mat4.identity(planetMatrix);
    //planetMatrix = mat4.rotate(planetMatrix, degToRad(-4*time), [0,1,0]);
    planetMatrix = mat4.translate(planetMatrix, [7, 0, 0]);  	
    planetMatrix = mat4.scale(planetMatrix, [0.8, 0.8, 0.8]);
    model = mat4.multiply(model, planetMatrix);
    setNormalMatrix(model, vMatrix);
    drawSphere(model, nMatrix, planet_ambient, planet_diffuse, planet_specular, planet_shine, iceTexture);


    model = PopMatrix(Mstack);
    PushMatrix(Mstack, model);
    mat4.identity(ringMatrix);
    //ringMatrix = mat4.rotate(ringMatrix, degToRad(7*time), [0,1,1]);
    ringMatrix = mat4.scale(ringMatrix, [3, 2, 0.8]);
    model = mat4.multiply(model, ringMatrix);
    setNormalMatrix(model, vMatrix);
    drawShape(model, nMatrix);

    model = PopMatrix(Mstack);
    PushMatrix(Mstack, model);
    mat4.identity(ringMatrix);
    //ringMatrix = mat4.rotate(ringMatrix, degToRad(7*time), [1,1,0]);
    ringMatrix = mat4.scale(ringMatrix, [3, 3, 3]);
    model = mat4.multiply(model, ringMatrix);
    setNormalMatrix(model, vMatrix);
    drawTorus(model, nMatrix);
}

function PushMatrix(stack, matrix) {
  var copy = mat4.create();
  mat4.set(matrix, copy);
  stack.push(copy);
}

function PopMatrix(stack) {
  if (stack.length == 0) {
      throw "Invalid popMatrix!";
  }
  var copy = stack.pop();
  return copy; 
}

function reset()
{
  Y_angle=0;

  requestAnimationFrame(render);
}



function setNormalMatrix(model, vMatrix)
{
    var modelView = mat4.create(); 
    mat4.identity(modelView);
    modelView = mat4.multiply(modelView, model);
    modelView = mat4.multiply(modelView, vMatrix);

    nMatrix = mat4.transpose(mat4.inverse(modelView));
}

///////////////////////////////////////////////////////////////

var lastMouseX = 0, lastMouseY = 0;

///////////////////////////////////////////////////////////////

function onDocumentMouseDown( event ) {
  event.preventDefault();
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'mouseout', onDocumentMouseOut, false );
  var mouseX = event.clientX;
  var mouseY = event.clientY;

  lastMouseX = mouseX;
  lastMouseY = mouseY; 

}

function onDocumentMouseMove( event ) {
  var mouseX = event.clientX;
  var mouseY = event.clientY; 

  var diffX = mouseX - lastMouseX;
  var diffY = mouseY - lastMouseY;

  Y_angle = Y_angle + diffX/4;
  X_angle = X_angle + diffY/4;

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  requestAnimationFrame(render);
}

function onDocumentMouseUp( event ) {
  document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
  document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
  document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {
  document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
  document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
  document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onKeyDown(event) 
{
  switch(event.keyCode)  {
    case 39: //Right 
      light_pos[0]++;
      break;
    case 37: //Left 
      light_pos[0]--;
      break;
    case 38: //Up 
      light_pos[1]++;
      break;
    case 40: //Down 
      light_pos[1]--;
      break;
    case 70: //F 
      light_pos[2]++;
      break;
    case 66: //B
      light_pos[2]--;
      break;
  }
}
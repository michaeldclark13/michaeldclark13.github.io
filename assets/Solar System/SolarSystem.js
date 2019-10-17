///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 3
//     Michael Clark (clark.2816)
//     Assigned: October 3, 2019
//     Due: October 17, 2019 11:59 PM
//     Lab overview:  Create a 3D multi-component object 
//                    with at least three levels of hierarchy 
//                    with hierarchically and independently 
//                    transformable components; Set up OpenGL camera.
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc)
var shaderProgram;  // the shader program

//SPHERE BUFFERS
var sphereVertexBuffer;
var sphereIndexBuffer;
var sunColorBuffer;
var mercuryColorBuffer;
var venusColorBuffer;
var earthColorBuffer;
var moonColorBuffer;
var marsColorBuffer;




var vMatrix = mat4.create();   // view matrix
var mMatrix = mat4.create();   // model matrix
var pMatrix = mat4.create();   // projection matrix
var Z_angle = 0.0;
var axis = [0,0,1];


var mMatrix1 = mat4.create();
mat4.identity(mMatrix1);	
var mMatrix2 = mat4.create();
mat4.identity(mMatrix2);	
var mMatrix3 = mat4.create();
mat4.identity(mMatrix3);	


var cameraPosition = [0,0,-20];
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
    var canvas = document.getElementById("SolarSystem-canvas");
    initGL(canvas);
    initShaders();


    gl.enable(gl.DEPTH_TEST); 
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "ModelMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "ViewMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "ProjectionMatrix");


    InitializeBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    mMatrix1 = mat4.translate(mMatrix1, [1, 1, 0]);		  		      
		mMatrix2 = mat4.translate(mMatrix2, [-1, -1, 0]);		  		      		      
		mMatrix3 = mat4.translate(mMatrix3, [-1, 1, 0]);  

    document.addEventListener('mousedown', onDocumentMouseDown, false); 
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
    InitializeSphereBuffers();  
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SPHERE

    var sphereRadius=0.7;
    
    var numSlices = 50;
    var numStacks = 50;
    function InitializeSphereBuffers()
    {
      InitializeSphere(sphereRadius, numSlices, numStacks);

      sphereVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
      sphereVertexBuffer.itemSize = 3;  // NDC'S [x,y,0]
      sphereVertexBuffer.numItems = numSlices*numStacks;
      
      sunColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sunColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunColors), gl.STATIC_DRAW);
      sunColorBuffer.itemSize = 4;
      sunColorBuffer.numItems = numSlices * numStacks;
      
      mercuryColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mercuryColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mercuryColors), gl.STATIC_DRAW);
      mercuryColorBuffer.itemSize = 4;
      mercuryColorBuffer.numItems = numSlices * numStacks;

      venusColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, venusColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(venusColors), gl.STATIC_DRAW);
      venusColorBuffer.itemSize = 4;
      venusColorBuffer.numItems = numSlices * numStacks;

      earthColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, earthColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(earthColors), gl.STATIC_DRAW);
      earthColorBuffer.itemSize = 4;
      earthColorBuffer.numItems = numSlices * numStacks;

      moonColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, moonColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(moonColors), gl.STATIC_DRAW);
      moonColorBuffer.itemSize = 4;
      moonColorBuffer.numItems = numSlices * numStacks;

      marsColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, marsColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(marsColors), gl.STATIC_DRAW);
      marsColorBuffer.itemSize = 4;
      marsColorBuffer.numItems = numSlices * numStacks;

      sphereIndexBuffer = gl.createBuffer();	
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer); 
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);  
      sphereIndexBuffer.itemSize = 3;
      sphereIndexBuffer.numItems = numSlices*numStacks;
    }

    var sphereVertices = [];
    var sphereIndices = []
    var sunColors = [];
    var mercuryColors = [];
    var venusColors = [];
    var earthColors = [];
    var moonColors = [];
    var marsColors = [];

    function InitializeSphere(radius, numSlices, numStacks)
    {
      var lat;
      var lon;
      for (i=0; i<numStacks; i++)
      {
        lat = map_range(i, 0, numStacks, -Math.PI, Math.PI);
        for (j=0; j<numSlices; j++)
        {
          lon = map_range(j, 0, numSlices, -Math.PI, Math.PI);
          sphereVertices.push(radius * Math.sin(lon) * Math.cos(lat));
          sphereVertices.push(radius * Math.sin(lon) * Math.sin(lat));
          sphereVertices.push(radius * Math.cos(lon));

          if(j%5==0)
          {
            sunColors.push(1.0);
            sunColors.push(1.0);
            sunColors.push(1.0);
            sunColors.push(1.0);
  
            mercuryColors.push(1.0);
            mercuryColors.push(1.0);
            mercuryColors.push(1.0);
            mercuryColors.push(1.0);
  
            venusColors.push(1.0);
            venusColors.push(1.0);
            venusColors.push(1.0);
            venusColors.push(1.0);
  
            earthColors.push(1.0);
            earthColors.push(1.0);
            earthColors.push(1.0);
            earthColors.push(1.0);
  
            moonColors.push(1.0);
            moonColors.push(1.0);
            moonColors.push(1.0);
            moonColors.push(1.0);

            marsColors.push(1.0);
            marsColors.push(1.0);
            marsColors.push(1.0);
            marsColors.push(1.0);
          }
          else 
          {
            sunColors.push(1.0);
            sunColors.push(0.0);
            sunColors.push(0.0);
            sunColors.push(1.0);
  
            mercuryColors.push(0.0);
            mercuryColors.push(1.0);
            mercuryColors.push(0.0);
            mercuryColors.push(1.0);
  
            venusColors.push(0.0);
            venusColors.push(1.0);
            venusColors.push(1.0);
            venusColors.push(1.0);
  
            earthColors.push(0.0);
            earthColors.push(0.0);
            earthColors.push(1.0);
            earthColors.push(1.0);
  
            moonColors.push(1.0);
            moonColors.push(0.0);
            moonColors.push(0.0);
            moonColors.push(1.0);

            marsColors.push(1.0);
            marsColors.push(0.0);
            marsColors.push(0.0);
            marsColors.push(1.0);
          }
          

          sphereIndices.push(((i+1)*numStacks)+j);
          sphereIndices.push((i*numStacks)+j+1);    
        }
      }
    }

    function map_range(value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function setMatrixUniforms(model) {
  

  gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, model);
  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var sunMatrix = mat4.create();
mat4.identity(sunMatrix);

var mercuryMatrix = mat4.create();
mat4.identity(mercuryMatrix);

var venusMatrix = mat4.create();
mat4.identity(venusMatrix);

var earthMatrix = mat4.create();
mat4.identity(earthMatrix);

var moonMatrix = mat4.create();
mat4.identity(moonMatrix);

var marsMatrix = mat4.create();
mat4.identity(marsMatrix);

var time =0;
function drawScene(deltaTime) {

    time +=deltaTime
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var Mstack = []; 
   
    //VIEW, MODEL, PROJECTION SETUP

    mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 

    mat4.lookAt(cameraPosition, cameraCenterOfInterest, cameraUpVector, vMatrix);	// set up the view matrix
    var model = mat4.create(); 
    mat4.identity(model);

    model = mat4.rotate(model, degToRad(Z_angle), [1, 0, 0]);   // now set up the model matrix
   
    mat4.identity(sunMatrix);
    sunMatrix = mat4.rotate(sunMatrix, degToRad(1*time), [0,0,1]);
    sunMatrix = mat4.scale(sunMatrix, [2, 2, 2]);
    PushMatrix(Mstack, model)
    model = mat4.multiply(model, sunMatrix); 
    drawSphere(model, sunColorBuffer);

    model = PopMatrix(Mstack);
    PushMatrix(Mstack, model);
    mat4.identity(mercuryMatrix);
    mercuryMatrix = mat4.rotate(mercuryMatrix, degToRad(59*time), [0,1,0]);
    mercuryMatrix = mat4.translate(mercuryMatrix, [2, 0, 0]);  	
    mercuryMatrix = mat4.scale(mercuryMatrix, [0.25, 0.25, 0.25]);
    model = mat4.multiply(model, mercuryMatrix);
    drawSphere(model, mercuryColorBuffer);

    model = PopMatrix(Mstack);
    PushMatrix(Mstack, model);
    mat4.identity(venusMatrix);
    venusMatrix = mat4.rotate(venusMatrix, degToRad(43.50*time), [0,1,0]);
    venusMatrix = mat4.translate(venusMatrix, [3, 0, 0]);  	
    venusMatrix = mat4.scale(venusMatrix, [0.5, 0.5, 0.5]);
    model = mat4.multiply(model, venusMatrix);
    drawSphere(model, venusColorBuffer);

    model = PopMatrix(Mstack);
    PushMatrix(Mstack, model);
    mat4.identity(earthMatrix);
    earthMatrix = mat4.rotate(earthMatrix, degToRad(38*time), [0,1,0]);
    earthMatrix = mat4.translate(earthMatrix, [5, 0, 0]);  	
    earthMatrix = mat4.scale(earthMatrix, [0.65, 0.65, 0.65]);
    model = mat4.multiply(model, earthMatrix);
    drawSphere(model, earthColorBuffer);

    mat4.identity(moonMatrix);
    moonMatrix = mat4.rotate(moonMatrix, degToRad(300*time), [0,1,0]);
    moonMatrix = mat4.translate(moonMatrix, [1, 0, 0]);  	
    moonMatrix = mat4.scale(moonMatrix, [0.20, 0.20, 0.20]);
    model = mat4.multiply(model, moonMatrix);
    drawSphere(model, moonColorBuffer);

    model = PopMatrix(Mstack);
    PushMatrix(Mstack, model);
    mat4.identity(marsMatrix);
    marsMatrix = mat4.rotate(marsMatrix, degToRad(43.50*time), [0,1,0]);
    marsMatrix = mat4.translate(marsMatrix, [7, 0, 0]);  	
    marsMatrix = mat4.scale(marsMatrix, [0.6, 0.6, 0.6]);
    model = mat4.multiply(model, marsMatrix);
    drawSphere(model, marsColorBuffer);


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

function drawSphere(model, colorBuffer)
{
  setMatrixUniforms(model);   // pass the modelview mattrix and projection matrix to the shader 

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);


  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // draw elementary arrays - triangle indices 
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer); 

  gl.drawElements(gl.TRIANGLE_STRIP, sphereIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
}

function reset()
{
  Z_angle=0;
  mat4.identity(mMatrix1);
  mat4.identity(mMatrix2);
  mat4.identity(mMatrix3);

  mMatrix1 = mat4.translate(mMatrix1, [1, 1, 0]);		  		      
	mMatrix2 = mat4.translate(mMatrix2, [-1, -1, 0]);		  		      		      
	mMatrix3 = mat4.translate(mMatrix3, [-1, 1, 0]);  

  requestAnimationFrame(render);
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
  var mouseY = event.ClientY; 

  var diffX = mouseX - lastMouseX;

  Z_angle = Z_angle + diffX/5;

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
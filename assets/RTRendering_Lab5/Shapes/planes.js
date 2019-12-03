//PLANE BUFFERS
var sqTexCoords;

var squareVertexTexCoordsBuffer;
var squareVertexIndexBuffer;

var frontVertexBuffer;
var frontNormalBuffer;

var backVertexBuffer;
var backNormalBuffer;

var topVertexBuffer;
var topNormalBuffer;

var bottomVertexBuffer;
var bottomNormalBuffer;

var rightVertexBuffer;
var rightNormalBuffer;

var leftVertexBuffer;
var leftNormalBuffer;

function InitializePlaneBuffers()
{
  // *************** TEXTURE COORDINATES BUFFER ********************
  squareVertexTexCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTexCoordsBuffer);
  var sqTexCoords = [0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0]; 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqTexCoords), gl.STATIC_DRAW);
  squareVertexTexCoordsBuffer.itemSize = 2;
  squareVertexTexCoordsBuffer.numItems = 4; 

  // *************** INDEX BUFFER ********************
  squareVertexIndexBuffer = gl.createBuffer();	
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer); 
  var sqindices = [0,1,2, 0,2,3]; 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sqindices), gl.STATIC_DRAW);  
  squareVertexIndexBuffer.itemsize = 1;
  squareVertexIndexBuffer.numItems = 6;  



  // **************   FRONT *************************************
  frontVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, frontVertexBuffer);
  var frontVertices = [
    -1, 1,  1, 
    1,  1,  1,
    1,  -1, 1,
    -1, -1,  1
  ];
  scalePlanes(frontVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(frontVertices), gl.STATIC_DRAW);
  frontVertexBuffer.itemSize = 3;  // NDC'S [x,y,z]
  frontVertexBuffer.numItems = 4; // 4 vertices

  frontNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, frontNormalBuffer);
  var frontNormals = [
     0.0,  0.0,  -1.0,
     0.0,  0.0,  -1.0,
     0.0,  0.0,  -1.0,
     0.0,  0.0,  -1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(frontNormals), gl.STATIC_DRAW);
  frontNormalBuffer.itemSize = 3;  // NDC'S [x,y,z]
  frontNormalBuffer.numItems = 4;// 4 vertices



  // ************** BACK *************************************
  backVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, backVertexBuffer);
  var backVertices = [
    1,  1,  -1,
    -1, 1,  -1, 
    -1, -1,  -1,
    1,  -1, -1
  ];
  scalePlanes(backVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(backVertices), gl.STATIC_DRAW);
  backVertexBuffer.itemSize = 3;  // NDC'S [x,y,z]
  backVertexBuffer.numItems = 4; // 4 vertices

  backNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, backNormalBuffer);
  var backNormals = [
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(backNormals), gl.STATIC_DRAW);
  backNormalBuffer.itemSize = 3;  // NDC'S [x,y,z]
  backNormalBuffer.numItems = 4;// 4 vertices



    // **************   TOP *************************************
    topVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, topVertexBuffer);
    var topVertices = [
      1,  1,  1,
      -1,  1, 1,
      -1,  1,  -1, 
       1,  1,  -1,
    ];
    scalePlanes(topVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(topVertices), gl.STATIC_DRAW);
    topVertexBuffer.itemSize = 3;  // NDC'S [x,y,z]
    topVertexBuffer.numItems = 4; // 4 verbottom
  
    topNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, topNormalBuffer);
    var topNormals = [
       0.0,  1.0,  0.0,
       0.0,  -1.0,  0.0,
       0.0,  -1.0,  0.0,
       0.0,  -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(topNormals), gl.STATIC_DRAW);
    topNormalBuffer.itemSize = 3;  // NDC'S [x,y,z]
    topNormalBuffer.numItems = 4;// 4 vertices
  

  // **************   BOTTOM *************************************
  bottomVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bottomVertexBuffer);
  var bottomVertices = [
    1, -1, -1,
    -1, -1, -1,
    -1, -1, 1,
    1, -1,  1
  ];
  scalePlanes(bottomVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bottomVertices), gl.STATIC_DRAW);
  bottomVertexBuffer.itemSize = 3;  // NDC'S [x,y,z]
  bottomVertexBuffer.numItems = 4; // 4 verbottom

  bottomNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bottomNormalBuffer);
  var bottomNormals = [
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bottomNormals), gl.STATIC_DRAW);
  bottomNormalBuffer.itemSize = 3;  // NDC'S [x,y,z]
  bottomNormalBuffer.numItems = 4;// 4 vertices

  // **************   RIGHT *************************************
  rightVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rightVertexBuffer);
  var rightVertices = [
    
    -1,  1,  -1,
    -1,  1,  1,
    -1,  -1, 1,
    -1,  -1,  -1 
     
  ];
  scalePlanes(rightVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rightVertices), gl.STATIC_DRAW);
  rightVertexBuffer.itemSize = 3;  // NDC'S [x,y,z]
  rightVertexBuffer.numItems = 4; // 4 verbottom

  rightNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rightNormalBuffer);
  var rightNormals = [
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rightNormals), gl.STATIC_DRAW);
  rightNormalBuffer.itemSize = 3;  // NDC'S [x,y,z]
  rightNormalBuffer.numItems = 4;// 4 vertices


  // **************   LEFT *************************************
  leftVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, leftVertexBuffer);
  var leftVertices = [
    1,  1,  1, 

    1,  1,   -1,

    1,  -1,  -1,
    1,  -1,  1
  ];
  scalePlanes(leftVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(leftVertices), gl.STATIC_DRAW);
  leftVertexBuffer.itemSize = 3;  // NDC'S [x,y,z]
  leftVertexBuffer.numItems = 4; // 4 verbottom

  leftNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, leftNormalBuffer);
  var leftNormals = [
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(leftNormals), gl.STATIC_DRAW);
  leftNormalBuffer.itemSize = 3;  // NDC'S [x,y,z]
  leftNormalBuffer.numItems = 4;// 4 vertices
}

var scaleFactor = 30;

function scalePlanes(vertices)
{

  for (i = 0; i < vertices.length; i++) 
  { 
    vertices[i] = vertices[i]*scaleFactor;
  }
}

var front_ambient = [1, 0, 0, 1];
var front_diffuse = [1, 0, 0, 1]; 
var front_specular = [.5, .7, .9,1]; 
var front_shine = 80.0;

var back_ambient = [0, 1, 0, 1];
var back_diffuse = [0, 1, 0, 1]; 
var back_specular = [.5, .7, .9,1]; 
var back_shine = 80.0;

var top_ambient = [0, 0, 1, 1];
var top_diffuse = [0, 0, 1, 1]; 
var top_specular = [.5, .7, .9,1]; 
var top_shine = 80.0;

var bottom_ambient = [0, 0.5, 0.5, 1];
var bottom_diffuse = [0, 1, 0, 1]; 
var bottom_specular = [.8, 0.3, .9,1]; 
var bottom_shine = 80.0;

var right_ambient = [0.5, 0.5, 0, 1];
var right_diffuse = [0.5, 0.5, 0, 1]; 
var right_specular = [.8, 0.3, .9,1]; 
var right_shine = 80.0;

var left_ambient = [0.5, 0, 0.5, 1];
var left_diffuse = [0.5, 0, 0.5, 1]; 
var left_specular = [.8, 0.3, .9,1]; 
var left_shine = 80.0;


function drawPlanes(model, nMatrix) 
{
  if(display_mode !=0)
  {
    setMatrixUniforms(model, nMatrix);

    drawSinglePlane(front_ambient, front_diffuse, front_specular, front_shine, frontTexture, frontVertexBuffer, frontNormalBuffer);  
    drawSinglePlane(back_ambient, back_diffuse, back_specular, back_shine, backTexture, backVertexBuffer, backNormalBuffer);
    drawSinglePlane(top_ambient, top_diffuse, top_specular, top_shine, topTexture, topVertexBuffer, topNormalBuffer);
    drawSinglePlane(bottom_ambient, bottom_diffuse, bottom_specular, bottom_shine, bottomTexture, bottomVertexBuffer, bottomNormalBuffer);
    drawSinglePlane(right_ambient, right_diffuse, right_specular, right_shine, rightTexture, rightVertexBuffer, rightNormalBuffer);
    drawSinglePlane(left_ambient, left_diffuse, left_specular, left_shine, leftTexture, leftVertexBuffer, leftNormalBuffer);
  }
}

function drawSinglePlane(ambient, diffuse, specular, shine, texture, vertexBuffer, normalBuffer)
{
  gl.uniform4f(shaderProgram.ambient_coefUniform, ambient[0], ambient[1], ambient[2], 1.0); 
  gl.uniform4f(shaderProgram.diffuse_coefUniform, diffuse[0], diffuse[1], diffuse[2], 1.0); 
  gl.uniform4f(shaderProgram.specular_coefUniform, specular[0], specular[1], specular[2], 1.0); 
  gl.uniform1f(shaderProgram.shininess_coefUniform, shine);     

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTexCoordsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, squareVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);


  if(display_mode ==2 || display_mode == 3)
  {
      gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
      gl.bindTexture(gl.TEXTURE_2D, texture);    // bind the texture object to the texture unit 
      gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader    
      gl.uniform1i(shaderProgram.display_modeUniform, 2);     
  }
  else 
  {
    gl.uniform1i(shaderProgram.display_modeUniform, 0);     

  }
  gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);
}
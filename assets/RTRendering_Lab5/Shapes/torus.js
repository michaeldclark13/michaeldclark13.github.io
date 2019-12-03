// SPHERE BUFFERS
var torusVertexBuffer;
var torusIndexBuffer;
var torusNormalBuffer;
var torusTextureBuffer;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SPHERE

var torusNumSlices = 70;
var torusNumStacks = 70;

function InitializeTorusBuffers()
{
  
  InitializeTorus(torusNumSlices, torusNumStacks);

  torusVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, torusVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(torusVertices), gl.STATIC_DRAW);
  torusVertexBuffer.itemSize = 3;  // NDC'S [x,y,0]
  torusVertexBuffer.numItems = torusNumSlices*torusNumStacks;
  
  torusIndexBuffer = gl.createBuffer();	
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torusIndexBuffer); 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torusIndices), gl.STATIC_DRAW);  
  torusIndexBuffer.itemSize = 1;
  torusIndexBuffer.numItems = torusNumSlices*torusNumStacks;

  torusNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, torusNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(torusNormals),
  gl.STATIC_DRAW);
  torusNormalBuffer.itemSize = 3;
  torusNormalBuffer.numItems = torusNumSlices * torusNumStacks;

  torusTextureBuffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, torusTextureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(torusTextures),
	gl.STATIC_DRAW);
  torusTextureBuffer.itemSize=2;
  torusTextureBuffer.numItems=torusNumSlices * torusNumStacks;

}


var torusVertices = [];
var torusNormals = [];
var torusIndices = [];
var torusTextures = [];
var r0=2;
var r1=0.2;
function InitializeTorus(numSlices, numStacks)
{
  var lat;
  var lon;
  for (i=0; i<numStacks; i++)
  {
    lat = map_range(i, 0, numStacks, -2*Math.PI, 2*Math.PI);
    for (j=0; j<numSlices; j++)
    {

      lon = map_range(j, 0, numSlices, -2*Math.PI, 2*Math.PI);

      torusVertices.push((r0+r1*Math.cos(lon))*Math.cos(lat));
      torusVertices.push((r0+r1*Math.cos(lon))*Math.sin(lat));
      torusVertices.push(r1*Math.sin(lon));

      torusNormals.push(Math.cos(lon) * Math.cos(lat));
      torusNormals.push(Math.sin(lon) * Math.sin(lat));
      torusNormals.push(Math.cos(lon));

      torusTextures.push(i/numStacks);
      torusTextures.push(j/numSlices);

      torusIndices.push(((i+1)*numStacks)+j);
      torusIndices.push((i*numStacks)+j+1);

    }
  }

}




function drawTorus(model, nMatrix)
{

  setMatrixUniforms(model, nMatrix);   // pass the modelview mattrix and projection matrix to the shader 

  gl.uniform4f(shaderProgram.ambient_coefUniform, torus_ambient[0], torus_ambient[1], torus_ambient[2], 1.0); 
  gl.uniform4f(shaderProgram.diffuse_coefUniform, torus_diffuse[0], torus_diffuse[1], torus_diffuse[2], 1.0); 
  gl.uniform4f(shaderProgram.specular_coefUniform, torus_specular[0], torus_specular[1], torus_specular[2], 1.0); 
  gl.uniform1f(shaderProgram.shininess_coefUniform, torus_shine); 

  gl.bindBuffer(gl.ARRAY_BUFFER, torusVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, torusVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, torusNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, torusNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, torusTextureBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, torusTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);


  gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
	gl.bindTexture(gl.TEXTURE_2D, sunTexture);    // bind the texture object to the texture unit 
  gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader    
  
  // draw elementary arrays - triangle indices 
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torusIndexBuffer); 


  if(display_mode == 0)
    {
      gl.uniform1i(shaderProgram.display_modeUniform, display_mode);     

      gl.drawElements(gl.LINE_LOOP, torusIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
    }
    else if (display_mode == 3)
    {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
      gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);
      gl.drawElements(gl.TRIANGLE_STRIP, torusIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    else
    {
      gl.uniform1i(shaderProgram.display_modeUniform, 1);     

      gl.drawElements(gl.TRIANGLE_STRIP, torusIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
    }
}
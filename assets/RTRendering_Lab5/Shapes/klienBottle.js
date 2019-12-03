// SPHERE BUFFERS
var shapeVertexBuffer;
var shapeIndexBuffer;
var shapeNormalBuffer;
var shapeTextureBuffer;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SPHERE

var shapeNumSlices = 100;
var shapeNumStacks = 100;

function InitializeShapeBuffers()
{
  
  InitializeShape(shapeNumSlices, shapeNumStacks);

  shapeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shapeVertices), gl.STATIC_DRAW);
  shapeVertexBuffer.itemSize = 3;  // NDC'S [x,y,0]
  shapeVertexBuffer.numItems = shapeNumSlices*shapeNumStacks;
  
  shapeIndexBuffer = gl.createBuffer();	
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shapeIndexBuffer); 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shapeIndices), gl.STATIC_DRAW);  
  shapeIndexBuffer.itemSize = 3;
  shapeIndexBuffer.numItems = shapeNumSlices*shapeNumStacks;

  shapeNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shapeNormals),
  gl.STATIC_DRAW);
  shapeNormalBuffer.itemSize = 3;
  shapeNormalBuffer.numItems = shapeNumSlices * shapeNumStacks;

  shapeTextureBuffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeTextureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(shapeTextures),
  gl.STATIC_DRAW);
  shapeTextureBuffer.itemSize=2;
  shapeTextureBuffer.numItems=shapeNumSlices * shapeNumStacks;

}


var shapeVertices = [];
var shapeNormals = [];
var shapeIndices = [];
var shapeTextures = [];

function InitializeShape(numSlices, numStacks)
{
  var lat;
  var lon;
  for (i=0; i<numStacks; i++)
  {

    lat = map_range(i, 0, numStacks, -Math.PI, Math.PI);
    for (j=0; j<numSlices; j++)
    {

      lon = map_range(j, 0, numSlices, -Math.PI, Math.PI);

      shapeVertices.push((4+0.4*Math.sin(lat)*Math.cos(lon)-0.4*Math.sin(2*lat)*Math.sin(lon))*Math.cos(2*lon));      
      shapeVertices.push((4+0.4*Math.sin(lat)*Math.cos(lon)-0.4*Math.sin(2*lat)*Math.sin(lon))*Math.sin(2*lon));   
      shapeVertices.push(0.25 * Math.sin(lat)*Math.sin(lon)+Math.sin(2*lat)*Math.cos(lon));

      shapeNormals.push(Math.sin(lon) * Math.cos(lat));
      shapeNormals.push(Math.sin(lon) * Math.sin(lat));
      shapeNormals.push(Math.cos(lon));

      shapeTextures.push(100*i/numStacks);
      shapeTextures.push(100*j/numSlices);

      shapeIndices.push(((i+1)*numStacks)+j);
      shapeIndices.push((i*numStacks)+j+1);

    }
  }
}

function drawShape(model, nMatrix)
{

    setMatrixUniforms(model, nMatrix);   // pass the modelview mattrix and projection matrix to the shader 

    gl.uniform4f(shaderProgram.ambient_coefUniform, shape_ambient[0], shape_ambient[1], shape_ambient[2], 1.0); 
    gl.uniform4f(shaderProgram.diffuse_coefUniform, shape_diffuse[0], shape_diffuse[1], shape_diffuse[2], 1.0); 
    gl.uniform4f(shaderProgram.specular_coefUniform, shape_specular[0], shape_specular[1], shape_specular[2], 1.0); 
    gl.uniform1f(shaderProgram.shininess_coefUniform, shape_shine); 

    gl.bindBuffer(gl.ARRAY_BUFFER, shapeVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, shapeVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, shapeNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, shapeNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, shapeTextureBuffer);
	  gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, shapeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shapeIndexBuffer); 

    if(display_mode == 0)
    {
      gl.uniform1i(shaderProgram.display_modeUniform, display_mode);     
      gl.drawElements(gl.LINE_LOOP, shapeIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
    } 
    else if (display_mode == 3)
    {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
      gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);
      gl.drawElements(gl.TRIANGLE_STRIP, shapeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    else 
    {
      gl.uniform1i(shaderProgram.display_modeUniform, 1);     
      gl.drawElements(gl.TRIANGLE_STRIP, shapeIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
    }
}
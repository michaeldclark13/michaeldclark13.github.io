// SPHERE BUFFERS
var sphereVertexBuffer;
var sphereIndexBuffer;
var sphereNormalBuffer;
var sphereTextureBuffer; 


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SPHERE

var sphereRadius=1;
var sphereNumSlices = 30;
var sphereNumStacks = 30;

function InitializeSphereBuffers()
{
  
  InitializeSphere(sphereRadius, sphereNumSlices, sphereNumStacks);

  sphereVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
  sphereVertexBuffer.itemSize = 3;  // NDC'S [x,y,0]
  sphereVertexBuffer.numItems = sphereNumSlices*sphereNumStacks;
  
  sphereIndexBuffer = gl.createBuffer();	
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer); 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);  
  sphereIndexBuffer.itemSize = 3;
  sphereIndexBuffer.numItems = sphereNumSlices*sphereNumStacks;

  sphereNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormals),
  gl.STATIC_DRAW);
  sphereNormalBuffer.itemSize = 3;
  sphereNormalBuffer.numItems = sphereNumSlices * sphereNumStacks;

  sphereTextureBuffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(sphereTextures),
	gl.STATIC_DRAW);
  sphereTextureBuffer.itemSize=2;
  sphereTextureBuffer.numItems=sphereNumSlices * sphereNumStacks;
}


var sphereVertices = [];
var sphereNormals = [];
var sphereIndices = [];
var sphereTextures = [];
function InitializeSphere(radius, numSlices, numStacks)
{
  var theta;
  var phi;
  for (i=0; i<numStacks; i++)
  {

    theta = map_range(i, 0, numStacks, -Math.PI, Math.PI);
    for (j=0; j<numSlices; j++)
    {

      phi = map_range(j, 0, numSlices, -Math.PI, Math.PI);

      var Nx = Math.cos(phi) * Math.sin(theta);
      var Ny = Math.cos(theta);
      var Nz = Math.sin(phi) * Math.sin(theta);


      sphereVertices.push(radius * Nx);
      sphereVertices.push(radius * Ny);
      sphereVertices.push(radius * Nz);

      

      sphereNormals.push(Nx);
      sphereNormals.push(Ny);
      sphereNormals.push(Nz);

      sphereTextures.push(10*j/numSlices);
      sphereTextures.push(10*i/numStacks);

      sphereIndices.push(((i+1)*numStacks)+j);
      sphereIndices.push((i*numStacks)+j+1);



    }
  }
}




function drawSphere(model, nMatrix, sphere_ambient, sphere_diffuse, sphere_specular, sphere_shine, texture)
{

    setMatrixUniforms(model, nMatrix);   // pass the modelview mattrix and projection matrix to the shader 

    gl.uniform4f(shaderProgram.ambient_coefUniform, sphere_ambient[0], sphere_ambient[1], sphere_ambient[2], 1.0); 
    gl.uniform4f(shaderProgram.diffuse_coefUniform, sphere_diffuse[0], sphere_diffuse[1], sphere_diffuse[2], 1.0); 
    gl.uniform4f(shaderProgram.specular_coefUniform, sphere_specular[0], sphere_specular[1], sphere_specular[2], 1.0); 
    gl.uniform1f(shaderProgram.shininess_coefUniform, sphere_shine); 

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureBuffer);
	  gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, sphereTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniform1i(shaderProgram.display_modeUniform, display_mode);     
    
    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer); 


    if(display_mode == 0)
    {
      gl.drawElements(gl.LINE_LOOP, sphereIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
    }
    else if (display_mode == 1)
    {
      gl.drawElements(gl.TRIANGLE_STRIP, sphereIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
    }
    else if (display_mode == 2)
    {
      gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
      gl.bindTexture(gl.TEXTURE_2D, texture);    // bind the texture object to the texture unit 
      gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader    
      gl.drawElements(gl.TRIANGLE_STRIP, sphereIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
    }
    else
    {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
      gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);
      gl.drawElements(gl.TRIANGLE_STRIP, sphereIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
}
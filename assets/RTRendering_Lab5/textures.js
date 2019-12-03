var cubemapTexture, sunTexture, iceTexture, frontTexture, 
    backTexture, topTexture, bottomTexture, 
    rightTexture, leftTexture;

function initTextures() {

    sunTexture = gl.createTexture();
    sunTexture.image = new Image();
    sunTexture.image.src = "sun.png";
    sunTexture.image.onload = function() { handleTextureLoaded(sunTexture)}

    iceTexture = gl.createTexture();
    iceTexture.image = new Image();
    iceTexture.image.src = "ice.jpg";
    iceTexture.image.onload = function() { handleTextureLoaded(iceTexture)}

    frontTexture = gl.createTexture();
    frontTexture.image = new Image();
    frontTexture.image.src = "front.jpg";
    frontTexture.image.onload = function() { handleTextureLoaded(frontTexture)}

    backTexture = gl.createTexture();
    backTexture.image = new Image();
    backTexture.image.src = "back.jpg";
    backTexture.image.onload = function() { handleTextureLoaded(backTexture)}

    topTexture = gl.createTexture();
    topTexture.image = new Image();
    topTexture.image.src = "up.jpg";
    topTexture.image.onload = function() { handleTextureLoaded(topTexture)}

    bottomTexture = gl.createTexture();
    bottomTexture.image = new Image();
    bottomTexture.image.src = "down.jpg";
    bottomTexture.image.onload = function() { handleTextureLoaded(bottomTexture)}

    rightTexture = gl.createTexture();
    rightTexture.image = new Image();
    rightTexture.image.src = "right.jpg";
    rightTexture.image.onload = function() { handleTextureLoaded(rightTexture)}

    leftTexture = gl.createTexture();
    leftTexture.image = new Image();
    leftTexture.image.src = "left.jpg";
    leftTexture.image.onload = function() { handleTextureLoaded(leftTexture)}

    cubemapTexture = loadCubeMap();
}

function loadCubeMap() {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  var faces = [["right.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
               ["left.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
               ["up.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
               ["down.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
               ["back.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
               ["front.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
  for (var i = 0; i < faces.length; i++) {
      var face = faces[i][1];
      var image = new Image();
      image.onload = function(texture, face, image) {
          return function() {
              gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
              gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
              gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          }
      } (texture, face, image);
      image.src = faces[i][0];
  }
  return texture;
}

function handleTextureLoaded(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function setDisplayMode(num)
{
  // 0 = just wireframe for all objects
  // 1 = no textures
  // 2 = texture on spheres (sun and planet)
  // 3 = environment map on sun sphere
  display_mode = num;
}
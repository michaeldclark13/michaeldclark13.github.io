<!DOCTYPE html>
<html>

<!--
     This page is an example of reflection mapping, using a
     dynamic cubemap texture that is redrawn in each frame
     of an animation.  The animation shows colored cubes rotating
     around a perfectly reflective object.  The cubemap texture 
     applied as a reflection map to the object in the center of
     the scene.  There is also a skybox, which uses a separate,
     static cubemap texture.
-->


<head>
<meta charset="UTF-8">
<title>WebGL Dynamic Reflection Map</title>
<style>
    body {
        background-color: #DDDDDD;
    }
    label, button {
        margin-left: 30px;
    }
</style>


<!-- shader program for the skybox -->

<script type="x-shader/x-vertex" id="vshaderSB">
     uniform mat4 projection;
     uniform mat4 modelview;
     attribute vec3 a_coords;
     varying vec3 v_objCoords;
     void main() {
        vec4 eyeCoords = modelview * vec4(a_coords,1.0);
        gl_Position = projection * eyeCoords;
        v_objCoords = a_coords;
     }
</script>
<script type="x-shader/x-fragment" id="fshaderSB">
     precision mediump float;
     varying vec3 v_objCoords;
     uniform samplerCube skybox;
     void main() {
          gl_FragColor = textureCube(skybox, v_objCoords);
     }
</script>

<!-- shader program for the reflecting object -->

<script type="x-shader/x-vertex" id="vshaderENV">
     uniform mat4 projection;
     uniform mat4 modelview;
     attribute vec3 a_coords;
     attribute vec3 a_normal;
     varying vec3 v_eyeCoords;
     varying vec3 v_normal;
     void main() {
        vec4 eyeCoords = modelview * vec4(a_coords,1.0);
        gl_Position = projection * eyeCoords;
        v_eyeCoords = eyeCoords.xyz;
        v_normal = normalize(a_normal);
     }
</script>
<script type="x-shader/x-fragment" id="fshaderENV">
     precision mediump float;
     varying vec3 vCoords;
     varying vec3 v_normal;
     varying vec3 v_eyeCoords;
     uniform samplerCube skybox;
     uniform mat3 normalMatrix;
     uniform mat3 inverseViewTransform;
     void main() {
          vec3 N = normalize(normalMatrix * v_normal);
          vec3 V = -v_eyeCoords;
          vec3 R = -reflect(V,N);
          vec3 T = inverseViewTransform * R; // Transform by inverse of the view transform that was applied to the skybox
          gl_FragColor = textureCube(skybox, T);
     }
</script>

<!-- shader program with lighting -->

<script type="x-shader/x-vertex" id="vshaderLIT">
    attribute vec3 a_coords;
    attribute vec3 a_normal;
    uniform mat4 modelview;
    uniform mat4 projection;
    varying vec3 v_normal;
    varying vec3 v_eyeCoords;
    void main() {
        vec4 coords = vec4(a_coords,1.0);
        vec4 eyeCoords = modelview * coords;
        gl_Position = projection * eyeCoords;
        v_normal = normalize(a_normal);
        v_eyeCoords = eyeCoords.xyz/eyeCoords.w;
    }
</script>

<script type="x-shader/x-fragment" id="fshaderLIT">
    #ifdef GL_FRAGMENT_PRECISION_HIGH
       precision highp float;
    #else
       precision mediump float;
    #endif
    struct MaterialProperties {
        vec3 diffuseColor;
        vec3 specularColor;
        float specularExponent;
    };
    struct LightProperties {
        bool enabled;
        vec4 position;
        vec3 color;
    };
    uniform MaterialProperties material;
    uniform LightProperties lights[3];
    uniform mat3 normalMatrix;
    varying vec3 v_normal;
    varying vec3 v_eyeCoords;
    vec3 lightingEquation( LightProperties light, MaterialProperties material, 
                                vec3 eyeCoords, vec3 N, vec3 V ) {
           // N is normal vector, V is direction to viewer.
        vec3 L, R; // Light direction and reflected light direction.
        if ( light.position.w == 0.0 ) {
            L = normalize( light.position.xyz );
        }
        else {
            L = normalize( light.position.xyz/light.position.w - v_eyeCoords );
        }
        if (dot(L,N) <= 0.0) {
            return vec3(0.0);
        }
        vec3 reflection = dot(L,N) * light.color * material.diffuseColor;
        R = -reflect(L,N);
        if (dot(R,V) > 0.0) {
            float factor = pow(dot(R,V),material.specularExponent);
            reflection += factor * material.specularColor * light.color;
        }
        return reflection;
    }
    void main() {
        vec3 normal = normalize( normalMatrix*v_normal );
        vec3 viewDirection = normalize( -v_eyeCoords);  // (Assumes a perspective projection.)
        vec3 color = vec3(0);
        for (int i = 0; i < 3; i++) {
            if (lights[i].enabled) { 
                    color += lightingEquation( lights[i], material, v_eyeCoords,
                                                    normal, viewDirection);
            }
        }
        gl_FragColor = vec4(color,1);
    }
</script>


<!-- --------------  SCRIPTS ----------------------- -->

<script src="gl-matrix-min.js"></script>
<script src="simple-rotator.js"></script>
<script src="basic-object-models-IFS.js"></script>
<script src="teapot-model-IFS.js"></script>

<script>

"use strict";

var gl;   // The webgl context.
var canvas;

// To keep the variables organize, the data for each shader program is in an object (created in initGL())

var dataSB;    // Data for the skybox program
var dataENV;   // Data for environment map program (for the teapot)
var dataLIT;   // Data for the program with lighting, used for other objects

var projection = mat4.create();   // projection matrix
var modelview;    // modelview matrix -- created elsewhere
var normalMatrix = mat3.create();
var inverseViewTransform = mat3.create();  // The inverse of the view transform rotation matrix, used in skybox shader program.

var skyboxCube;    // The cube that is rendered to show the skybox.
var skyboxCubemap; // The static cubemap texture for the skybox, loaded in loadTextureCube()

var dynamicCubemap; // The cubemap texture for the teapot, created dynamically.
var framebuffer;   // A framebuffer for rendering the dynamic cubemap texture that is used on the central reflective object.

var reflectiveObjects;  // models for the central, reflective object
var cubeModel;   // Model for drawing the moving cubes that surround the central object.

var movingCubeData;  // An array of objects where each object holds information about one
                     // of the cubes that rotate around the central, reflective object.

var rotator;   // A SimpleRotator object to enable rotation by mouse dragging.

var rotX = 0, rotY = 0;  // Additional rotations applied as modeling transform to the teapot.

var cubemapTargets; // For convenience, an array containing the six constants, such as
                    // gl.TEXTURE_CUBE_MAP_POSITIVE_X, that represent the faces of a cubemap texture.
                    // Created in initGL().

var animating = true;  // variables for animation.
var frameNumber = 0;


/* Draws one frame of the animation */
function draw() {
 
    if (!skyboxCubemap) {  // can't do anything if skybox isn't ready to render.
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        return;
    }
    
    createDynamicCubemap();  // Create the dynamic cubemap texture for this frame.

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);  // draw to screen
    gl.viewport(0,0,canvas.width,canvas.height);
    
    gl.useProgram(dataSB.prog);
    
    mat4.perspective(projection, Math.PI/4, 1, 1, 100);  // renderSkyboxAndCubes() assumes projection and modelview matrix are already set
    modelview = rotator.getViewMatrix();
    
    renderSkyboxAndCubes();  // Draws everything except the central reflective object.
    
    // Get the inverse of the rotation that was applied to the skybox.
    // This is needed in the environment map shader to account for the rotation
    // of the skybox.  (Note that it is passed to the shader in the
    // teapot's render function.)
    
    mat3.fromMat4(inverseViewTransform, modelview);
    mat3.invert(inverseViewTransform,inverseViewTransform);

    // Add modeling rotations to the view transform.

    mat4.rotateX(modelview,modelview,rotX);
    mat4.rotateY(modelview,modelview,rotY);
    
    mat3.normalFromMat4(normalMatrix, modelview);
    
    // Draw the central reflective object, using the environment map

    gl.useProgram(dataENV.prog);
    
    mat4.perspective(projection, Math.PI/4, 1, 1, 10);
    gl.uniformMatrix4fv(dataENV.u_projection, false, projection);
    mat3.normalFromMat4(normalMatrix, modelview);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);
    gl.enableVertexAttribArray(dataENV.a_coords_loc);
    gl.enableVertexAttribArray(dataENV.a_normal_loc);
    var objectNumber = Number(document.getElementById("object").value);
    reflectiveObjects[objectNumber].render();  
    gl.disableVertexAttribArray(dataENV.a_coords_loc);
    gl.disableVertexAttribArray(dataENV.a_normal_loc);

}

/* This function is called by draw() to render the dynamic cubemap texture for the current frame.
 * It takes 6 "photos" of the environment using a "camera" that is located at the origin and
 * has a 90-degree field of view.  The camera points in the direction of the negative z-axis.
 * (There is no viewing transformation.)  With no modeling transformation, the camera takes
 * the picture that is needed for the "NEGATIVE_Z" face of the cube.  However, since the environment
 * map needs a view from the outside of the cube, and the camera is inside, the resulting image
 * has to be flipped in the x-direction.  I found that it also has be be flipped in the y-direction,
 * but I'm not sure why.  (But that does agree with the fact that Web images that are loaded into
 * a cubemap texture do NOT have to be flipped vertically, even though Web images are upside down
 * with respect to the OpenGL convention for images.)  For the other five faces of the cube,
 * the environment is rotated into position in front of the camera by applying a modeling transformation
 * (or, if you prefer, the camera is rotated by applying a viewing transformation).  There is no x and
 * y flip for the positive and negative y directions becasue the flip is already built into the
 * modeling transformation that is use to position the scene in front of the camera.
 */
function createDynamicCubemap() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0,0,512,512);  //match size of the texture images
    mat4.perspective(projection, Math.PI/2, 1, 1, 100);  // Set projection to give 90-degree field of view.
    
    modelview = mat4.create();
    
    mat4.identity(modelview);
    mat4.scale(modelview,modelview,[-1,-1,1]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, dynamicCubemap, 0);
    renderSkyboxAndCubes();
 
    mat4.identity(modelview);
    mat4.scale(modelview,modelview,[-1,-1,1]);
    mat4.rotateY(modelview,modelview,Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X, dynamicCubemap, 0);
    renderSkyboxAndCubes();

    mat4.identity(modelview);
    mat4.scale(modelview,modelview,[-1,-1,1]);
    mat4.rotateY(modelview,modelview,Math.PI);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, dynamicCubemap, 0);
    renderSkyboxAndCubes();

    mat4.identity(modelview);
    mat4.scale(modelview,modelview,[-1,-1,1]);
    mat4.rotateY(modelview,modelview,-Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, dynamicCubemap, 0);
    renderSkyboxAndCubes();
    
    mat4.identity(modelview);
    mat4.rotateX(modelview,modelview,Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, dynamicCubemap, 0);
    renderSkyboxAndCubes();
    
    mat4.identity(modelview);
    mat4.rotateX(modelview,modelview,-Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, dynamicCubemap, 0);
    renderSkyboxAndCubes();
    
    /* The commented out section below is an alternative way of computing the positive and negative Y images,
       including the x/y flip.  The rotations that are used in this version correspond are the correct rotations
       based on the layout of the six images in a cubemap.   The single rotation used above is equivalent to the
       flip and two rotations used below. */
    
    //mat4.identity(modelview);
    //mat4.scale(modelview,modelview,[-1,-1,1]);
    //mat4.rotateX(modelview,modelview,Math.PI/2);
    //mat4.rotateY(modelview,modelview,Math.PI);
    //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, dynamicCubemap, 0);
    //renderSkyboxAndCubes();
    //
    //mat4.identity(modelview);
    //mat4.scale(modelview,modelview,[-1,-1,1]);
    //mat4.rotateX(modelview,modelview,-Math.PI/2);
    //mat4.rotateY(modelview,modelview,Math.PI);
    //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, dynamicCubemap, 0);
    //renderSkyboxAndCubes();
    
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);
    gl.generateMipmap( gl.TEXTURE_CUBE_MAP );
}


/* Draws the entire scene except for the central reflective object.  It is called by draw() and
 * is called six times by createDyanmicCubeMap() to draw the six faces of the cubemap texture. (Note that
 * we don't want the central object in the environment map -- especially since the camera is inside that
 * object, and the camera would only see the inside of the object!)  This function assumes that the
 * modelview and projection matrices already exist; the values leaveing the method are the same as
 * the values coming in.  The modelview matrix should be set to the viewing transform.  Note that different
 * projection and modelview transformations are used for the main image and for the cubemap texture.
 */
function renderSkyboxAndCubes() {
    
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Draw the skybox, with its static cubemap texture.
    
    gl.useProgram(dataSB.prog);
    gl.uniformMatrix4fv(dataSB.u_projection, false, projection);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxCubemap);    
    if (skyboxCubemap) {
        gl.enableVertexAttribArray(dataSB.a_coords_loc); 
        skyboxCube.render();  
        gl.disableVertexAttribArray(dataSB.a_coords_loc);
    }
    
    // Draw the moving cubes, which are drawn with lighting.
    
    gl.useProgram(dataLIT.prog);
    gl.uniformMatrix4fv(dataLIT.u_projection, false, projection);
    gl.enableVertexAttribArray(dataLIT.a_coords_loc); 
    gl.enableVertexAttribArray(dataLIT.a_normal_loc); 
    
    // lights must have their position multiplied by the modelview transform, which now
    // is only the viewing transform, to place them into world coordinates.  Light 0
    // is at (0,0,0) which modelview would only map to itself, so it is not transformed.
    // Light color was set in initGL() and all three lights are enabled.  (The lights are white,
    // of various intensities.)
    
    gl.uniform4f( dataLIT.u_lights[0].position, 0, 0, 0, 1 ); // positional light at origin
    var transformed = vec4.create();
    vec4.transformMat4(transformed, [0,1,0,0], modelview); // directional light from abovev
    gl.uniform4fv( dataLIT.u_lights[1].position, transformed );
    vec4.transformMat4(transformed, [0,-1,0,0], modelview); // directinal light from below.
    gl.uniform4fv( dataLIT.u_lights[2].position, transformed );
    
    for (var i = 0; i < movingCubeData.length; i++) {  // draw the cubes
        var saveMB = mat4.clone(modelview);
        var cd = movingCubeData[i];
        mat4.rotate(modelview, modelview, frameNumber*cd.globalAngularVelocity, cd.globalRotationAxis);
        mat4.translate(modelview,modelview,cd.translation);
        mat4.rotate(modelview, modelview, frameNumber*cd.localAngularVelocity, cd.localRotationAxis);
        mat3.normalFromMat4(normalMatrix, modelview);
        gl.uniform3fv( dataLIT.u_material.diffuseColor, cd.color );
        cubeModel.render(); 
        modelview = saveMB;        
    }
    
    gl.disableVertexAttribArray(dataLIT.a_coords_loc); 
    gl.disableVertexAttribArray(dataLIT.a_normal_loc); 
}

/* Create the array of objects with data needed to draw the cubes.  Each cube has a random color.
 * It rotates in its own object coordinate system, and the rotating cube then rotates about the
 * origin.
 */
function createMovingCubeData() {
    movingCubeData = [];
    for (var i = 0; i <= 10; i++) {
        movingCubeData.push( {
            translation: [2*i - 10,0,-4],
            localRotationAxis: [Math.random(),Math.random(),Math.random()],
            localAngularVelocity: 0.005 + 0.1*Math.random(),
            globalRotationAxis: [Math.random(),Math.random(),Math.random()],
            globalAngularVelocity: 0.005 + 0.02*Math.random(),
            color: [Math.random(),Math.random(),Math.random()]
        } );
        vec3.normalize(movingCubeData[i].localRotationAxis, movingCubeData[i].localRotationAxis);
        vec3.normalize(movingCubeData[i].globalRotationAxis, movingCubeData[i].globalRotationAxis);
        if (Math.random() < 0.5) {
            movingCubeData[i].globalAngularVelocity *= -1;
        }
    }    
}


/* Loads the images for the skybox texture cube, and calls requestAnimationFrame()
 * when finished to start the animation
 */
function loadTextureCube() {
    document.getElementById("headline").innerHTML = "WebGL Dynamic Cubemap -- LOADING CUBEMAP TEXTURE";
    var ct = 0;
    var img = new Array(6);
    var urls = [
       "cubemap-textures/park/posx.jpg", "cubemap-textures/park/negx.jpg", 
       "cubemap-textures/park/posy.jpg", "cubemap-textures/park/negy.jpg", 
       "cubemap-textures/park/posz.jpg", "cubemap-textures/park/negz.jpg"
    ];
    for (var i = 0; i < 6; i++) {
        img[i] = new Image();
        img[i].onload = function() {
            ct++;
            if (ct == 6) {
                document.getElementById("headline").innerHTML = "WebGL Dynamic Cubemap";
                skyboxCubemap = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxCubemap);
                try {
                    for (var j = 0; j < 6; j++) {
                        gl.texImage2D(cubemapTargets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    }
                } catch(e) {  // (Could be the security exception in some browsers when reading from the local disk)
                    document.getElementById("headline").innerHTML = "CAN'T ACCESS SKYBOX TEXTURE; RUNNING WITHOUT IT";
                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                if (animating) {
                    requestAnimationFrame(frame);
                }
                else {
                    draw();
                }
            }
        }
        img[i].onerror = function() {
             document.getElementById("headline").innerHTML = "ERROR WHILE TRYING TO LOAD SKYBOX TEXTURE";
        }
        img[i].src = urls[i];
    }
}


function createModelENV(modelData) {  // for creating the reflective object models; a model has a render() method for drawing itself
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(dataENV.a_coords_loc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(dataENV.a_normal_loc, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(dataENV.u_modelview, false, modelview );
        gl.uniformMatrix3fv(dataENV.u_normalMatrix, false, normalMatrix);
        gl.uniformMatrix3fv(dataENV.u_inverseViewTransform, false, inverseViewTransform);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }; 
    return model;
}

function createModelLIT(modelData) {  // For creating the model for the moving cubes, which are rendered with lighting
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(dataLIT.a_coords_loc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(dataLIT.a_normal_loc, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(dataLIT.u_modelview, false, modelview );
        gl.uniformMatrix3fv(dataLIT.u_normalMatrix, false, normalMatrix);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    };
    return model;
}

function createModelSB(modelData) {  // For creating the model for the skybox cube.
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function() { 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(dataSB.a_coords_loc, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(dataSB.u_modelview, false, modelview ); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    };
    return model;
}



/**
 *  An event listener for the keydown event.  It is installed by the init() function.  Rotates the reflective object.
 */
function doKey(evt) {
    var rotationChanged = true;
    switch (evt.keyCode) {
        case 37: rotY -= 0.15; break;        // left arrow
        case 39: rotY +=  0.15; break;       // right arrow
        case 38: rotX -= 0.15; break;        // up arrow
        case 40: rotX += 0.15; break;        // down arrow
        case 13:                             // return
        case 36:                             // home; resets both modeling and viewing rotations
            rotX = rotY = 0;
            rotator.setAngles(0,0);
            break;
        default: rotationChanged = false;
    }
    if (rotationChanged) {
        evt.preventDefault();
        draw();
    }
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type String is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 *    The second and third parameters are the id attributes for <script>
 * elementst that contain the source code for the vertex and fragment
 * shaders.
 */
function createProgram(gl, vertexShaderID, fragmentShaderID) {
    function getTextContent( elementID ) {
            // This nested function retrieves the text content of an
            // element on the web page.  It is used here to get the shader
            // source code from the script elements that contain it.
        var element = document.getElementById(elementID);
        var node = element.firstChild;
        var str = "";
        while (node) {
            if (node.nodeType == 3) // this is a text node
                str += node.textContent;
            node = node.nextSibling;
        }
        return str;
    }
    try {
        var vertexShaderSource = getTextContent( vertexShaderID );
        var fragmentShaderSource = getTextContent( fragmentShaderID );
    }
    catch (e) {
        throw "Error: Could not get shader source code from script elements.";
    }
    var vsh = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource(vsh,vertexShaderSource);
    gl.compileShader(vsh);
    if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
     }
    var fsh = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
       throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog,vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if ( ! gl.getProgramParameter( prog, gl.LINK_STATUS) ) {
       throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}



/* Initialize the WebGL context.  Called by init().
   Gets locations for shader program attributes and uniforms, sets the values
   of uniforms that don't change, and creates the model data for drawing the
   object in the scene. */
function initGL() {

    cubemapTargets = [  // targets for use in some gl functions for working with cubemaps
       gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
       gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
       gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
    ];

    gl.enable(gl.DEPTH_TEST);

    dataSB = {};  // get the data for the skybox shader program
    dataSB.prog = createProgram(gl, "vshaderSB", "fshaderSB");
    dataSB.a_coords_loc =  gl.getAttribLocation(dataSB.prog, "a_coords");
    dataSB.u_modelview = gl.getUniformLocation(dataSB.prog, "modelview");
    dataSB.u_projection = gl.getUniformLocation(dataSB.prog, "projection");
    dataSB.u_skybox = gl.getUniformLocation(dataSB.prog, "skybox");
    gl.useProgram(dataSB.prog);
    gl.uniform1i(dataSB.u_skybox, 0);
    
    dataENV = {};  // get the data for the envrionment map program
    dataENV.prog = createProgram(gl, "vshaderENV", "fshaderENV"),
    dataENV.a_coords_loc =  gl.getAttribLocation(dataENV.prog, "a_coords"),
    dataENV.a_normal_loc =  gl.getAttribLocation(dataENV.prog, "a_normal"),
    dataENV.u_modelview = gl.getUniformLocation(dataENV.prog, "modelview"),
    dataENV.u_projection = gl.getUniformLocation(dataENV.prog, "projection"),
    dataENV.u_normalMatrix = gl.getUniformLocation(dataENV.prog, "normalMatrix"),
    dataENV.u_inverseViewTransform = gl.getUniformLocation(dataENV.prog, "inverseViewTransform")
    dataENV.u_skybox = gl.getUniformLocation(dataENV.prog, "skybox");
    gl.useProgram(dataENV.prog);
    gl.uniform1i(dataENV.u_skybox, 0);

    dataLIT = {};  // get the data for the program with lighting, used for the moving cubes
    dataLIT.prog = createProgram(gl, "vshaderLIT", "fshaderLIT"),
    gl.useProgram(dataLIT.prog);  // (so we can set some values for uniforms in that program)
    dataLIT.a_coords_loc =  gl.getAttribLocation(dataLIT.prog, "a_coords"),
    dataLIT.a_normal_loc =  gl.getAttribLocation(dataLIT.prog, "a_normal"),
    dataLIT.u_modelview = gl.getUniformLocation(dataLIT.prog, "modelview"),
    dataLIT.u_projection = gl.getUniformLocation(dataLIT.prog, "projection"),
    dataLIT.u_normalMatrix =  gl.getUniformLocation(dataLIT.prog, "normalMatrix")
    dataLIT.u_material = {
        diffuseColor: gl.getUniformLocation(dataLIT.prog, "material.diffuseColor"),
        specularColor: gl.getUniformLocation(dataLIT.prog, "material.specularColor"),
        specularExponent: gl.getUniformLocation(dataLIT.prog, "material.specularExponent")
    };
    dataLIT.u_lights = new Array(3);
    for (var i = 0; i < 3; i++) {
        dataLIT.u_lights[i] = {
            enabled: gl.getUniformLocation(dataLIT.prog, "lights[" + i + "].enabled"),
            position: gl.getUniformLocation(dataLIT.prog, "lights[" + i + "].position"),
            color: gl.getUniformLocation(dataLIT.prog, "lights[" + i + "].color"),
        };
        gl.uniform1i(dataLIT.u_lights[i].enabled, 1);         
    }
    gl.uniform3f(dataLIT.u_lights[0].color, 0.5, 0.5, .5);  // light positions will be set in world coordinates
    gl.uniform3f(dataLIT.u_lights[1].color, 0.4, 0.4, .4);
    gl.uniform3f(dataLIT.u_lights[2].color, 0.3, 0.3, .3);
    gl.uniform1f(dataLIT.u_material.specularExponent, 32);  // diffuse color will be set for individual object
    gl.uniform3f(dataLIT.u_material.specularColor, 0.2, 0.2, 0.2);

    skyboxCube = createModelSB( cube(100) );  // create the model for the skybox
    
    reflectiveObjects = new Array(6);  // create the models for the reflective objects that appear at the center of the scen
    reflectiveObjects[0] = createModelENV( cube(0.9) );
    reflectiveObjects[1] = createModelENV( uvSphere(0.6,64,32) );
    reflectiveObjects[2] = createModelENV( uvCylinder() );
    reflectiveObjects[3] = createModelENV( uvCone() );
    reflectiveObjects[4] = createModelENV( uvTorus(0.65,0.2,64,24) );
    for (var i = 0; i < teapotModel.vertexPositions.length; i++) {
        teapotModel.vertexPositions[i] *= 0.05; // scale teapot model to a size that matches other objects
    }
    reflectiveObjects[5] = createModelENV( teapotModel );
    
    cubeModel = createModelLIT( cube(1.8) );  // create the model tha tis used for drawing the moving cubes
    
    skyboxCubemap = gl.createTexture();  // Create the texture object for the skybox
    
    dynamicCubemap = gl.createTexture(); // Create the texture object for the reflection map
    
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);  // create storage for the reflection map images
    for (i = 0; i < 6; i++) {
        gl.texImage2D(cubemapTargets[i], 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            //With null as the last parameter, the previous function allocates memory for the texture and fills it with zeros.
    }
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
         // The previous line would sets the minification filter to gl.LINEAR so we wouldn't neet mipmaps,
         // but the quality of the reflections was significantly improved by using mipmpaps.
         // Even though the mipmaps have to be computed in every frame, it seems worth it.
    
    framebuffer = gl.createFramebuffer();  // crate the framebuffer that will draw to the reflection map
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);  // select the framebuffer, so we can attach the depth buffer to it
    var depthBuffer = gl.createRenderbuffer();   // renderbuffer for depth buffer in framebuffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // so we can create storage for the depthBuffer
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
        // The same framebuffer will be used to draw all six faces of the cubemap.  Each side will be attached
        // as the color buffer of the framebuffer while that side is being drawn.
    
    // Check form WebGL errors (since I'm not sure all platforms will be able to create the framebuffer)
    if (gl.getError() != gl.NO_ERROR) {
        throw "Some WebGL error occurred while trying to create framebuffer.  Maybe you need more resources; try another browser or computer.";
    }
 
}  // end initGL()


//--------------------------------- animation framework ------------------------------


function frame() {
    if (animating) { 
        frameNumber++;
        draw();
        requestAnimationFrame(frame);
    }
}

function doAnimationCheckbox() {
    var run = document.getElementById("animCheckbox").checked;
    if (run != animating) {
        animating = run;
        if (animating)
            requestAnimationFrame(frame);
    }
}

//-------------------------------------------------------------------------



/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl") || 
                         canvas.getContext("experimental-webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context:" + e + "</p>";
        return;
    }
    document.getElementById("animCheckbox").checked = true;
    document.getElementById("animCheckbox").onchange = doAnimationCheckbox;
    document.getElementById("object").value = "5";
    document.getElementById("object").onchange = function() {
        draw();
        document.getElementById("reset").focus();  // to make sure arrow key input is not sent to popup menu
    }
    document.addEventListener("keydown", doKey, false);
    document.getElementById("reset").onclick = function() {
        rotX = rotY = 0;
        rotator.setAngles(0,0);
        frameNumber = 0;
        draw();        
    };
    rotator = new SimpleRotator(canvas,function() {
        if (!animating)
           draw();
    },3);
    createMovingCubeData();
    loadTextureCube();
}



</script>
</head>
<body onload="init()">

<h2 id="headline">WebGL Dynamic Cubemap</h2>

<noscript><hr><h3>This page requires Javascript and a web browser that supports WebGL</h3><hr></noscript>

<p id="message" style="font-weight:bold">Drag with mouse on the picture to rotate the view.<br>
Use arrow keys to rotate the object. Home or Enter key resets view.</p>

<p><label><input type="checkbox" id="animCheckbox"> <b>Animate</b></label>
<label><b>The Reflective Object:</b> <select id="object">
    <option value="0">Cube</option>
    <option value="1">Sphere</option>
    <option value="2">Cylinder</option>
    <option value="3">Cone</option>
    <option value="4">Torus</option>
    <option value="5">Teapot</option>
</select></label>
<button id="reset">Reset</button>


<div id="canvas-holder">

    <canvas width=600 height=600 id="webglcanvas"></canvas>

</div>


</body>
</html>



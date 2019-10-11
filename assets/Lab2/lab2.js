///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 2
//     Michael Clark (clark.2816)
//     Assigned: September 17, 2019
//     Due: October 1, 2019 11:59 PM
//     Lab overview: Enhance your 2D drawing program from lab1 with transformations
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc)
var shaderProgram;  // the shader program
var canvas;

//viewport info
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height;

//POINTS
let vertices_per_point = 1;
var point_counter = 0;
var pointVertexBuffer;
var pointColorBuffer;
var point_colors = [];

var global_points_rotation = [];
var points_translation_x=[];   // x translation  
var points_translation_y=[];   // y translation 
var points_rotation =[];  // rotation angle 
var points_scale =[];   // scaling factor (uniform is assumed)  

//LINES
let vertices_per_line = 2;
var line_counter = 0;
var lineVertexBuffer;
var lineColorBuffer;
var line_colors = [];

var global_lines_rotation = [];
var lines_translation_x=[];   // x translation  
var lines_translation_y=[];   // y translation 
var lines_rotation =[];  // rotation angle 
var lines_scale =[];   // scaling factor (uniform is assumed) 

//TRIANGLES
let vertices_per_triangle = 3;
var triangle_counter = 0;
var triangleVertexBuffer;
var triangleColorBuffer;
var triangle_colors = [];

var global_triangles_rotation = [];
var triangles_translation_x=[];   // x translation  
var triangles_translation_y=[];   // y translation 
var triangles_rotation =[];  // rotation angle 
var triangles_scale =[];   // scaling factor (uniform is assumed) 

//SQUARES
let vertices_per_square = 4;
var square_counter = 0;
var squareVertexBuffer;
var squareColorBuffer;
var square_colors = [];

var global_squares_rotation = [];
var squares_translation_x=[];   // x translation  
var squares_translation_y=[];   // y translation 
var squares_rotation =[];  // rotation angle 
var squares_scale =[];   // scaling factor (uniform is assumed) 


//Program State Variables
var global_rotation_on = false;
var polygon_mode = 'h';  //default = h line
var color_mode  = 'r';   //default = r color

var mvMatrix = mat4.create();   // this is the matrix for transforming each shape before draw 


//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    canvas = document.getElementById("lab2-canvas");

    initGL(canvas);
    initShaders();

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "PositionMatrix");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    initScene();

    document.addEventListener('mousedown', onDocumentMouseDown,false);
    document.addEventListener('keydown', onKeyDown, false);
}

///////////////////////////////////////////////////////////
///////               Create VBO          /////////////////
function CreateBuffer() {

    //VERTEX BUFFERS
    var point_vertices = [0.0, 0.0, 0.0];
    pointVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(point_vertices), gl.STATIC_DRAW);
    pointVertexBuffer.itemSize = 3;  // NDC'S [x,y,0]
    pointVertexBuffer.numItems = vertices_per_point;// 1 vertex

    var line_vertices = [
      -0.1, 0.0,  0.0,
       0.1, 0.0,  0.0
    ];
    lineVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line_vertices), gl.STATIC_DRAW);
    lineVertexBuffer.itemSize = 3;  // NDC'S [x,y,0]
    lineVertexBuffer.numItems = vertices_per_line;// Only one line contained here

    var triangle_vertices = [
      -0.05, -0.05,  0.0,
       0.05, -0.05,  0.0,
       0.0, 0.0433,  0.0,
    ];
    triangleVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertices), gl.STATIC_DRAW);
    triangleVertexBuffer.itemSize = 3;  // NDC'S [x,y,0]
    triangleVertexBuffer.numItems = vertices_per_triangle;// n*3 vertices

    var square_vertices = [
      -0.05, 0.05,  0.0,
      -0.05, -0.05,  0.0,
       0.05, 0.05,  0.0,
       0.05, -0.05,  0.0
    ];
    squareVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square_vertices), gl.STATIC_DRAW);
    squareVertexBuffer.itemSize = 3;  // NDC'S [x,y,0]
    squareVertexBuffer.numItems = vertices_per_square;// n*6 vertices

    //COLOR BUFFERS
    pointColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(point_colors), gl.STATIC_DRAW);
    pointColorBuffer.itemSize = 4;
    pointColorBuffer.numItems = point_counter*vertices_per_point;

    lineColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line_colors), gl.STATIC_DRAW);
    lineColorBuffer.itemSize = 4;
    lineColorBuffer.numItems = line_counter*vertices_per_line;

    triangleColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_colors), gl.STATIC_DRAW);
    triangleColorBuffer.itemSize = 4;
    triangleColorBuffer.numItems = triangle_counter*vertices_per_triangle;

    squareColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square_colors), gl.STATIC_DRAW);
    squareColorBuffer.itemSize = 4;
    squareColorBuffer.numItems = square_counter*vertices_per_square;
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

///////////////////////////////////////////////////////
function draw_points() {
    drawShape(pointVertexBuffer, pointColorBuffer, point_counter, point_colors, vertices_per_point,
    global_points_rotation, points_translation_x, points_translation_y, points_rotation, points_scale, gl.POINTS);
}

function draw_lines() { 
    drawShape(lineVertexBuffer, lineColorBuffer, line_counter, line_colors, vertices_per_line,
    global_lines_rotation, lines_translation_x, lines_translation_y, lines_rotation, lines_scale, gl.LINES);
}

function draw_triangles() 
{  
    drawShape(triangleVertexBuffer, triangleColorBuffer, triangle_counter, triangle_colors, vertices_per_triangle,
    global_triangles_rotation, triangles_translation_x, triangles_translation_y, triangles_rotation, triangles_scale, gl.TRIANGLE_STRIP);
}


function draw_squares() 
{
    drawShape(squareVertexBuffer, squareColorBuffer, square_counter, square_colors, vertices_per_square,
    global_squares_rotation, squares_translation_x, squares_translation_y, squares_rotation, squares_scale, gl.TRIANGLE_STRIP);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//DRAW GENERIC SHAPE BASED ON PARAMETERS
function drawShape(shapeVertexBuffer, shapeColorBuffer, shape_counter, shape_colors, vertices_per_shape,
                   global_shapes_rotation, shapes_translation_x, shapes_translation_y, shapes_rotation, shapes_scale, drawType)
{
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, shapeVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, shapeColorBuffer);

  for (var i=0; i<shape_counter; i++){  // draw the line vbo buffer multiple times, one with a new transformation specified by mouse click 
    gl.bufferData(gl.ARRAY_BUFFER, 
                  new Float32Array(shape_colors.slice(i*shapeColorBuffer.itemSize*vertices_per_shape, 
                                                      i*shapeColorBuffer.itemSize*vertices_per_shape+shapeColorBuffer.itemSize*vertices_per_shape)),
                  gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, shapeColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    mat4.identity(mvMatrix);
    mvMatrix = mat4.rotate(mvMatrix, degToRad(global_shapes_rotation[i]), [0, 0, 1]);
    var trans = [0,0,0];
    trans[0] = shapes_translation_x[i]; 
    trans[1] = shapes_translation_y[i];
    trans[2] = 0.0; 
    vmMatrix = mat4.translate(mvMatrix, trans);  // move from origin to mouse click 
    mvMatrix = mat4.rotate(mvMatrix, degToRad(shapes_rotation[i]), [0, 0, 1]);  // rotate if any 
    var scale = [1,1,1];
    scale[0] = scale[1] = scale[2] = shapes_scale[i]; 
    mvMatrix = mat4.scale(mvMatrix, scale);  // scale if any 

    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix); //Pass matrix to vertex shader
    gl.drawArrays(drawType, 0, shapeVertexBuffer.numItems);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1;
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1;
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY);
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    CreateBuffer();
}

function drawScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1;
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1;
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY);
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    draw_points();
    draw_lines();
    draw_triangles();
    draw_squares(); 
}

var Z_angle = 0.0;
var lastMouseX = 0, lastMouseY = 0;

///////////////////////////////////////////////////////////////

function onDocumentMouseDown( event ) {
   event.preventDefault();
   document.addEventListener( 'mousemove', onDocumentMouseMove, false );
   document.addEventListener( 'mouseup', onDocumentMouseUp, false );
   document.addEventListener( 'mouseout', onDocumentMouseOut, false );

   var mouseX = event.clientX;
   var mouseY = event.ClientY; 

   lastMouseX = mouseX;
   lastMouseY = mouseY;

	 var NDC_X = (event.clientX - vp_minX)/vp_width*2 -1;
	 var NDC_Y = ((vp_height-event.clientY) - vp_minY)/vp_height*2 - 1;
	 console.log("NDC click", event.clientX, event.clientY, NDC_X, NDC_Y);

   if(!global_rotation_on)
   {
      if (polygon_mode == 'p' ) 
      {
        global_points_rotation.push(0.0);
        points_translation_x.push(NDC_X); 
        points_translation_y.push(NDC_Y); 
        points_rotation.push(0.0); 
        points_scale.push(1.0);

        fill_colors(point_colors, vertices_per_point);
        point_counter++;
      }
      else if (polygon_mode == 'h' ) 
      {
        global_lines_rotation.push(0.0);
        lines_translation_x.push(NDC_X); 
        lines_translation_y.push(NDC_Y); 
        lines_rotation.push(0.0); 
        lines_scale.push(1.0);

        fill_colors(line_colors, vertices_per_line);
        line_counter++;
      }
      else if (polygon_mode == 'v' ) 
      {
        global_lines_rotation.push(0.0);
        lines_translation_x.push(NDC_X); 
        lines_translation_y.push(NDC_Y); 
        lines_rotation.push(90.0); 
        lines_scale.push(1.0);

        fill_colors(line_colors, vertices_per_line);
        line_counter++;
      }
      else if (polygon_mode == 't' ) 
      {
        global_triangles_rotation.push(0.0);
        triangles_translation_x.push(NDC_X); 
        triangles_translation_y.push(NDC_Y); 
        triangles_rotation.push(0.0); 
        triangles_scale.push(1.0);

        fill_colors(triangle_colors, vertices_per_triangle);
        triangle_counter++;
      }
      else if (polygon_mode == 'q' ) 
      {
        global_squares_rotation.push(0.0);
        squares_translation_x.push(NDC_X); 
        squares_translation_y.push(NDC_Y); 
        squares_rotation.push(0.0); 
        squares_scale.push(1.0);

        fill_colors(square_colors, vertices_per_square);
        square_counter++;
      }

      Z_angle = 0.0
   }
	 console.log("shape = ", polygon_mode);
   drawScene();	 // draw the VBO
}

function fill_colors(shape_colors, vertices_per_shape)
{
    for(i=0; i<vertices_per_shape; i++) {
        if (color_mode == 'r')
        {
          shape_colors.push(1.0, 0.0, 0.0, 1.0);

        }
        else if (color_mode == 'g')
        {
          shape_colors.push(0.0, 1.0, 0.0, 1.0);
        }
        else if (color_mode == 'b')
        {
          shape_colors.push(0.0, 0.0, 1.0, 1.0);       
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////
//
//   Mouse button handlers
//

function onDocumentMouseMove( event ) {
   
   var mouseX = event.clientX;
   var mouseY = event.ClientY;

   var diffX = mouseX - lastMouseX;

   Z_angle = Z_angle + diffX/5;
	 
   lastMouseX = mouseX;
   lastMouseY = mouseY;

   if(global_rotation_on)
   {
     
      for(i=0; i < point_counter; i++)
      {
        global_points_rotation[i] += diffX;
      }

      for(i=0; i < line_counter; i++)
      {
        global_lines_rotation[i] += diffX;
      }

      for(i=0; i < triangle_counter; i++)
      {
        global_triangles_rotation[i] += diffX;
      }
      
      for(i=0; i < square_counter; i++)
      {
        global_squares_rotation[i] += diffX;
      }
   }
   else 
   {
      if (polygon_mode == 'p' ) 
      {
          points_rotation[point_counter-1] = Z_angle;
      } 
      else if (polygon_mode == 'h' || polygon_mode == 'v')
      {
          lines_rotation[line_counter-1] += diffX;   // update the rotation angle 
      }
      else if (polygon_mode == 't')
      {
          triangles_rotation[triangle_counter-1] = Z_angle;   // update the rotation angle 
      }
      else if (polygon_mode == 'q')
      {
          squares_rotation[square_counter-1] = Z_angle;   // update the rotation angle 
      }
  }
	 drawScene();	 // draw the VBO 
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

///////////////////////////////////////////////////////////////////////////
//
//  key stroke handler
//
function onKeyDown(event) {
  console.log(event.keyCode);
  switch(event.keyCode)  {
    case 80:
        polygon_mode = 'p';
    break;
    case 72:
        polygon_mode = 'h';
    break;
    case 86:
        polygon_mode = 'v';
    break;
    case 84:
        polygon_mode = 't';
    break;
    case 81:
        polygon_mode = 'q';
    break;
    case 79:
        polygon_mode = 'o';
    break;
    case 82:
        color_mode = 'r';
    break;
    case 71:
        color_mode = 'g';
    break;
    case 66:
        color_mode = 'b';
    break;
    case 83:
        if (event.shiftKey) 
        {
            if(polygon_mode == 'p')
            {
              points_scale[point_counter-1]*=1.1; 			  	  
            } 
            else if (polygon_mode == 'h' || polygon_mode == 'v')
            {
              lines_scale[line_counter-1]*=1.1;
            }
            else if (polygon_mode == 't')
            {
              triangles_scale[triangle_counter-1]*=1.1;
            }
            else if (polygon_mode == 'q')
            {
              squares_scale[square_counter-1]*=1.1;
            }
        }
        else 
        {
          if(polygon_mode == 'p')
          {
            points_scale[point_counter-1]*=0.9; 			  	  
          } 
          else if (polygon_mode == 'h' || polygon_mode == 'v')
          {
            lines_scale[line_counter-1]*=0.9;
          }
          else if (polygon_mode == 't')
          {
            triangles_scale[triangle_counter-1]*=0.9;
          }
          else if (polygon_mode == 'q')
          {
            squares_scale[square_counter-1]*=0.9;
          }
        }
    break;
    case 87:
        global_rotation_on =event.shiftKey;
        Z_angle=0.0;
    break;
    case 67:
        clear_screen();
    break;
    case 68:
        redisplay_screen();
    break;
  }
	console.log('polygon mode =', polygon_mode);
  console.log('color mode =', color_mode);
  
  drawScene();
}

function clear_screen()
{
  point_counter = 0;
  point_colors = [];
  global_points_rotation = [];
  points_translation_x=[]; 
  points_translation_y=[]; 
  points_rotation =[]; 
  points_scale =[]; 

  line_counter = 0;
  line_colors = [];
  global_lines_rotation = [];
  lines_translation_x=[];  
  lines_translation_y=[]; 
  lines_rotation =[];  
  lines_scale =[];   

  triangle_counter = 0;
  triangle_colors = [];
  global_triangles_rotation = [];
  triangles_translation_x=[];   
  triangles_translation_y=[];   
  triangles_rotation =[];  
  triangles_scale =[];   

  square_counter = 0;
  square_colors = [];
  global_squares_rotation = [];
  squares_translation_x=[];   
  squares_translation_y=[];   
  squares_rotation =[];  
  squares_scale =[];   

  global_rotation_on = false;

  CreateBuffer();
  drawScene();
}

function redisplay_screen()
{
  drawScene();
}
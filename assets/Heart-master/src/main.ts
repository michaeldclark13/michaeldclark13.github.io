import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';

import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  color: [255, 105, 193, 0.9], // CSS string
  'Load Scene': loadScene, // A function pointer, essentially
  Pink_Bunny : 0.2,
  Blue_Bunny : 0.2,
  Self_defense: 0.2,
};

let heart: Icosphere;
let blackBunny: Icosphere;
let whiteBunny: Icosphere;
let mount: Icosphere;
let skyDome: Icosphere;

let count: number = 0.0;

function loadScene() {
  heart = new Icosphere(vec3.fromValues(0, 1, 0), 4, 6);
  heart.create();
  mount = new Icosphere(vec3.fromValues(0, 1, 0), 4, 6);
  mount.create();
  blackBunny = new Icosphere(vec3.fromValues(0, 0, 0), 1, 6);
  blackBunny.create();
  whiteBunny = new Icosphere(vec3.fromValues(0, 0, 0), 1, 6);
  whiteBunny.create();
  skyDome = new Icosphere(vec3.fromValues(0, 0, 0), 40, 3);
  skyDome.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.addColor(controls, 'color');
  gui.add(controls, 'Load Scene');
  gui.add(controls,'Pink_Bunny' , 0, 2).step(0.2);
  gui.add(controls, 'Blue_Bunny', 0, 2).step(0.2);
  gui.add(controls, 'Self_defense', 0, 2).step(0.2);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 20), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(1.0, 0.82, 0.863, 1);
  gl.enable(gl.DEPTH_TEST);

  const planet = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/planet-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/planet-frag.glsl')),
  ]);
  const sky = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/sky-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/sky-frag.glsl')),
  ]);
  const mountains = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/mountains-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/mountains-frag.glsl')),
  ]);
  const bunny_black = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/bunny_black-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/bunny_black-frag.glsl')),
  ]);
  const bunny_white = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/bunny_white-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/bunny_white-frag.glsl')),
  ]);

  // const butterfly = new ShaderProgram([
  //   new Shader(gl.VERTEX_SHADER, require('./shaders/butterfly-vert.glsl')),
  //   new Shader(gl.FRAGMENT_SHADER, require('./shaders/butterfly-frag.glsl')),
  // ]);

  // This function will be called every frame
  function tick() {
    let new_color = vec4.fromValues(controls.color[0]/256, controls.color[1]/256, controls.color[2]/256, 1);
      planet.setGeometryColor(new_color);  
      mountains.setGeometryColor(new_color);
      bunny_black.setGeometryColor(new_color);
      bunny_white.setGeometryColor(new_color);

      bunny_black.setLength(controls.Blue_Bunny);
      bunny_white.setLength(controls.Pink_Bunny);
      mountains.setLength(controls.Self_defense);
      
      count += 1;
      planet.setTime(count);
      mountains.setTime(count);
      bunny_black.setTime(count);
      bunny_white.setTime(count);

      camera.update();  
      stats.begin();
  
      gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  
      renderer.clear();
      renderer.render(camera, planet, [heart]);
      renderer.render(camera, sky, [skyDome]);
      renderer.render(camera, mountains, [mount]);
      renderer.render(camera, bunny_white, [whiteBunny]);
      renderer.render(camera, bunny_black, [blackBunny]);

    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
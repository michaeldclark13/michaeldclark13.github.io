import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  }

  create() {
      var myIndices = [];
      var myPositions = [];
      var myNormals = [];

    //positions
    //front/back
    var num: number = 0;
    var neg: number = 0.5;
    while(num < 2) {
        myPositions.push(
            -0.5, -0.5, neg, 1,
            0.5, -0.5, neg, 1,
            0.5, 0.5, neg, 1,
            -0.5, 0.5, neg, 1);
        num++;
        neg = -0.5;
    }
    //top//bottom
    num = 0;
    neg = 0.5;
    while(num < 2) {
        myPositions.push(
            -0.5, neg, 0.5, 1,
            0.5, neg, 0.5, 1,
            0.5, neg, -0.5, 1,
            -0.5, neg, -0.5, 1);
        num++;
        neg = -0.5;
    }

    //left/right
    num = 0;
    neg = 0.5;
    while(num < 2) {
        myPositions.push(
            neg, 0.5, 0.5, 1,
            neg, 0.5, -0.5, 1,
            neg, -0.5, -0.5, 1,
            neg, -0.5, 0.5, 1);
        num++;
        neg = -0.5;
    }

    this.positions = Float32Array.from(myPositions);
    
    //normals
    //front/back
    num = 0;
    neg = 1;
    while(num < 2) {
        for(let y = 0; y < 4; ++y) {
            myNormals.push(0, 0, neg, 0);
        }
        for(let y = 0; y < 4; ++y) {
            myNormals.push(0, neg, 0, 0);
        }
        for(let y = 0; y < 4; ++y) {
            myNormals.push(neg, 0, 0, 0);
        }
        num++;
        neg = -1;
    }

    this.normals = Float32Array.from(myNormals);
    
    //indices  
    this.indices = new Uint32Array([0, 1, 2,
                                     0, 2, 3,
                                     4, 6, 5,
                                     4, 6, 7,                                     
                                     8, 9, 10,
                                     8, 10, 11,
                                     12, 13, 14,
                                     12, 14, 15,
                                     16, 17, 18,
                                     16, 18, 19,
                                     20, 21, 22,
                                     20, 22, 23,
                                    ]);
                           

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created cube`);
  }
};

export default Cube;

#version 300 es

//This is a vertex shader. While it is called a "shader" due to outdated conventions, this file
//is used to apply matrix transformations to the arrays of vertex data passed to it.
//Since this code is run on your GPU, each vertex is transformed simultaneously.
//If it were run on your CPU, each vertex would have to be processed in a FOR loop, one at a time.
//This simultaneous transformation allows your program to run much faster, especially when rendering
//geometry with millions of vertices.


uniform float u_Time; 
uniform float u_Length;

uniform mat4 u_Model;      
uniform mat4 u_ModelInvTr;  
uniform mat4 u_ViewProj;    

in vec4 vs_Pos;             
in vec4 vs_Nor;            
in vec4 vs_Col;             

out vec4 fs_Nor;            // The array of normals that has been transformed by u_ModelInvTr. This is implicitly passed to the fragment shader.
out vec4 fs_LightVec;       // The direction in which our virtual light lies, relative to each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Col;            // The color of each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Pos;

const vec4 lightPos = vec4(0, 0, 10, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.
float dist (vec3 x, vec3 y) {
    return pow((x.x - y.x), 2.0) + pow((x.y - y.y), 2.0) + pow((x.z - y.z), 2.0);
}


///	Simplex 3D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main()
{
    fs_Col = vs_Col;                         // Pass the vertex colors to the fragment shader for interpolation
    mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);

    //heart
    float x = vs_Pos.x;
    float y = vs_Pos.y;
    float z = vs_Pos.z;
    float w = vs_Pos.w;

    float x2 = x;
    float y2 = y;
    float z2 = z;

    float tune = pow(sin(u_Time * 0.05 + y / 25.0), 4.0);

    //heart shape
    y2 = (0.9 * y + (abs(x) * sqrt(20.0 + abs(x))/8.0));
    z2 = z * (0.4 +  y2/9.0);
    //z2 *= tune * 0.2;

    vec3 uv = vec3(x2, y2, z2);
    float e = snoise(uv) * 0.3;
    vec3 noise = vec3(e, e, e);
    float e2 = snoise(noise);
    vec3 noise2 = vec3(e2,e2,e2);
    float e3 = snoise(noise2);
    vec3 noise3 = vec3(e3,e3,e3); 
    //final
    vec4 change_Pos = vec4(x2, y2, z2, w) + vec4(noise3.xyz, 1.0) * 7.0 * fs_Nor * u_Length;

    float dist = dist(vec3(x2, y2, z2), vec3(0.0, 1.0, 0.0));

    if(dist < 0.2) {
        change_Pos *= 2.0;
    }

    vec4 modelposition = u_Model * change_Pos;   // Temporarily store the transformed vertex positions for use below
    fs_LightVec = lightPos - modelposition;  // Compute the direction in which the light source lies
    fs_Pos = modelposition;
    gl_Position = u_ViewProj * modelposition;// gl_Position is a built-in variable of OpenGL which is
                                             // used to render the final positions of the geometry's vertices
}

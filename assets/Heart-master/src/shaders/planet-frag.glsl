#version 300 es

precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform float u_Time;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

//	Simplex 3D Noise 
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

float dist (vec3 x, vec3 y) {
    return pow((x.x - y.x), 2.0) + pow((x.y - y.y), 2.0) + pow((x.z - y.z), 2.0);
}

void main()
{
    // Material base color (before shading)
        vec4 diffuseColor = u_Color;
        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec + vec4(sin(u_Time * 0.1))));

        float ambientTerm = 0.7;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.
    float x1 = fs_Pos.x;
    float y1 = fs_Pos.y;
    float z1 = fs_Pos.z;

    vec3 uv = fs_Pos.xyz;

    vec4 color = u_Color;
    float dist = dist(vec3(x1, y1 + 2.0, z1 - 1.0), vec3(0.0, 2.0, 0.0));
    
    float snoise = snoise(vec3(snoise(uv), snoise(uv), snoise(uv)));

    //create a mineral core
    if(dist < 0.35) {
        vec3 a = vec3(1.0, 0.82, 0.863);
        vec3 b = vec3(0.5,0.5,0.5);
        vec3 c = vec3(1.0,1.0,0.5);
        vec3 d = vec3(0.80,0.20,0.20);
        vec3 color = vec3(a + b * cos(2.0 * 3.14159 * (c * diffuseTerm + d)));
    }
    
    vec4 view_vec = fs_Pos * vec4(2.0, 2.0 , 8.0, 1.0);
    vec4 light_vec = fs_LightVec;
    vec4 average = normalize((view_vec + light_vec) / 2.0);
    vec4 normal = normalize(fs_Nor);

    float exp = 50.0;
    
    float SpecularIntensity = max(pow(dot(average, normal), exp), 0.0);

    //diffuseColor = vec4(color.rgb * lightIntensity + SpecularIntensity, 1.0);

    float x = sin(u_Time * 0.1);

    if(diffuseTerm > 0.99){
        color = diffuseColor * vec4(1.0, 1.0, 1.0, 1.0);
    } else if(diffuseTerm > 0.95){
        color = diffuseColor * vec4(0.95, 0.95, 0.95, 1.0);
    } else if(diffuseTerm > 0.90){
        color = diffuseColor * vec4(0.93, 0.93, 0.93, 1.0);
    } else if(diffuseTerm > 0.85){
        color = diffuseColor * vec4(0.8, 0.8, 0.8, 1.0);
    } else if(diffuseTerm > 0.75){
        color = diffuseColor * vec4(0.7, 0.7, 0.7, 1.0);
    } else if(diffuseTerm > 0.7){
        color = diffuseColor * vec4(0.6, 0.6, 0.6, 1.0);
    } else{
        color = diffuseColor * vec4(1.0, 0.9, 0.9, 1.0);
    }

    out_Col = vec4(color.rgb, 1.0);
}

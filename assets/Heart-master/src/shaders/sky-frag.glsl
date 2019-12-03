#version 300 es

precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform float u_Time;
uniform float u_Length;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col; // This is the final output color that you will see on your
// screen for the pixel that is currently being processed.

const vec3 a = vec3(0.4, 0.5, 0.8);
const vec3 b = vec3(0.2, 0.4, 0.2);
const vec3 c = vec3(1.0, 1.0, 2.0);
const vec3 d = vec3(0.25, 0.25, 0.0);

const vec3 e = vec3(0.2, 0.5, 0.8);
const vec3 f = vec3(0.2, 0.25, 0.5);
const vec3 g = vec3(1.0, 1.0, 0.1);
const vec3 h = vec3(0.0, 0.8, 0.2);

vec3 random3(vec3 c) {
    float j = 4096.0 * sin(dot(c,vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0 * j);
    j *= .125;
    r.x = fract(512.0 * j);
    j *= .125;
    r.y = fract(512.0 * j);
    return r - 0.5;
}

vec3 Gradient(float t)
{
return a + b * cos(6.2831 * (c * t + d));
}

vec3 Gradient2(float t)
{
return e + f * cos(6.2831 * (g * t + h));
}

float surflet(vec3 P, vec3 gridPoint)
{
// Compute falloff function by converting linear distance to a polynomial
float distX = abs(P.x - gridPoint.x);
float distY = abs(P.y - gridPoint.y);
float distZ = abs(P.z - gridPoint.z);
float tX = 1.0 - 6.0 * pow(distX, 5.0) + 15.0 * pow(distX, 4.0) - 10.0 * pow(distX, 3.0);
float tY = 1.0 - 6.0 * pow(distY, 5.0) + 15.0 * pow(distY, 4.0) - 10.0 * pow(distY, 3.0);
float tZ = 1.0 - 6.0 * pow(distZ, 5.0) + 15.0 * pow(distZ, 4.0) - 10.0 * pow(distZ, 3.0);

// Get the random vector for the grid point
vec3 gradient = random3(gridPoint);
// Get the vector from the grid point to P
vec3 diff = P - gridPoint;
// Get the value of our height field by dotting grid->P with our gradient
float height = dot(diff, gradient);
// Scale our height field (i.e. reduce it) by our polynomial falloff function
return height * tX * tY;
}

float PerlinNoise(vec3 uv)
{
// Tile the space
vec3 uv1 = floor(uv);
vec3 uv2 = uv1 + vec3(1,0,0);
vec3 uv3 = uv1 + vec3(0,1,0);
vec3 uv4 = uv1 + vec3(0,0,1);
vec3 uv5 = uv1 + vec3(1,0,1);
vec3 uv6 = uv1 + vec3(1,1,0);
vec3 uv7 = uv1 + vec3(1,1,1);
vec3 uv8 = uv1 + vec3(0,1,1);

return surflet(uv1, uv2) + surflet(uv1, uv3) + surflet(uv1, uv4) + surflet(uv1, uv5);
}


void main()
{

float x2 = fs_Pos.x;
float y2 = fs_Pos.y;
float z2 = fs_Pos.z;

//#define BASIC
//#define SUMMED
//#define ABSOLUTE
//#define RECURSIVE1
#define RECURSIVE2

vec3 uv = vec3(x2, y2, z2);
vec3 height;

#ifdef BASIC
// Basic Perlin noise
float perlin = PerlinNoise(uv);
height = vec3((perlin + 1.0) * 0.5);
height.r += step(0.98, fract(uv.x)) + step(0.98, fract(uv.y));
#endif

#ifdef SUMMED
float summedNoise = 0.0;
float amplitude = 0.2;
for(float i = 2.0; i <= 800.0; i *= 2.0) {
uv = vec3(cos(3.14159/3.0 * i) * uv.x - sin(3.14159/3.0 * i) * uv.y,
sin(3.14159/3.0 * i) * uv.x + cos(3.14159/3.0 * i) * uv.y,
sin(3.14159/3.0 * i) * uv.y + cos(3.14159/3.0 * i) * uv.z);
float perlin = abs(PerlinNoise(uv));// * amplitude;
summedNoise += perlin * amplitude;
amplitude *= 0.5;
}
height = vec3(summedNoise);//vec3((summedNoise + 1) * 0.5);
#endif

#ifdef ABSOLUTE
float perlin = PerlinNoise(uv);
height = vec3(1.0) - vec3(abs(perlin));
//color.r += step(0.98, fract(uv.x)) + step(0.98, fract(uv.y));
#endif

#ifdef RECURSIVE1
vec3 planet = vec3(cos(u_Time * 0.01 * 3.14159),
cos(u_Time * 0.01 * 3.14159),
sin(u_Time * 0.01 * 3.14159) * 2.0 + vec3(4.0));
vec3 planetDiff = planet - uv;
float len = length(planetDiff);
vec3 offset = vec3(PerlinNoise(uv + u_Time * 0.01), PerlinNoise(uv + vec3(5.2, 1.3, 1.3)), PerlinNoise(uv + vec3(5.2, 1.3, 1.3)));
if(len < 1.0) {
offset += planetDiff * (1.0 - len);
}
float perlin = PerlinNoise(uv + offset);
height = vec3((perlin + 1.0) * 0.5);
#endif

#ifdef RECURSIVE2
// Recursive Perlin noise (2 levels)
vec3 offset1 = vec3(PerlinNoise(uv + cos(u_Time * 3.14159 * 0.01)),
PerlinNoise(uv + vec3(5.2, 1.3, 1.3)),
PerlinNoise(uv + vec3(5.2, 1.3, 1.3)));
vec3 offset2 = vec3(PerlinNoise(uv + offset1 + vec3(1.7, 9.2, 1.3)),
PerlinNoise(uv + sin(u_Time * 3.14159 * 0.01) + offset1 + vec3(8.3, 2.8, 1.3)),
PerlinNoise(uv + sin(u_Time * 3.14159 * 0.01) + offset1 + vec3(8.3, 2.8, 1.3)));
float perlin = PerlinNoise(uv + offset2);
vec3 baseGradient = Gradient(perlin);
baseGradient = mix(baseGradient, vec3(perlin), length(offset1));
// baseGradient = mix(baseGradient, Gradient2(perlin), offset2.y);
height = baseGradient;
// color = vec3((perlin + 1) * 0.5);
#endif

// Material base color (before shading)
vec4 diffuseColor = vec4(1.0,0.2,0.2,1.0);

// Calculate the diffuse term for Lambert shading
float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
// Avoid negative lighting values
// diffuseTerm = clamp(diffuseTerm, 0, 1);

float ambientTerm = 0.3;

float lightIntensity = diffuseTerm + ambientTerm;

// Compute final shaded color
out_Col = diffuseColor * vec4(height.xyz, 1.0);
//out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}

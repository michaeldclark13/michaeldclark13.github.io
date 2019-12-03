#version 300 es

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

const vec4 lightPos = vec4(0.0, 0.0, 10.0, 1.0); 

float dist (vec3 x, vec3 y) {
    return pow((x.x - y.x), 2.0) + pow((x.y - y.y), 2.0) + pow((x.z - y.z), 2.0);
}

void main()
{
    fs_Col = vs_Col;                         // Pass the vertex colors to the fragment shader for interpolation
    mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);

    vec3 xyz = vec3(vs_Pos.xyz) * sin(u_Time * 0.1);

    //heart
    float x = vs_Pos.x;
    float y = vs_Pos.y;
    float z = vs_Pos.z;
    float w = vs_Pos.w;

    float x2 = x;
    float y2 = y;
    float z2 = z;

    //float tune = 0.2 + pow(sin (u_Length * u_Time + y / 25.0), 4.0);
    
    float tune = pow(sin(u_Time * 0.05 + y / 25.0), 4.0);
    
    //heart shape
    y2 = (0.9 * y + (abs(x) * sqrt(20.0 + abs(x))/8.0));
    z2 = z * (0.4 +  y2/9.0);
    //z2 *= tune;
    
    float dist = dist(vec3(x2, y2, z2), vec3(0.0, 1.0, 0.0));
    vec4 change_Pos = vec4(x2, y2, z2, w);

    if(dist < 0.9) {
        change_Pos *= 2.0;
    }


    vec4 modelposition = u_Model * change_Pos;   // Temporarily store the transformed vertex positions for use below

    fs_LightVec = sin(u_Time * 0.01) * lightPos - modelposition;  // Compute the direction in which the light source lies
    fs_Pos = modelposition;
    gl_Position = u_ViewProj * modelposition;// gl_Position is a built-in variable of OpenGL which is
                                             // used to render the final positions of the geometry's vertices
}

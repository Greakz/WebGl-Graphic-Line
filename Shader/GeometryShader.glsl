//#VERTEX-SHADER#//
#version 300 es
// mesh Data
layout(location = 0) in vec3 VertexPosition;
layout(location = 1) in vec3 VertexNormals;
layout(location = 2) in vec2 TexturePosition;


layout(location = 3) in mat4 mesh_matrix;
layout(location = 7) in mat4 model_matrix;

// material data
//uniform bool use_texture;
//uniform bool use_color;
uniform mat
{
    vec3 albedo_color;
    vec3 specular_color;
    vec3 shini_ucolor_utex;
};

// Camera Matrices
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 vColor;
out vec3 vNormals;
out vec2 vTexPos;
out float vShininess;

void main(void) {

    float shininess = shini_ucolor_utex.x;
    float useColor = shini_ucolor_utex.y;
    float useTex = shini_ucolor_utex.z;

    gl_Position = projection_matrix * view_matrix * model_matrix * mesh_matrix * vec4(VertexPosition, 1.0);
    vColor = albedo_color;
    vNormals = vec3(projection_matrix * view_matrix * model_matrix * mesh_matrix * vec4(VertexNormals, 0.0));
    vTexPos = TexturePosition;
    vShininess = shininess + useColor + useTex;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec3 vColor;
in vec3 vNormals;
in vec2 vTexPos;
in float vShininess;

uniform sampler2D albedo_texture;
uniform sampler2D specular_texture;

out vec4 fragmentColor;

void main(void) {
    fragmentColor = vec4(vec3(vTexPos, 1.0) + vNormals, 1.0) * vec4(vShininess) * vec4(0.0) +  vec4(vColor, 1.0);
}
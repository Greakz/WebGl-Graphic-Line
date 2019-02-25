//#VERTEX-SHADER#//
#version 300 es
// mesh Data
in vec3 VertexPosition;
in vec3 VertexNormal;
in vec2 TexturePosition;

// material data
uniform vec3 albedo_color;
uniform vec3 specular_color;
uniform float shininess;

// Object Matrices
uniform mat4 mesh_matrix;
uniform mat4 model_matrix;

// Camera Matrices
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 vColor;

void main(void) {
    VertexNormal;
    TexturePosition;
    gl_Position = projection_matrix * view_matrix * model_matrix * mesh_matrix * vec4(VertexPosition, 1.0);
    vColor = albedo_color;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec3 vColor;

uniform sampler2D albedo_texture;
uniform sampler2D specular_texture;

out vec4 fragmentColor;

void main(void) {
    fragmentColor = vec4(1.0, 0.5, 0.0, 1.0);
}
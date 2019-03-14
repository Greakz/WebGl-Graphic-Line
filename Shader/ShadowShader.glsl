//#VERTEX-SHADER#//
#version 300 es
// mesh Data
layout(location = 0) in vec3 VertexPosition;
layout(location = 1) in vec3 VertexNormals;
layout(location = 2) in vec2 TexturePosition;


layout(location = 3) in mat4 mesh_matrix;
layout(location = 7) in mat4 model_matrix;

// Camera Matrices
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

void main(void) {
    gl_Position = projection_matrix * view_matrix * model_matrix * mesh_matrix * vec4(VertexPosition, 1.0);
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;

layout(location = 0) out vec4 outPosition;

void main(void) {
    outPosition = vec4(vec3(gl_FragCoord.z), 1.0); // vec4(vec3(gl_FragCoord.z), 1.0);
}
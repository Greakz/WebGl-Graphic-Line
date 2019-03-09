//#VERTEX-SHADER#//
#version 300 es
// mesh Data
layout(location = 0) in vec3 VertexPosition;
layout(location = 1) in vec4 BulbColor;
layout(location = 2) in vec3 BulbPosition;

uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec4 vColor;

void main(void) {
    mat4 model_matrix = mat4(
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(BulbPosition, 1.0)
       );

    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(VertexPosition, 1.0);
    vColor = BulbColor;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec4 vColor;

layout(location = 0) out vec4 outColor;

void main(void) {
    outColor = vColor;
}
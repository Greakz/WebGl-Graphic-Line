//#VERTEX-SHADER#//
#version 300 es
in vec3 VertexPosition;

uniform vec3 albedo_color;
uniform vec3 specular_color;
uniform float shininess;

out vec4 vColor;


void main(void) {
    gl_Position = vec4(VertexPosition, 1.0);
    vColor = color;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 fragmentColor;

void main(void) {
    fragmentColor = vColor;
}
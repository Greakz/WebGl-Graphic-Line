//#VERTEX-SHADER#//
#version 300 es
// mesh Data
layout(location = 0) in vec3 VertexPosition;
layout(location = 1) in vec2 TexturePosition;

out vec2 vTexPos;

void main(void) {
    gl_Position = vec4(VertexPosition, 1.0);
    vTexPos = TexturePosition;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec2 vTexPos;

uniform sampler2D input_texture;

layout(location = 0) out vec4 fragmentColor;

void main(void) {
    fragmentColor = vec4(texture(input_texture, vTexPos).rgb, 1.0);
    // fragmentColor = vec4(vec3(texture(input_texture, vTexPos).rgb), texture(input_texture, vTexPos).w);
}
//#VERTEX-SHADER#//
#version 300 es
// mesh Data
layout(location = 0) in vec3 VertexPosition;
layout(location = 1) in vec2 TexturePosition;

out vec2 vTex;

void main(void) {
    // position!
    gl_Position = vec4(VertexPosition, 1.0);
    vTex = TexturePosition;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec2 vTex;


uniform sampler2D source;

// output
layout(location = 0) out vec4 outColor;

void main(void) {
    outColor = vec4(texture(source, vTex).rgb, 1.0);
}
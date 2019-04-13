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

const float weights[5] = float[5](0.3, 0.2, 0.15, 0.2, 0.2);

uniform sampler2D source;
uniform int vertical;
uniform int range;
// uniform sampler2D codiertemapblamitstencilinfos;

// output
layout(location = 0) out vec4 outBlurred;

void main(void) {
    ivec2 source_size = textureSize(source, 0).xy;

    vec2 pixel_size = vec2(
        1.0 / float(source_size.x),
        1.0 / float(source_size.y)
    );
    vec3 light_calc_pixel = texture(source, vTex).rgb;

    vec3 result = vec3(0.0);
    if(vertical == 1) {
        // perform vertical blur;
        for(int i = -range; i <= range; i++) {
            vec2 texPos = vTex + (pixel_size * vec2(0.0, float(i)));
            result += texture(source, texPos).rgb * vec3(weights[abs(i)]);
        }
    } else {
        // perform horizontal blur;
        for(int i = -range; i <= range; i++) {
            vec2 texPos = vTex + (pixel_size * vec2(float(i), 0.0));
            result += texture(source, texPos).rgb * vec3(weights[abs(i)]);
        }
    }
    outBlurred = vec4(result, 1.0);
}
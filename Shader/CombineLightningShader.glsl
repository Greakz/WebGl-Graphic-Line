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

uniform sampler2D light_calculation_results;
uniform sampler2D light_bulb_results;
// uniform sampler2D codiertemapblamitstencilinfos;

// output
layout(location = 0) out vec4 outCombine;
layout(location = 1) out vec4 outBrightness;

float getAddedComponents(vec3 vector) {
    return vector.x + vector.y + vector.z;
}

void main(void) {
    vec3 light_calc_pixel = texture(light_calculation_results, vTex).rgb;
    vec3 light_bulb_pixel = texture(light_bulb_results, vTex).rgb;

    //vec3 combine_pixel = (getAddedComponents(light_bulb_pixel) == 0) ? light_calc_pixel : light_bulb_pixel;
    vec3 combine_pixel = max(light_calc_pixel, vec3(0.0)) + max(light_bulb_pixel, vec3(0.0));

    outCombine = vec4(combine_pixel, 1.0);
    float added_comps = getAddedComponents(combine_pixel);
    if(added_comps > 2.0) {
        outBrightness = vec4(combine_pixel * vec3(added_comps / 3.0), 1.0);
    } else {
        outBrightness = vec4(vec3(0.0), 1.0);
    }
}